import { App, MarkdownView, Notice, WorkspaceLeaf } from 'obsidian';
import DeepSeekPlugin from './main';
import { DeepSeekView, DEEPSEEK_VIEW_TYPE } from './view';
import { Skill } from './skillManager';
import { LlmService } from './llmService';

export class SkillExecutor {
    plugin: DeepSeekPlugin;
    app: App;
    llm: LlmService;

    constructor(app: App, plugin: DeepSeekPlugin) {
        this.app = app;
        this.plugin = plugin;
        this.llm = new LlmService(plugin);
    }

    async execute(skill: Skill) {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        const activeFile = this.app.workspace.getActiveFile();
        
        // 1. Common Context
        const initialContext: Record<string, string> = {
            selection: activeView ? activeView.editor.getSelection() : '',
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
            let prompt = this.renderTemplate(skill.template, initialContext);
            
            if (skill.action === 'to_chat') {
                await this.executeToChat(prompt);
            } else if (skill.action === 'replace') {
                await this.executeReplace(prompt, activeView);
            } else if (skill.action === 'insert_below') {
                await this.executeInsert(prompt, activeView);
            } else {
                console.log(`Action ${skill.action} is not yet implemented.`);
            }
        }
    }

    private renderTemplate(template: string, context: Record<string, string>): string {
        let rendered = template;
        for (const [key, value] of Object.entries(context)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            rendered = rendered.replace(regex, value);
        }
        return rendered;
    }

    private async executePipeline(skill: Skill, initialContext: Record<string, string>, activeView: MarkdownView | null) {
        const pipelineContext = { ...initialContext };
        const totalSteps = skill.steps?.length || 0;

        new Notice(`Starting pipeline: ${skill.name} (${totalSteps} steps)`);

        for (let i = 0; i < totalSteps; i++) {
            const step = skill.steps![i];
            new Notice(`Executing Step ${i + 1}/${totalSteps}: ${step.id}`);

            const renderedPrompt = this.renderTemplate(step.prompt, pipelineContext);

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
                await this.executeInsert(renderedPrompt, currentView);
                stepResult = '[Inserted in Editor]';
            } else if (step.action === 'replace') {
                const currentView = activeView || this.app.workspace.getActiveViewOfType(MarkdownView);
                await this.executeReplace(renderedPrompt, currentView);
                stepResult = '[Replaced in Editor]';
            } else {
                console.warn(`Unknown action ${step.action} in step ${step.id}`);
            }

            // Store result for future steps
            pipelineContext[step.id] = stepResult;
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

    private async executeReplace(prompt: string, activeView: MarkdownView | null) {
        if (!activeView) {
            new Notice("No active markdown view found for replace action.");
            return;
        }
        
        const editor = activeView.editor;
        new Notice("AI is thinking (replace)...", 3000);
        
        try {
            const aiResponse = await this.llm.ask(prompt);
            editor.replaceSelection(aiResponse);
            new Notice("Content replaced.");
        } catch (error) {
            console.error("Replace LLM execution failed:", error);
            new Notice("AI request failed. Check console or API key.");
        }
    }

    private async executeInsert(prompt: string, activeView: MarkdownView | null) {
        if (!activeView) {
            new Notice("No active markdown view found for insert action.");
            return;
        }

        const editor = activeView.editor;
        new Notice("AI is thinking (insert)...", 3000);
        
        try {
            const aiResponse = await this.llm.ask(prompt);
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
