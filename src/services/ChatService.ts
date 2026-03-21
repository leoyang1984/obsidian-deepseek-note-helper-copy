import { App, MarkdownView, Notice, requestUrl, TFile, TFolder } from 'obsidian';
import type DeepSeekPlugin from '../main';
import { FileService } from './FileService';
import { chatMessages, addMessage, isProcessing, stopRequested, resetStop, lastSelection, pipelineResolversStore } from '../store';
import { get } from 'svelte/store';
import type { ChatMessage } from '../types';

export class ChatService {
    app: App;
    plugin: DeepSeekPlugin;
    fileService: FileService;
    toolCallDepth = 0;
    maxToolDepth = 10;
    pipelineResolvers = new Map<string, (val: string | null) => void>();

    constructor(app: App, plugin: DeepSeekPlugin) {
        this.app = app;
        this.plugin = plugin;
        this.fileService = new FileService(app, plugin.settings);
    }

    async requestUserApproval(stepId: string, currentContent: string): Promise<string | null> {
        return new Promise((resolve) => {
            const resolverId = `pipeline-approval-${stepId}-${Date.now()}`;
            
            pipelineResolversStore.update(map => {
                map.set(resolverId, resolve);
                return map;
            });
            
            addMessage({
                role: 'pipeline-approval',
                content: currentContent,
                pipeline_data: { stepId, resolverId }
            });
        });
    }

    async handleSend(instruction: string) {
        if (get(isProcessing) || !instruction.trim()) return;

        isProcessing.set(true);
        resetStop();
        this.toolCallDepth = 0;

        addMessage({ role: 'user', content: instruction });
        this.plugin.logger.log('chat', 'user', instruction);

        let additionalContext = '';
        const links = instruction.match(/\[\[([^\]]+)\]\]/g);
        if (links) {
            additionalContext += "\n\n[CRITICAL CONTEXT: The following notes were mentioned. Use this content directly instead of searching.]\n";
            for (const link of links) {
                const path = link.slice(2, -2);
                const file = await this.fileService.resolveFile(path);
                if (file) {
                    const content = await this.app.vault.read(file);
                    additionalContext += `\n--- Content of [[${file.basename}]] ---\n${content}\n`;
                }
            }
        }

        const activeFile = this.app.workspace.getActiveFile();
        let linkedNotesContext = '';

        if (activeFile) {
            const cache = this.app.metadataCache.getFileCache(activeFile);
            if (cache && cache.links) {
                const uniqueLinks = Array.from(new Set(cache.links.map(l => l.link)));
                for (const linkPath of uniqueLinks) {
                    const linkedFile = this.app.metadataCache.getFirstLinkpathDest(linkPath, activeFile.path);
                    if (linkedFile instanceof TFile && linkedFile.extension === 'md') {
                        const linkedContent = await this.app.vault.read(linkedFile);
                        const truncatedContent = linkedContent.length > 1500 ? linkedContent.substring(0, 1500) + '... (truncated)' : linkedContent;
                        linkedNotesContext += `\n--- Linked Note: [[${linkedFile.basename}]] ---\n${truncatedContent}\n`;
                    }
                }
            }
        }

        const currentSelection = get(lastSelection);
        if (currentSelection && activeFile) {
            additionalContext += `\n\n[System Info: The user highlighted the following text in the note "${activeFile.name}". Focus your answer specifically around this highlighted text:\n---\n${currentSelection}\n---]`;
            lastSelection.set(''); // clear it
        } else if (activeFile) {
            const content = await this.app.vault.read(activeFile);
            additionalContext += `\n\n[System Info: The user is currently viewing the note "${activeFile.name}". Its full content is:\n---\n${content}\n---]`;
        }

        if (linkedNotesContext) {
            additionalContext += `\n\n[System Info: The active note contains links to the following notes. Here is their content for additional context:\n${linkedNotesContext}]`;
        }

        // Inject Canvas Context if applicable
        if (activeFile && activeFile.extension === 'canvas') {
            const canvasCtx = await this.fileService.executeReadCanvas(activeFile.path);
            additionalContext += `\n\n[System Info: The user is currently viewing a Canvas file. Here is its structural context:\n${canvasCtx}]`;
        }

        try {
            const finalPrompt = instruction + additionalContext;

            const customSkills = Array.from(this.plugin.skillManager.skills.values())
                 .map(s => s.name)
                 .join(', ');
            const skillsCtx = customSkills ? `\\n\\n[System Info: The user has custom Light Skills installed: ${customSkills}. You can execute these using the run_command tool by providing their name.]` : '';

            const messages: ChatMessage[] = [
                { role: 'system', content: 'You are a helpful AI assistant integrated into Obsidian. You can converse naturally with the user. If they provide note context in [CRITICAL CONTEXT] blocks, ALWAYS check that context first before using any search or read tools to save time and tokens.' + skillsCtx }
            ];

            const currentHistory = get(chatMessages);
            const validRoles = ['user', 'assistant', 'system', 'tool'];
            const recentHistory = currentHistory
                .filter(msg => validRoles.includes(msg.role))
                .slice(-10);
                
            recentHistory.forEach(msg => {
                const apiMsg: any = { role: msg.role, content: msg.content };
                if (msg.tool_calls) apiMsg.tool_calls = msg.tool_calls;
                if (msg.tool_call_id) apiMsg.tool_call_id = msg.tool_call_id;
                if (msg.name) apiMsg.name = msg.name;
                // @ts-ignore
                messages.push(apiMsg);
            });

            messages.push({ role: 'user', content: finalPrompt });

            await this.processConversationStream(messages, finalPrompt);
        } catch (error) {
            console.error('Deepseek error:', error);
            const errorMsg = error instanceof Error ? error.message : String(error);
            new Notice('API error: ' + errorMsg);
            addMessage({ role: 'system', content: 'Error: ' + errorMsg });
        } finally {
            isProcessing.set(false);
        }
    }

    async processConversationStream(messages: ChatMessage[], originalUserPrompt: string) {
        if (get(stopRequested)) {
            addMessage({ role: 'system', content: 'Execution stopped by user.' });
            return;
        }

        if (this.toolCallDepth >= this.maxToolDepth) {
            addMessage({ role: 'system', content: 'Error: Maximum tool call depth reached. Stopping to prevent infinite loop.' });
            return;
        }

        const { provider, apiKeys, apiUrl, model } = this.plugin.settings;
        const apiKey = apiKeys[provider];

        if (!apiKey) {
            throw new Error(`API Key not set for provider ${provider}.`);
        }

        const tools = [
            {
                type: "function",
                function: {
                    name: "read_note",
                    description: "Reads the full content of a specific markdown note. Use this when you have a file path and need to summarize or fully understand its content.",
                    parameters: { type: "object", properties: { path: { type: "string", description: "The path or name of the note to read (e.g. 'Daily/2026-03-16.md' or 'Note Name')" } }, required: ["path"] }
                }
            },
            {
                type: "function",
                function: {
                    name: "search_vault",
                    description: "Search the entire Obsidian vault for files matching a keyword query.",
                    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
                }
            },
            {
                type: "function",
                function: {
                    name: "update_metadata",
                    description: "Update the YAML frontmatter / metadata of the active note.",
                    parameters: { type: "object", properties: { properties: { type: "object" } }, required: ["properties"] }
                }
            },
            {
                type: "function",
                function: {
                    name: "create_note",
                    description: "Create a new markdown note in the vault at the specified path.",
                    parameters: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] }
                }
            },
            {
                type: "function",
                function: {
                    name: "append_to_note",
                    description: "Append new content to the end of an existing note.",
                    parameters: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] }
                }
            },
            {
                type: "function",
                function: {
                    name: "modify_files_in_directory",
                    description: "Get a list of all markdown files in a directory to perform bulk operations.",
                    parameters: { type: "object", properties: { directory_path: { type: "string" }, instruction: { type: "string" } }, required: ["directory_path", "instruction"] }
                }
            },
            {
                type: "function",
                function: {
                    name: "run_command",
                    description: "Execute an Obsidian command. Provide English keywords (e.g., 'toggle left sidebar', 'local graph', 'focus', 'fast polish'). DO NOT guess exact command IDs with colons or hyphens unless you are certain; just use descriptive keywords.",
                    parameters: { type: "object", properties: { command_id: { type: "string" } }, required: ["command_id"] }
                }
            }
        ];

        try {
            const requestBody = { model, messages, stream: false, tools };
            let finalUrl = apiUrl || "https://api.deepseek.com/v1/chat/completions";
            if (apiUrl && !apiUrl.endsWith('/chat/completions')) {
                finalUrl = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
            }

            const response = await requestUrl({
                url: finalUrl,
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify(requestBody)
            });

            if (get(stopRequested)) {
                addMessage({ role: 'system', content: 'Execution stopped by user.' });
                return;
            }

            const data = response.json;
            const resMsg = data.choices[0].message;
            const fullResponse = resMsg.content || '';
            const toolCalls = resMsg.tool_calls || [];

            if (toolCalls.length > 0) {
                messages.push(resMsg);
                
                // Add the explicit tool-calling assistant message into UI store 
                // so subsequent API prompts can construct valid conversations
                addMessage({ role: 'assistant', content: fullResponse, tool_calls: toolCalls });

                const results = [];
                for (const tc of toolCalls) {
                    const name = tc.function.name;
                    const args = JSON.parse(tc.function.arguments || '{}');
                    let result = '';
                    
                    try {
                        if (name === 'read_note') result = await this.fileService.executeReadNote(args.path);
                        else if (name === 'search_vault') result = await this.fileService.executeSearchVault(args.query);
                        else if (name === 'update_metadata') result = await this.fileService.executeUpdateMetadata(args.properties);
                        else if (name === 'create_note') result = await this.fileService.executeCreateNote(args.path, args.content);
                        else if (name === 'append_to_note') result = await this.fileService.executeAppendToNote(args.path, args.content);
                        else if (name === 'modify_files_in_directory') result = await this.fileService.executeModifyDirectory(args.directory_path, args.instruction);
                        else if (name === 'run_command') result = await this.executeRunCommand(args.command_id);
                        else result = `Error: Unknown tool ${name}`;
                        
                        this.plugin.logger.log('tool', 'tool', `Executed ${name}`, { arguments: args, result });
                        await new Promise(resolve => setTimeout(resolve, 100)); // small delay UI settle
                    } catch (e) {
                        result = `Error executing tool: ${e instanceof Error ? e.message : String(e)}`;
                        this.plugin.logger.log('tool', 'tool', `Failed to execute ${name}`, { arguments: tc.function.arguments, error: result });
                    }
                    results.push({ id: tc.id, name, result });
                }

                for (const res of results) {
                    messages.push({ role: 'tool', tool_call_id: res.id, name: res.name, content: res.result });
                    addMessage({ role: 'tool', tool_call_id: res.id, name: res.name, content: `=> Used tool: ${res.name}\n=> Result snippet: ${res.result.substring(0, 100)}...` });
                }

                this.toolCallDepth++;
                await this.processConversationStream(messages, originalUserPrompt);
                return;
            }

            // Normal response
            if (originalUserPrompt) {
                const cleanPrompt = originalUserPrompt.split('\n\n[System Info')[0];
                const hist = get(chatMessages);
                
                // Check if the user prompt is already in the history recently (e.g. before the tool call)
                // We just check the last few messages to see if it matches.
                let alreadyExists = false;
                for (let i = hist.length - 1; i >= Math.max(0, hist.length - 5); i--) {
                    if (hist[i].role === 'user' && hist[i].content === cleanPrompt) {
                        alreadyExists = true;
                        break;
                    }
                }
                
                if (!alreadyExists) {
                    addMessage({ role: 'user', content: cleanPrompt });
                }
            }

            addMessage({ role: 'assistant', content: fullResponse });
            this.plugin.logger.log('chat', 'assistant', fullResponse);

        } catch (e) {
            throw e;
        }
    }

    async executeRunCommand(commandId: string): Promise<string> {
        try {
            await this.plugin.skillManager.executor.executeCommand(commandId, this.app.workspace.getActiveViewOfType(MarkdownView));
            return `Successfully triggered command: ${commandId}`;
        } catch (e) {
            return `Error running command ${commandId}: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async exportLogs() {
        const md = this.plugin.logger.getMarkdown();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `Execution-Log-${timestamp}.md`;
        const logDir = this.plugin.settings.logDirectory || 'DeepSeek-Logs';
        
        const folder = this.app.vault.getAbstractFileByPath(logDir);
        if (!folder) {
            await this.app.vault.createFolder(logDir);
        } else if (!(folder instanceof TFolder)) {
            new Notice(`Error: ${logDir} already exists as a file. Please change the log directory in settings.`);
            return;
        }

        const path = `${logDir}/${fileName}`;

        try {
            await this.app.vault.create(path, md);
            new Notice(`Logs exported to ${path}`);
            
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                await this.app.workspace.getLeaf().openFile(file);
            }
        } catch (e) {
            console.error('Failed to export logs:', e);
            new Notice('Failed to export logs: ' + (e instanceof Error ? e.message : String(e)));
        }
    }
}
