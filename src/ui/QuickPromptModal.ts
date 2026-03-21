import { App, Modal } from 'obsidian';

export class QuickPromptModal extends Modal {
    result: string = "";
    onSubmit: (result: string) => void;
    title: string;
    placeholder: string;

    constructor(app: App, title: string, placeholder: string, onSubmit: (result: string) => void) {
        super(app);
        this.title = title;
        this.placeholder = placeholder;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl, modalEl } = this;
        contentEl.empty();
        
        // Add custom class to the main modal element
        modalEl.addClass('ds-canvas-prompt-modal');
        this.titleEl.setText(this.title);

        const body = contentEl.createDiv({ cls: 'ds-prompt-body' });
        const textArea = body.createEl('textarea', {
            cls: 'ds-prompt-textarea',
            attr: { placeholder: this.placeholder }
        });

        textArea.addEventListener('input', () => {
            this.result = textArea.value;
        });

        textArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.result.trim()) {
                    this.onSubmit(this.result);
                    this.close();
                }
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        const footer = contentEl.createDiv({ cls: 'ds-prompt-footer' });
        const hints = footer.createDiv({ cls: 'ds-prompt-hints' });
        hints.setText('Enter to generate • Shift+Enter for new line');

        const btn = footer.createEl('button', {
            text: 'Generate',
            cls: 'mod-cta ds-generate-btn'
        });

        btn.addEventListener('click', () => {
            if (this.result.trim()) {
                this.onSubmit(this.result);
                this.close();
            }
        });
        
        // Focus the input
        setTimeout(() => {
            textArea.focus();
        }, 100);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
