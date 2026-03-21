import { ItemView, WorkspaceLeaf, Notice, TFile, TFolder, requestUrl, MarkdownRenderer, MarkdownView } from 'obsidian';
import DeepSeekPlugin from './main';

export const DEEPSEEK_VIEW_TYPE = 'deepseek-chat-view';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string | null;
    tool_calls?: Array<{ id: string, type: string, function: { name: string, arguments: string } }>;
    tool_call_id?: string;
    name?: string;
}

export class DeepSeekView extends ItemView {
    plugin: DeepSeekPlugin;
    chatContainer!: HTMLElement;
    inputEl!: HTMLTextAreaElement;
    messageHistory: ChatMessage[] = [];
    lastSelection: string = '';
    isProcessing: boolean = false;
    stopRequested: boolean = false;
    stopBtn!: HTMLButtonElement;
    toolCallDepth: number = 0;
    maxToolDepth: number = 10;

    constructor(leaf: WorkspaceLeaf, plugin: DeepSeekPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return DEEPSEEK_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'AI Note Helper';
    }

    getIcon(): string {
        return 'bot';
    }

    getAssistantName(): string {
        switch (this.plugin.settings.provider) {
            case 'deepseek': return 'DeepSeek';
            case 'kimi': return 'Kimi';
            case 'openai': return 'ChatGPT';
            default: return 'Assistant';
        }
    }

    async onOpen() {
        await Promise.resolve();
        // Cache selection aggressively so losing focus doesn't drop it
        this.registerEvent(
            this.app.workspace.on('editor-change', (editor) => {
                const selection = editor.getSelection();
                if (selection) {
                    this.lastSelection = selection;
                }
            })
        );

        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        container.addClass('deepseek-chat-container');

        this.chatContainer = container.createDiv({ cls: 'chat-messages' });
        const inputContainer = container.createDiv({ cls: 'chat-input-container' });
        
        const actionBtnContainer = inputContainer.createDiv({ cls: 'chat-action-btns' });
        
        this.stopBtn = actionBtnContainer.createEl('button', { text: 'Stop', cls: 'chat-stop-btn' }) as HTMLButtonElement;
        this.stopBtn.disabled = true;
        this.stopBtn.onclick = () => {
            this.stopRequested = true;
            this.stopBtn.disabled = true;
            this.stopBtn.innerText = 'Stopping...';
            new Notice('Stopping AI execution...');
        };
        
        const exportBtn = actionBtnContainer.createEl('button', { text: 'Export Logs', cls: 'chat-export-btn' });
        exportBtn.addEventListener('click', () => {
            void this.exportLogs().catch(console.error);
        });

        const clearBtn = actionBtnContainer.createEl('button', { text: 'Clear Chat' });
        clearBtn.onclick = () => {
            this.messageHistory = [];
            this.chatContainer.empty();
            this.plugin.logger.clear();
            new Notice('Chat and logs cleared.');
        };

        this.inputEl = inputContainer.createEl('textarea', { cls: 'chat-input' });
        this.inputEl.placeholder = 'Type your message... (Shift+enter for newline, Enter to send)';
        const sendBtn = inputContainer.createEl('button', { text: 'Send' });
        sendBtn.addClass('mod-cta');
        sendBtn.addEventListener('click', () => {
            void this.handleSend().catch(console.error);
        });

        this.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default newline
                void this.handleSend().catch(console.error);
            }
        });

        // Initial greeting
        this.appendMessage('assistant', 'Hello! Ask me anything. If you highlight text in your note, I will remember it and focus on that. I can also search your entire vault or update your note metadata if you ask me to!').catch(console.error);
    }

    async handleSend() {
        if (this.isProcessing) return;
        const instruction = this.inputEl.value.trim();
        if (!instruction) return;

        this.isProcessing = true;
        this.stopRequested = false;
        this.toolCallDepth = 0;
        this.stopBtn.disabled = false;
        this.stopBtn.innerText = 'Stop';

        await this.appendMessage('user', instruction);
        this.plugin.logger.log('chat', 'user', instruction);
        this.inputEl.value = '';

        // Auto-Context Injection: Scan for [[links]] and prepend content
        let additionalContext = '';
        const links = instruction.match(/\[\[([^\]]+)\]\]/g);
        if (links) {
            additionalContext += "\n\n[CRITICAL CONTEXT: The following notes were mentioned. Use this content directly instead of searching.]\n";
            for (const link of links) {
                const path = link.slice(2, -2);
                const file = await this.resolveFile(path);
                if (file) {
                    const content = await this.app.vault.read(file);
                    additionalContext += `\n--- Content of [[${file.basename}]] ---\n${content}\n`;
                }
            }
        }

        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

        // Fallback getting active view directly just in case event missed it, but prioritize cache if exists
        if (activeView) {
            const currentSelection = activeView.editor.getSelection();
            if (currentSelection) {
                this.lastSelection = currentSelection;
            }
        }

        const activeFile = this.app.workspace.getActiveFile();
        let linkedNotesContext = '';

        if (activeFile) {
            // Attempt to fetch bidirectional links
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

        if (this.lastSelection && activeFile) {
            additionalContext += `\n\n[System Info: The user highlighted the following text in the note "${activeFile.name}". Focus your answer specifically around this highlighted text:\n---\n${this.lastSelection}\n---]`;
            // Clear it after using it so it doesn't leak into unrelated future queries
            this.lastSelection = '';
        } else if (activeFile) {
            const content = await this.app.vault.read(activeFile);
            additionalContext += `\n\n[System Info: The user is currently viewing the note "${activeFile.name}". Its full content is:\n---\n${content}\n---]`;
        }

        if (linkedNotesContext) {
            additionalContext += `\n\n[System Info: The active note contains links to the following notes. Here is their content for additional context:\n${linkedNotesContext}]`;
        }

        try {
            const finalPrompt = instruction + additionalContext;

            const messages: ChatMessage[] = [
                { role: 'system', content: 'You are a helpful AI assistant integrated into Obsidian. You can converse naturally with the user. If they provide note context in [CRITICAL CONTEXT] blocks, ALWAYS check that context first before using any search or read tools to save time and tokens.' }
            ];

            const recentHistory = this.messageHistory.slice(-10);
            recentHistory.forEach(msg => messages.push(msg));

            // We only send the new prompt with context this time
            messages.push({ role: 'user', content: finalPrompt });

            await this.processConversationStream(messages, finalPrompt);
        } catch (error) {
            console.error('Deepseek error:', error);
            const errorMsg = error instanceof Error ? error.message : String(error);
            new Notice('API error: ' + errorMsg);
            await this.appendMessage('system', 'Error: ' + errorMsg);
        } finally {
            this.isProcessing = false;
            this.stopBtn.disabled = true;
            this.stopBtn.innerText = 'Stop';
        }
    }

    /**
     * Specialized UI for Pipeline human-in-the-loop intervention.
     * Renders a card with an editable textarea and [Continue/Cancel] buttons.
     */
    async requestUserApproval(stepId: string, currentContent: string): Promise<string | null> {
        return new Promise((resolve) => {
            const msgDiv = this.chatContainer.createDiv({ cls: 'chat-msg role-assistant pipeline-approval' });
            
            const headerDiv = msgDiv.createDiv({ cls: 'msg-header' });
            headerDiv.createEl('strong', { text: `Pipeline Pause: ${stepId}`, cls: 'chat-sender-label' });
            
            msgDiv.createEl('p', { text: 'AI has generated the following. You can edit it before continuing:', cls: 'pipeline-instruction' });
            
            const editArea = msgDiv.createEl('textarea', { cls: 'chat-input pipeline-edit-area' });
            editArea.value = currentContent;
            editArea.rows = 5;

            const buttonContainer = msgDiv.createDiv({ cls: 'pipeline-buttons' });
            
            const continueBtn = buttonContainer.createEl('button', { text: '✅ Continue', cls: 'mod-cta' });
            const cancelBtn = buttonContainer.createEl('button', { text: '❌ Cancel Pipeline' });

            continueBtn.onclick = () => {
                const finalValue = editArea.value;
                msgDiv.addClass('pipeline-resolved');
                continueBtn.disabled = true;
                cancelBtn.disabled = true;
                editArea.disabled = true;
                headerDiv.createEl('span', { text: ' (Resumed)', cls: 'pipeline-status' });
                resolve(finalValue);
            };

            cancelBtn.onclick = () => {
                msgDiv.addClass('pipeline-cancelled');
                continueBtn.disabled = true;
                cancelBtn.disabled = true;
                editArea.disabled = true;
                headerDiv.createEl('span', { text: ' (Cancelled)', cls: 'pipeline-status' });
                resolve(null); // Signal cancellation
            };

            // Scroll to bottom
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        });
    }

    async appendMessage(role: 'user' | 'assistant' | 'system' | 'tool', text: string) {
        if (role !== 'system' && role !== 'tool') {
            this.messageHistory.push({ role, content: text });
            if (role === 'assistant') {
                this.plugin.logger.log('chat', 'assistant', text);
            }
        }

        const msgDiv = this.chatContainer.createDiv({ cls: `chat-msg role-${role}` });
        const assistantName = this.getAssistantName();
        const senderName = role === 'user' ? 'You' : (role === 'assistant' ? assistantName : (role === 'tool' ? 'Tool' : 'System'));

        const headerDiv = msgDiv.createDiv({ cls: 'msg-header' });
        headerDiv.createEl('strong', {
            text: senderName,
            cls: 'chat-sender-label'
        });

        if (role === 'assistant') {
            const copyBtn = headerDiv.createEl('button', {
                text: 'Copy',
                cls: 'clickable-icon chat-copy-btn'
            });
            copyBtn.addEventListener('click', () => {
                void (async () => {
                    await navigator.clipboard.writeText(text);
                    copyBtn.innerText = 'Copied!';
                    setTimeout(() => { copyBtn.innerText = 'Copy'; }, 2000);
                })().catch(console.error);
            });
        }

        const contentDiv = msgDiv.createDiv({ cls: 'msg-content' });

        if (role === 'user' || role === 'system' || role === 'tool') {
            contentDiv.addClass('chat-whitespace-pre');
            contentDiv.innerText = text;
            msgDiv.addClass(role === 'user' ? 'chat-msg-user' : 'chat-msg-system');
        } else {
            msgDiv.addClass('chat-msg-assistant');
            // Render markdown for assistant responses
            await MarkdownRenderer.render(this.app, text, contentDiv, '', this);
        }

        this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
    }

    async executeReadNote(path: string): Promise<string> {
        const file = await this.resolveFile(path);
        if (!file) return `Error: Note "${path}" not found. Try searching for it first.`;
        const content = await this.app.vault.read(file);
        return `Full content of [[${file.basename}]] (Path: ${file.path}):\n\n${content}`;
    }

    async resolveFile(pathStr: string): Promise<TFile | null> {
        // 1. Try exact path first
        let file = this.app.vault.getAbstractFileByPath(pathStr);
        if (file instanceof TFile) return file;

        // 2. Try adding .md if missing
        if (!pathStr.endsWith('.md')) {
            file = this.app.vault.getAbstractFileByPath(pathStr + '.md');
            if (file instanceof TFile) return file;
        }

        // 3. Try to find by basename globally (most common failure case)
        const basename = pathStr.split('/').pop()?.replace('.md', '') || pathStr;
        const allFiles = this.app.vault.getMarkdownFiles();
        const found = allFiles.find(f => f.basename.toLowerCase() === basename.toLowerCase());
        return found || null;
    }

    async executeSearchVault(query: string): Promise<string> {
        const files = this.app.vault.getMarkdownFiles();
        const results: string[] = [];
        const lowerQuery = query.toLowerCase();
        
        const logDir = (this.plugin.settings.logDirectory || 'DeepSeek-Logs').toLowerCase();
        const skillsDir = (this.plugin.settings.skillsDirectory || 'DeepSeek-Skills').toLowerCase();

        // 1. Filter out logs and skills to prevent pollution - more aggressive match
        let filteredFiles = files.filter(file => {
            const path = file.path.toLowerCase();
            if (path.includes(logDir)) return false;
            if (path.includes(skillsDir)) return false;
            return true;
        });

        // 2. Prioritize exact basename matches (No longer just headers, content will be added below)
        const exactMatches = filteredFiles.filter(f => f.basename.toLowerCase() === lowerQuery);
        
        // 3. Sort by last modified for the rest
        filteredFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);

        // Put exact matches first in the search process
        const sortedFiles = [...exactMatches, ...filteredFiles.filter(f => !exactMatches.includes(f))];

        for (const file of sortedFiles) {
            const content = await this.app.vault.cachedRead(file);
            const contentLower = content.toLowerCase();
            const nameLower = file.basename.toLowerCase();
            const pathLower = file.path.toLowerCase();
            
            if (contentLower.includes(lowerQuery) || nameLower.includes(lowerQuery) || pathLower.includes(lowerQuery)) {
                const isExactMatch = nameLower === lowerQuery;
                const matchIndex = contentLower.includes(lowerQuery) ? contentLower.indexOf(lowerQuery) : 0;
                const start = Math.max(0, matchIndex - 60);
                const end = Math.min(content.length, matchIndex + 140);
                
                if (isExactMatch) {
                    // Return LARGER snippet or full content for exact matches to save a 'read_note' turn
                    const fullOrLarge = content.length < 3000 ? content : content.substring(0, 3000) + '... (truncated, use read_note for full)';
                    results.push(`--- EXACT MATCH: [[${file.basename}]] (Path: ${file.path}) ---\nFull/Large snippet content:\n${fullOrLarge}\n`);
                } else {
                    results.push(`--- File: [[${file.basename}]] (Path: ${file.path}) ---\n...${content.substring(start, end)}\n`);
                }
                
                if (results.length >= 5) break; 
            }
        }

        if (results.length === 0) return `No files found matching "${query}".`;
        return `Search results for "${query}" (Excluding logs/skills):\n\n` + results.join('\n');
    }

    async executeUpdateMetadata(properties: Record<string, string | number | boolean | string[]>): Promise<string> {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return "Error: No active file to update.";

        try {
            await this.app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
                for (const [key, value] of Object.entries(properties)) {
                    frontmatter[key] = value;
                }
            });
            return `Successfully updated metadata for ${activeFile.basename}.`;
        } catch (e) {
            return `Failed to update metadata: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async executeCreateNote(path: string, content: string): Promise<string> {
        try {
            // Ensure path ends with .md
            if (!path.endsWith('.md')) path += '.md';

            // Normalize path (remove leading slash if present)
            const normalizedPath = path.replace(/^\//, '');

            const fileExists = this.app.vault.getAbstractFileByPath(normalizedPath);
            if (fileExists) {
                return `Error: File already exists at path ${normalizedPath}`;
            }

            await this.app.vault.create(normalizedPath, content);
            return `Successfully created new note at ${normalizedPath}`;
        } catch (e) {
            return `Failed to create note: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async executeAppendToNote(path: string, content: string): Promise<string> {
        try {
            if (!path.endsWith('.md')) path += '.md';
            const file = await this.resolveFile(path);
            if (!file) {
                return `Error: Markdown file not found for "${path}". Try searching for it first if you're unsure of the path.`;
            }

            await this.app.vault.append(file, '\n' + content);
            return `Successfully appended content to ${file.path}`;
        } catch (e) {
            return `Failed to append to note: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async executeModifyDirectory(directoryPath: string, instruction: string): Promise<string> {
        await Promise.resolve();
        try {
            const normalizedPath = directoryPath.replace(/^\//, '').replace(/\/$/, '');
            const folder = normalizedPath === '' ? this.app.vault.getRoot() : this.app.vault.getAbstractFileByPath(normalizedPath);

            if (!folder) {
                return `Error: Directory not found at path ${normalizedPath || '/'}`;
            }

            // In a real production environment, you would want to confirm this with the user via a modal.
            // For now, we will return a message instructing the AI that it needs user permission first,
            // or we just execute it directly as requested since the user approved the plan.

            // To be safe but functional for the prompt, we'll execute it, but we won't actually let the AI rewrite 
            // the whole file in one function without seeing it. Instead, we'll tell the AI what files are there and ask it to use append/modify.
            // Actually, the plan says "bulk modify". Let's just return the list of files to the AI so it can call `append_to_note` or `update_metadata` on them iteratively.
            // Doing a full bulk string replace in one prompt is too risky.

            const markdownFiles: TFile[] = [];

            // Recursive helper to get all MD files
            const getFiles = (f: import("obsidian").TAbstractFile) => {
                if (f instanceof TFolder) {
                    for (const child of f.children) {
                        getFiles(child);
                    }
                } else if (f instanceof TFile && f.extension === 'md') {
                    markdownFiles.push(f);
                }
            };

            getFiles(folder);

            if (markdownFiles.length === 0) {
                return `No markdown files found in directory ${normalizedPath || '/'}`;
            }

            // We return a list of paths back to the model, instructing it to use the other tools to actually make the changes.
            const filePaths = markdownFiles.map(f => f.path).join(', ');
            return `Found ${markdownFiles.length} files in directory ${normalizedPath || '/'}. The files are: ${filePaths}. \nTo apply the instruction "${instruction}", please call 'update_metadata' or 'append_to_note' on these files one by one.`;
        } catch (e) {
            return `Failed to process directory: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async processConversationStream(messages: ChatMessage[], originalUserPrompt: string) {
        if (this.stopRequested) {
            await this.appendMessage('system', 'Execution stopped by user.');
            return;
        }

        if (this.toolCallDepth >= this.maxToolDepth) {
            await this.appendMessage('system', 'Error: Maximum tool call depth reached. Stopping to prevent infinite loop.');
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
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "The path or name of the note to read (e.g. 'Daily/2026-03-16.md' or 'Note Name')" }
                        },
                        required: ["path"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "search_vault",
                    description: "Search the entire Obsidian vault for files matching a keyword query. Use this when the user asks about past files, vault contents, or broader knowledge outside the current note.",
                    parameters: {
                        type: "object",
                        properties: {
                            query: { type: "string", description: "The keyword or phrase to search for." }
                        },
                        required: ["query"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "update_metadata",
                    description: "Update the YAML frontmatter / metadata of the active note. Use this if the user asks you to add tags, change status, or edit properties.",
                    parameters: {
                        type: "object",
                        properties: {
                            properties: {
                                type: "object",
                                description: "Key-value pairs to set in the frontmatter. For tags, use an array of strings."
                            }
                        },
                        required: ["properties"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "create_note",
                    description: "Create a new markdown note in the vault at the specified path.",
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "The path including filename where the note should be created, e.g. 'Daily/2026-01-01.md'." },
                            content: { type: "string", description: "The initial markdown content of the new note." }
                        },
                        required: ["path", "content"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "append_to_note",
                    description: "Append new content to the end of an existing note.",
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "The path of the existing note, e.g. 'Ideas/Project.md'." },
                            content: { type: "string", description: "The content to append to the end of the note." }
                        },
                        required: ["path", "content"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "modify_files_in_directory",
                    description: "Get a list of all markdown files in a directory to perform bulk operations.",
                    parameters: {
                        type: "object",
                        properties: {
                            directory_path: { type: "string", description: "The path of the directory to scan, e.g. 'Work/Projects'. Use '/' for the root vault." },
                            instruction: { type: "string", description: "A description of what needs to be changed across these files." }
                        },
                        required: ["directory_path", "instruction"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "run_command",
                    description: "Execute an Obsidian command. Provide keywords from the Command Palette name/ID. Tip: Including the plugin name (e.g. 'Templater' or 'Graph') helps matching. For example: 'toggle-left-sidebar' or 'Graph local graph'.",
                    parameters: {
                        type: "object",
                        properties: {
                            command_id: { type: "string", description: "Keywords or ID of the command, e.g. 'open local graph' or 'Templater insert'." }
                        },
                        required: ["command_id"]
                    }
                }
            }
        ];

        // Prepare UI for streaming response
        const msgDiv = this.chatContainer.createDiv({ cls: `chat-msg role-assistant` }); msgDiv.addClass('chat-msg-assistant');
        const assistantName = this.getAssistantName();
        const headerDiv = msgDiv.createDiv({ cls: 'msg-header' });
        const senderLabel = headerDiv.createEl('strong', {
            text: `${assistantName} (thinking...)`,
            cls: 'chat-sender-label'
        });

        const copyBtn = headerDiv.createEl('button', {
            text: 'Copy',
            cls: 'clickable-icon chat-copy-btn chat-hidden'
        });

        const contentDiv = msgDiv.createDiv({ cls: 'msg-content' });
        
        try {
            const requestBody = {
                model: model,
                messages: messages,
                stream: false,
                tools: tools
            };

            let finalUrl = apiUrl || "https://api.deepseek.com/v1/chat/completions";
            if (apiUrl && !apiUrl.endsWith('/chat/completions')) {
                finalUrl = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
            }

            const response = await requestUrl({
                url: finalUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (this.stopRequested) {
                await this.appendMessage('system', 'Execution stopped by user.');
                return;
            }

            const data = response.json;
            const resMsg = data.choices[0].message;
            const fullResponse = resMsg.content || '';
            const toolCalls = resMsg.tool_calls || [];

            if (toolCalls.length > 0) {
                senderLabel.innerText = `${assistantName} (running ${toolCalls.length} tools...)`;
                
                // Track the assistant message containing tool calls
                messages.push(resMsg);

                // Execute all tool calls in parallel
                const toolPromises = toolCalls.map(async (tc: any) => {
                    const name = tc.function.name;
                    const args = JSON.parse(tc.function.arguments || '{}');
                    let result = '';
                    
                    try {
                        if (name === 'read_note') result = await this.executeReadNote(args.path);
                        else if (name === 'search_vault') result = await this.executeSearchVault(args.query);
                        else if (name === 'update_metadata') result = await this.executeUpdateMetadata(args.properties);
                        else if (name === 'create_note') result = await this.executeCreateNote(args.path, args.content);
                        else if (name === 'append_to_note') result = await this.executeAppendToNote(args.path, args.content);
                        else if (name === 'modify_files_in_directory') result = await this.executeModifyDirectory(args.directory_path, args.instruction);
                        else if (name === 'run_command') result = await this.executeRunCommand(args.command_id);
                        else result = `Error: Unknown tool ${name}`;
                        
                        this.plugin.logger.log('tool', 'tool', `Executed ${name}`, { arguments: args, result });
                    } catch (e) {
                        result = `Error executing tool: ${e instanceof Error ? e.message : String(e)}`;
                        this.plugin.logger.log('tool', 'tool', `Failed to execute ${name}`, { arguments: tc.function.arguments, error: result });
                    }
                    return { id: tc.id, name, result };
                });

                const results = await Promise.all(toolPromises);

                // Add all results back to messages
                for (const res of results) {
                    messages.push({
                        role: 'tool',
                        tool_call_id: res.id,
                        name: res.name,
                        content: res.result
                    });
                }

                // UI feedback
                msgDiv.addClass('chat-msg-tool');
                contentDiv.innerText = `=> Used tools: ${results.map(r => r.name).join(', ')}\n=> Last result snippet: ${results[results.length-1].result.substring(0, 100)}...`;

                // Recurse
                this.toolCallDepth++;
                await this.processConversationStream(messages, originalUserPrompt);
                return;
            }

            // Streaming complete without tool call. Render final markdown and save to history.
            senderLabel.innerText = assistantName;
            copyBtn.removeClass('chat-hidden');
            copyBtn.addEventListener('click', () => {
                void (async () => {
                    await navigator.clipboard.writeText(fullResponse);
                    copyBtn.innerText = 'Copied!';
                    setTimeout(() => { copyBtn.innerText = 'Copy'; }, 2000);
                })().catch(console.error);
            });
            contentDiv.innerHTML = ''; // Clear raw text
            await MarkdownRenderer.render(this.app, fullResponse, contentDiv, '', this);

            // Replace system prompt context with generic user prompt for history to save tokens for next round
            if (originalUserPrompt) {
                const cleanPrompt = originalUserPrompt.split('\n\n[System Info')[0];
                // Make sure we haven't already pushed this prompt in a previous recursive step
                if (this.messageHistory.length === 0 || this.messageHistory[this.messageHistory.length - 1].content !== cleanPrompt) {
                    this.messageHistory.push({ role: 'user', content: cleanPrompt });
                }
            }

            this.messageHistory.push({ role: 'assistant', content: fullResponse });

        } catch (e) {
            msgDiv.remove();
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
        
        // Ensure log directory exists
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
