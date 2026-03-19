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
    selection: string = '';
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

        // Slim Drag Handle
        const dragHandle = (this.containerEl as any).createDiv({ cls: 'deepseek-hover-drag-handle' });
        dragHandle.createDiv({ cls: 'deepseek-hover-drag-pill' });

        this.setupDragging(dragHandle);

        // Result wrapper & area
        const resultWrapper = (this.containerEl as any).createDiv({ cls: 'deepseek-hover-result-wrapper' });
        this.resultEl = resultWrapper.createDiv({ cls: 'deepseek-hover-result' });
        
        // Copy button inside result wrapper
        this.copyBtn = resultWrapper.createEl('button', { cls: 'deepseek-hover-copy-btn' });
        this.copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        this.copyBtn.title = "Copy";
        this.copyBtn.style.display = 'none';
        this.copyBtn.onclick = async () => {
            if (!this.resultEl.innerText) return;
            await navigator.clipboard.writeText(this.resultEl.innerText);
            const originalHTML = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            setTimeout(() => this.copyBtn.innerHTML = originalHTML, 2000);
        };
        
        // Footer Wrapper (Integrated Panel)
        const footerWrapper = (this.containerEl as any).createDiv({ cls: 'chat-footer-wrapper' });

        // Context indicator (Selected Text Badge)
        this.contextEl = footerWrapper.createDiv({ cls: 'deepseek-hover-context' });
        this.contextEl.style.display = 'none';

        // Input area (Container for Input + Hint Icons)
        const inputContainer = footerWrapper.createDiv({ cls: 'deepseek-hover-input-wrapper' });
        
        this.inputEl = inputContainer.createEl('textarea', { cls: 'deepseek-hover-input' });
        this.inputEl.placeholder = 'Ask AI about selection...';
        this.inputEl.rows = 1;

        // Hint Icons (Enter & Esc)
        const hintIcons = inputContainer.createDiv({ cls: 'deepseek-hover-hint-icons' });
        hintIcons.innerHTML = `<span class="deepseek-key-icon">↵</span><span class="deepseek-key-icon">esc</span>`;

        // Helper text below
        const helperText = footerWrapper.createDiv({ cls: 'deepseek-hover-helper-text' });
        helperText.innerText = 'Enter to send • Esc to close';

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
            this.contextEl.parentElement?.classList.add('has-context');
        } else {
            this.contextEl.style.display = 'none';
            this.contextEl.parentElement?.classList.remove('has-context');
        }

        // Position the container (Fixed Left-Sidebar Style: 40% width, 95% height)
        const targetWidth = window.innerWidth * 0.4;
        const targetHeight = window.innerHeight * 0.95;
        
        this.containerEl.style.width = `${targetWidth}px`;
        this.containerEl.style.height = `${targetHeight}px`;

        const top = (window.innerHeight - targetHeight) / 2;
        const left = 20; // 20px margin from the left edge

        this.containerEl.style.top = `${top}px`;
        this.containerEl.style.left = `${left}px`;

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

        // Clear input immediately for better UX
        this.inputEl.value = '';
        this.inputEl.style.height = 'auto';
        this.inputEl.disabled = true;
        this.inputEl.placeholder = 'AI is thinking...';

        this.copyBtn.style.display = 'none';
        (this.resultEl as HTMLElement).empty();
        (this.resultEl as HTMLElement).addClass('deepseek-is-loading');

        // Show user's question in result area instantly
        const userMsgDiv = this.resultEl.createDiv({ cls: 'deepseek-hover-user-msg' });
        userMsgDiv.innerHTML = `<strong>You:</strong> ${prompt}`;

        this.abortController = new AbortController();

        try {
            const fullPrompt = `Context Selection:\n"""\n${this.selection}\n"""\n\nUser Question: ${prompt}`;
            
            let accumulatedText = '';
            
            // Create assistant response container
            const responseDiv = this.resultEl.createDiv({ cls: 'deepseek-hover-assistant-msg' });

            await this.llmService.streamAsk(
                fullPrompt,
                async (text: string) => {
                    accumulatedText = text;
                    responseDiv.empty();
                    await MarkdownRenderer.render(this.app, accumulatedText, responseDiv, '', this.plugin);
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
                this.resultEl.createEl('p', { text: 'Error: ' + (error instanceof Error ? error.message : String(error)), cls: 'deepseek-error' });
            }
        } finally {
            this.inputEl.disabled = false;
            this.inputEl.placeholder = 'Ask AI about selection...';
            (this.resultEl as any).removeClass('deepseek-is-loading');
            this.copyBtn.style.display = 'block';
            this.abortController = null;
            this.inputEl.focus();
        }
    }
}
