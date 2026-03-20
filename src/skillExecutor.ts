import { App, MarkdownView, Notice, WorkspaceLeaf, Editor, EditorPosition } from 'obsidian';
import DeepSeekPlugin from './main';
import { DeepSeekView, DEEPSEEK_VIEW_TYPE } from './view';
import { Skill } from './skillManager';
import { LlmService } from './llmService';

export interface ExecuteContext {
    editor?: Editor;
    source?: 'slash' | 'command';
    triggerRange?: { start: EditorPosition, end: EditorPosition };
}


export class SkillExecutor {
    plugin: DeepSeekPlugin;
    app: App;
    llm: LlmService;

    constructor(app: App, plugin: DeepSeekPlugin) {
        this.app = app;
        this.plugin = plugin;
        this.llm = new LlmService(plugin);
    }

    async execute(skill: Skill, execCtx?: ExecuteContext) {
        this.plugin.logger.log('pipeline', 'system', `Starting execution of skill: ${skill.name}`, { skill });
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        const activeFile = this.app.workspace.getActiveFile();
        const editor = execCtx?.editor || activeView?.editor;
        
        let selection = editor ? editor.getSelection() : '';
        let textToReplaceStart: EditorPosition | undefined;

        // If from slash command and no selection (typical), extract context from the block
        if (execCtx?.source === 'slash' && execCtx.triggerRange && editor && !selection) {
             const startLine = execCtx.triggerRange.start.line;
             const lineStr = editor.getLine(startLine);
             let blockLines: string[] = [];
             
             // 1. Get current line content before the slash
             const currentLinePre = lineStr.substring(0, execCtx.triggerRange.start.ch).trim();
             
             // 2. If current line has content, we use it. 
             // 3. IF current line is empty before slash, we look UP to find the whole paragraph.
             if (currentLinePre) {
                 selection = currentLinePre;
                 textToReplaceStart = { line: startLine, ch: 0 }; 
             } else {
                 // Look up for non-empty lines (the paragraph)
                 let scanLine = startLine - 1;
                 while (scanLine >= 0) {
                     const content = editor.getLine(scanLine).trim();
                     if (!content) break; // Found a break
                     blockLines.unshift(content);
                     scanLine--;
                 }
                 selection = blockLines.join('\n');
                 textToReplaceStart = { line: scanLine + 1, ch: 0 };
             }
        }

        // 1. Common Context
        const initialContext: Record<string, string> = {
            selection: selection,
            title: activeFile ? activeFile.basename : '',
            content: activeFile ? await this.app.vault.cachedRead(activeFile) : ''
        };

        try {
            initialContext.clipboard = await navigator.clipboard.readText();
        } catch (e) {
            console.log("Failed to read clipboard:", e);
            initialContext.clipboard = '';
        }

        // 2. Mode Dispatch
        if (skill.mode === 'pipeline' && skill.steps) {
            await this.executePipeline(skill, initialContext, activeView);
        } else {
            // Standard Single Step
            // Override action if it's a slash command and no action specified, default to replace
            let action = skill.action;
            if (execCtx?.source === 'slash' && action !== 'insert_below' && action !== 'to_chat') {
                 action = 'replace';
            }

            let prompt = this.renderTemplate(skill.template, initialContext);
            
            if (action === 'to_chat') {
                await this.executeToChat(prompt);
            } else if (action === 'replace') {
                await this.executeReplace(prompt, activeView, execCtx, textToReplaceStart);
            } else if (action === 'insert_below') {
                await this.executeInsert(prompt, activeView, execCtx);
            } else {
                console.log(`Action ${action} is not yet implemented.`);
            }
        }
    }

    private renderTemplate(template: string, context: Record<string, string>): string {
        let rendered = template;
        
        // 1. Render {{date:FORMAT}} variables
        rendered = rendered.replace(/\{\{date:([^}]+)\}\}/g, (_, fmt) => {
            const now = new Date();
            return fmt
                .replace('YYYY', now.getFullYear().toString())
                .replace('MM', String(now.getMonth() + 1).padStart(2, '0'))
                .replace('DD', String(now.getDate()).padStart(2, '0'))
                .replace('HH', String(now.getHours()).padStart(2, '0'))
                .replace('mm', String(now.getMinutes()).padStart(2, '0'))
                .replace('ss', String(now.getSeconds()).padStart(2, '0'));
        });
        
        // 2. Render {{key}} context variables
        for (const [key, value] of Object.entries(context)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            rendered = rendered.replace(regex, value);
        }
        return rendered;
    }

    private async executePipeline(skill: Skill, initialContext: Record<string, string>, activeView: MarkdownView | null, execCtx?: ExecuteContext, textToReplaceStart?: EditorPosition) {
        const pipelineContext = { ...initialContext };
        const totalSteps = skill.steps?.length || 0;

        new Notice(`Starting pipeline: ${skill.name} (${totalSteps} steps)`);

        for (let i = 0; i < totalSteps; i++) {
            // Check for stop request
            const view = this.app.workspace.getLeavesOfType(DEEPSEEK_VIEW_TYPE)[0]?.view as DeepSeekView;
            if (view && view.stopRequested) {
                new Notice("Pipeline stopped by user.");
                this.plugin.logger.log('pipeline', 'system', 'Pipeline aborted by stop request.');
                return;
            }

            const step = skill.steps![i];
            const renderedPrompt = this.renderTemplate(step.prompt, pipelineContext);
            this.plugin.logger.log('pipeline', 'system', `Executing step: ${step.id}`, { stepId: step.id, action: step.action, prompt: renderedPrompt });

            let stepResult = '';
            if (step.action === 'process') {
                stepResult = await this.llm.ask(renderedPrompt);
            } else if (step.action === 'to_chat') {
                await this.executeToChat(renderedPrompt);
                stepResult = '[Sent to Chat]';
            } else if (step.action === 'replace') {
                await this.executeReplace(renderedPrompt, activeView);
                stepResult = '[Replaced in Editor]';
            } else if (step.action === 'ask_user') {
                // Ensure view is open
                await this.plugin.activateView();
                await new Promise(resolve => setTimeout(resolve, 100));

                const view = this.app.workspace.getLeavesOfType(DEEPSEEK_VIEW_TYPE)[0]?.view as DeepSeekView;
                if (view) {
                    const approved = await view.requestUserApproval(step.id, renderedPrompt);
                    if (approved === null) {
                        new Notice("Pipeline canceled.");
                        return;
                    }
                    stepResult = approved;
                } else {
                    new Notice("Error: Side panel not found.");
                    return;
                }
            } else if (step.action === 'insert_below') {
                // Re-fetch view in case it changed during pause
                const currentView = activeView || this.app.workspace.getActiveViewOfType(MarkdownView);
                await this.executeInsert(renderedPrompt, currentView, execCtx);
                stepResult = '[Inserted in Editor]';
            } else if (step.action === 'replace') {
                const currentView = activeView || this.app.workspace.getActiveViewOfType(MarkdownView);
                // In a pipeline, replacing the original trigger text might be tricky for later steps. 
                // We will just pass the textToReplaceStart so the first replace eats the trigger.
                await this.executeReplace(renderedPrompt, currentView, execCtx, i === 0 ? textToReplaceStart : undefined);
                stepResult = '[Replaced in Editor]';
            } else {
                console.warn(`Unknown action ${step.action} in step ${step.id}`);
            }

            // Store result for future steps
            pipelineContext[step.id] = stepResult;
            this.plugin.logger.log('pipeline', 'system', `Step ${step.id} completed`, { result: stepResult });
        }

        new Notice(`Pipeline "${skill.name}" completed.`);
    }

    private async executeToChat(prompt: string) {
        // Activate the view to ensure it's open
        await this.plugin.activateView();

        // Give it a tiny moment to render if it was just opened
        await new Promise(resolve => setTimeout(resolve, 50));

        // Find the active DeepSeek view
        const leaves = this.app.workspace.getLeavesOfType('deepseek-chat-view');
        if (leaves.length > 0) {
            const view = leaves[0].view as any; // Cast to any to access inputEl for now
            if (view && view.inputEl) {
                view.inputEl.value = prompt;
                
                // Programmatically trigger sending
                if (typeof view.handleSend === 'function') {
                    void view.handleSend().catch(console.error);
                }
            }
        }
    }

    private async executeReplace(prompt: string, activeView: MarkdownView | null, execCtx?: ExecuteContext, textToReplaceStart?: EditorPosition) {
        const editor = execCtx?.editor || activeView?.editor;
        if (!editor) {
            new Notice("No active markdown view found for replace action.");
            return;
        }
        
        new Notice("AI is thinking (replace)...", 3000);
        
        try {
            const aiResponse = await this.llm.ask(prompt);
            
            if (execCtx?.source === 'slash' && execCtx.triggerRange) {
                const startPos = textToReplaceStart || execCtx.triggerRange.start;
                editor.replaceRange(aiResponse, startPos, execCtx.triggerRange.end);
            } else {
                editor.replaceSelection(aiResponse);
            }
            new Notice("Content replaced.");
        } catch (error) {
            console.error("Replace LLM execution failed:", error);
            new Notice("AI request failed. Check console or API key.");
        }
    }

    private async executeInsert(prompt: string, activeView: MarkdownView | null, execCtx?: ExecuteContext) {
        const editor = execCtx?.editor || activeView?.editor;
        if (!editor) {
            new Notice("No active markdown view found for insert action.");
            return;
        }

        new Notice("AI is thinking (insert)...", 3000);
        
        try {
            const aiResponse = await this.llm.ask(prompt);
            
            if (execCtx?.source === 'slash' && execCtx.triggerRange) {
                // If slash command, first remove the slash command trigger text
                editor.replaceRange('', execCtx.triggerRange.start, execCtx.triggerRange.end);
            }

            const cursor = editor.getCursor();
            
            // Ensure there's a newline before the inserted text if we aren't at the start of a line
            const textToInsert = `\n${aiResponse}\n`;
            
            // Insert at the end of the current line
            const lineStr = editor.getLine(cursor.line);
            editor.replaceRange(textToInsert, { line: cursor.line, ch: lineStr.length });
            new Notice("Content inserted.");
        } catch (error) {
            console.error("Insert LLM execution failed:", error);
             new Notice("AI request failed. Check console or API key.");
        }
    }
}
