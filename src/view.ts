import { ItemView, WorkspaceLeaf } from 'obsidian';
import type DeepSeekPlugin from './main';
import { ChatService } from './services/ChatService';
import { mount, unmount } from 'svelte';
import { lastSelection, clearMessages } from './store';
import App from './ui/App.svelte';

export const DEEPSEEK_VIEW_TYPE = 'deepseek-chat-view';

export class DeepSeekView extends ItemView {
    plugin: DeepSeekPlugin;
    chatService: ChatService;
    svelteApp: Record<string, any> | null = null; // Svelte 5 app instance type

    constructor(leaf: WorkspaceLeaf, plugin: DeepSeekPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.chatService = new ChatService(this.app, plugin);
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
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();

        // Setup cache updates for highlighted local memory
        this.registerEvent(
            this.app.workspace.on('editor-change', (editor) => {
                const selection = editor.getSelection();
                if (selection) {
                    lastSelection.set(selection);
                }
            })
        );

        this.svelteApp = mount(App, {
            target: container,
            props: {
                chatService: this.chatService,
                view: this,
                app: this.app,
                assistantName: this.getAssistantName()
            }
        });
    }

    async onClose() {
        if (this.svelteApp) {
            unmount(this.svelteApp);
            this.svelteApp = null;
        }
        clearMessages();
    }
}
