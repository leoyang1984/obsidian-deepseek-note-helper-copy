import { App, Editor, MarkdownRenderer, Notice } from 'obsidian';
import DeepSeekPlugin from './main';
import { LlmService } from './llmService';

export class DeepSeekHoverView {
    app: App;
    plugin: DeepSeekPlugin;
    containerEl: HTMLElement;
    inputEl: HTMLTextAreaElement;
    resultEl: HTMLElement;
    contextEl: HTMLElement;
    copyBtn: HTMLButtonElement;
    llmService: LlmService;
    selection: string;
    abortController: AbortController | null = null;
    isVisible: boolean = false;

    constructor(app: App, plugin: DeepSeekPlugin) {
        this.app = app;
        this.plugin = plugin;
        this.llmService = new LlmService(plugin);
        
        // Create the container
        this.containerEl = document.createElement('div');
        (this.containerEl as any).addClass('deepseek-hover-container');
        this.containerEl.style.display = 'none';
        document.body.appendChild(this.containerEl);

        // Header (Used as Drag Handle)
        const header = (this.containerEl as any).createDiv({ cls: 'deepseek-hover-header' });
        header.createSpan({ text: 'DeepSeek AI Chat', cls: 'deepseek-hover-title' });
        const closeBtn = header.createEl('button', { text: '×', cls: 'deepseek-hover-close' });
        closeBtn.onclick = () => this.hide();

        this.setupDragging(header);

        // Result wrapper & area
        const resultWrapper = (this.containerEl as any).createDiv({ cls: 'deepseek-hover-result-wrapper' });
        this.resultEl = resultWrapper.createDiv({ cls: 'deepseek-hover-result' });
        
        // Copy button inside result wrapper
        this.copyBtn = resultWrapper.createEl('button', { text: 'Copy', cls: 'deepseek-hover-copy-btn' });
        this.copyBtn.style.display = 'none';
        this.copyBtn.onclick = async () => {
            if (!this.resultEl.innerText) return;
            await navigator.clipboard.writeText(this.resultEl.innerText);
            this.copyBtn.innerText = 'Copied!';
            setTimeout(() => this.copyBtn.innerText = 'Copy', 2000);
        };
        
        // Context indicator (Added above input)
        this.contextEl = (this.containerEl as any).createDiv({ cls: 'deepseek-hover-context' });
        this.contextEl.style.display = 'none';

        // Input area
        const inputWrapper = (this.containerEl as any).createDiv({ cls: 'deepseek-hover-input-wrapper' });
        this.inputEl = inputWrapper.createEl('textarea', { cls: 'deepseek-hover-input' });
        this.inputEl.placeholder = 'Ask AI about selection... (Enter to send, Esc to close)';
        this.inputEl.rows = 1;

        // Auto-resize textarea
        this.inputEl.addEventListener('input', () => {
            this.inputEl.style.height = 'auto';
            this.inputEl.style.height = (this.inputEl.scrollHeight) + 'px';
        });

        this.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void this.handleSubmit();
            } else if (e.key === 'Escape') {
                this.hide();
            }
        });

        // Click outside to close (Ignore if user is dragging scrollbar or interacting inside)
        document.addEventListener('mousedown', (e: MouseEvent) => {
            if (this.isVisible && !this.containerEl.contains(e.target as Node)) {
                this.hide();
            }
        });
    }

    setupDragging(handle: HTMLElement) {
        let isDragging = false;
        let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

        handle.addEventListener('mousedown', (e: MouseEvent) => {
            if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = this.containerEl.offsetLeft;
            initialTop = this.containerEl.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this.containerEl.style.left = `${initialLeft + dx}px`;
            this.containerEl.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    async show(editor: Editor, selection: string) {
        this.selection = selection;
        this.isVisible = true;
        this.containerEl.style.display = 'flex';
        this.resultEl.empty();
        this.inputEl.value = '';
        this.inputEl.style.height = 'auto';

        if (selection) {
            this.contextEl.innerText = selection;
            this.contextEl.style.display = 'block';
        } else {
            this.contextEl.style.display = 'none';
        }

        // Position the container
        const cursor = editor.getCursor('from');
        const coords = (editor as any).coordsAtPos ? (editor as any).coordsAtPos(cursor) : null;
        
        if (coords) {
            const margin = 10;
            const estimatedHeight = 250; // Use an estimated height so it pops ABOVE the selection initially
            const containerWidth = 400;

            let top = coords.top - estimatedHeight - margin;
            let left = coords.left;

            // Check if it goes off screen on the top (e.g. selection is near top of screen)
            if (top < 50) {
                top = coords.bottom + margin;
            }
            // Check if it goes off screen on the right
            if (left + containerWidth > window.innerWidth) {
                left = window.innerWidth - containerWidth - margin;
            }

            this.containerEl.style.top = `${top}px`;
            this.containerEl.style.left = `${left}px`;
        }

        this.inputEl.focus();
    }

    hide() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.containerEl.style.display = 'none';
        this.isVisible = false;
    }

    async handleSubmit() {
        const prompt = this.inputEl.value.trim();
        if (!prompt) return;

        this.copyBtn.style.display = 'none';
        this.inputEl.disabled = true;
        this.inputEl.placeholder = 'AI is thinking...';
        (this.resultEl as HTMLElement).empty();
        (this.resultEl as HTMLElement).addClass('deepseek-is-loading');

        this.abortController = new AbortController();

        try {
            const fullPrompt = `Context Selection:\n"""\n${this.selection}\n"""\n\nUser Question: ${prompt}`;
            
            let accumulatedText = '';
            await this.llmService.streamAsk(
                fullPrompt,
                async (text: string) => {
                    accumulatedText = text;
                    this.resultEl.empty();
                    await MarkdownRenderer.render(this.app, accumulatedText, this.resultEl, '', this.plugin);
                    // Scroll to bottom of result area if needed
                    this.resultEl.scrollTop = this.resultEl.scrollHeight;
                },
                this.abortController.signal
            );
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // Ignore
            } else {
                new Notice('AI Request failed: ' + (error instanceof Error ? error.message : String(error)));
                (this.resultEl as any).createEl('p', { text: 'Error: ' + (error instanceof Error ? error.message : String(error)), cls: 'deepseek-error' });
            }
        } finally {
            this.inputEl.disabled = false;
            this.inputEl.placeholder = 'Ask AI about selection...';
            this.inputEl.value = '';
            this.inputEl.style.height = 'auto';
            (this.resultEl as any).removeClass('deepseek-is-loading');
            this.copyBtn.style.display = 'block';
            this.abortController = null;
            this.inputEl.focus();
        }
    }
}
