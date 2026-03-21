import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DeepSeekView, DEEPSEEK_VIEW_TYPE } from './view';
import { ExecutionLogger } from './logger';

interface DeepSeekSettings {
    provider: string;
    apiKey: string; // Deprecated, kept for backward compatibility and migration
    apiKeys: Record<string, string>;
    apiUrl: string;
    model: string;
    skillsDirectory: string;
    logDirectory: string;
    slashCommandTrigger: string;
    slashCommandDefaultAction: string;
    // Telegram Settings
    tgBotToken: string;
    tgChatId: string;
    tgPollingInterval: number;
    tgSavePath: string;
    tgAiProcessing: boolean;
    tgPromptTemplate: string;
    tgLastUpdateId: number;
}

const DEFAULT_SETTINGS: DeepSeekSettings = {
    provider: 'deepseek',
    apiKey: '',
    apiKeys: {
        'deepseek': '',
        'kimi': '',
        'openai': '',
        'custom': ''
    },
    apiUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    skillsDirectory: 'DeepSeek-Skills',
    logDirectory: 'DeepSeek-Logs',
    slashCommandTrigger: '/ds',
    slashCommandDefaultAction: 'none',
    tgBotToken: '',
    tgChatId: '',
    tgPollingInterval: 60,
    tgSavePath: 'Telegram-Notes.md',
    tgAiProcessing: true,
    tgPromptTemplate: '你是一个专业的数字花园整理专家。用户通过 Telegram 发来的消息多为零碎的灵感、待办或语音转文字的草稿。\n请按以下规则处理：\n1. **修正错字**：依据语境纠正语音录入产生的同音错别字和中英混杂错误。\n2. **结构化**：将口语化的表达转化为清晰的书面逻辑，使用列表（-）或引用（>）格式。\n3. **保持原意**：保留内容的真实意图，不要改变用户的核心信息点。\n4. **输出限制**：只返回处理后的 Markdown 内容，禁止输出任何解释性废话。\n\n待处理原文：\n{{tg_message}}',
    tgLastUpdateId: 0
}

import { SkillManager } from './skillManager';
import { DeepSeekHoverView } from './hoverView';
import { DeepSeekSlashSuggest } from './slashSuggest';
import { TelegramService } from './telegramService';
import { SkillExecutor } from './skillExecutor';
import { QuickPromptModal } from './ui/QuickPromptModal';

export default class DeepSeekPlugin extends Plugin {
    settings: DeepSeekSettings = DEFAULT_SETTINGS;
    skillManager!: SkillManager;
    logger: ExecutionLogger = new ExecutionLogger();
    telegramService!: TelegramService;
    hoverView!: DeepSeekHoverView;

    async onload() {
        await this.loadSettings();

        this.registerView(
            DEEPSEEK_VIEW_TYPE,
            (leaf) => new DeepSeekView(leaf, this)
        );

        this.addRibbonIcon('bot', 'Open deepseek helper', () => {
            void this.activateView().catch(console.error);
        });

        this.addSettingTab(new DeepSeekSettingTab(this.app, this));

        // Initialize and load the Skill Manager
        this.skillManager = new SkillManager(this.app, this);
        this.app.workspace.onLayoutReady(() => {
            void this.skillManager.loadSkills().catch(console.error);
        });

        // Initialize Hover View
        this.hoverView = new DeepSeekHoverView(this.app, this);

        // Register Slash Suggest
        this.registerEditorSuggest(new DeepSeekSlashSuggest(this.app, this));

        // Add Hover Command
        this.addCommand({
            id: 'deepseek-hover-ai',
            name: 'Hover AI Chat',
            editorCallback: (editor) => {
                const selection = editor.getSelection();
                this.hoverView.show(editor, selection);
            },
            hotkeys: [
                {
                    modifiers: ['Mod', 'Shift'],
                    key: 'j',
                },
            ],
        });

        // Add Canvas Branching Command
        this.addCommand({
            id: 'deepseek-canvas-branch',
            name: 'AI Node Branching (Canvas)',
            checkCallback: (checking: boolean) => {
                const activeView = (this.app.workspace.activeLeaf?.view as any);
                if (activeView?.getViewType() === 'canvas') {
                    if (!checking) {
                        this.handleCanvasBranching(activeView);
                    }
                    return true;
                }
                return false;
            }
        });

        // Initialize Telegram Service
        this.telegramService = new TelegramService(this);
        
        // Ensure polling starts on load if configured
        this.startPolling();
    }

    private async handleCanvasBranching(canvasView: any) {
        new QuickPromptModal(
            this.app,
            "AI Node Branching",
            "What should AI do with selected nodes? (e.g. 'Summarize', 'Next steps')",
            async (prompt) => {
                if (!prompt) return;
                
                const skillExecutor = new SkillExecutor(this.app, this);
                const virtualSkill: any = {
                    id: "canvas-branching",
                    name: "Canvas Branching",
                    action: "to_canvas",
                    template: `Instruction: ${prompt}\n\nSelected Context:\n{{canvas_selection}}`
                };
                await skillExecutor.execute(virtualSkill);
            }
        ).open();
    }

    startPolling() {
        if (this.telegramService) {
            this.telegramService.startPolling();
        }
    }

    onunload() {
        if (this.telegramService) {
            this.telegramService.stopPolling();
        }
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(DEEPSEEK_VIEW_TYPE);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({ type: DEEPSEEK_VIEW_TYPE, active: true });
            }
        }

        if (leaf) {
            void workspace.revealLeaf(leaf);
        }
    }

    async loadSettings() {
        const loadedData = await this.loadData() as Partial<DeepSeekSettings> | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
        
        // Ensure apiKeys object exists in case of old data
        if (!this.settings.apiKeys) {
            this.settings.apiKeys = { ...DEFAULT_SETTINGS.apiKeys };
        }
        
        // Migrate old single apiKey to deepseek if the old one exists and deepseek doesn't
        if (this.settings.apiKey && !this.settings.apiKeys['deepseek']) {
            this.settings.apiKeys['deepseek'] = this.settings.apiKey;
            // Optionally clear the old one so we don't migrate again?
            // this.settings.apiKey = ''; 
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

import { App, PluginSettingTab, Setting } from 'obsidian';

class DeepSeekSettingTab extends PluginSettingTab {
    plugin: DeepSeekPlugin;

    constructor(app: App, plugin: DeepSeekPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl).setName('Deepseek').setHeading();

        new Setting(containerEl)
            .setName('AI Provider')
            .setDesc('Select the AI service provider.')
            .addDropdown(drop => drop
                .addOption('deepseek', 'DeepSeek')
                .addOption('kimi', 'Kimi (Moonshot)')
                .addOption('openai', 'OpenAI')
                .addOption('custom', 'Custom')
                .setValue(this.plugin.settings.provider)
                .onChange(async (value) => {
                    this.plugin.settings.provider = value;
                    if (value === 'deepseek') {
                        this.plugin.settings.apiUrl = 'https://api.deepseek.com';
                        this.plugin.settings.model = 'deepseek-chat';
                    } else if (value === 'kimi') {
                        this.plugin.settings.apiUrl = 'https://api.moonshot.cn/v1';
                        this.plugin.settings.model = 'moonshot-v1-8k';
                    } else if (value === 'openai') {
                        this.plugin.settings.apiUrl = 'https://api.openai.com/v1';
                        this.plugin.settings.model = 'gpt-4o-mini';
                    }
                    await this.plugin.saveSettings();
                    this.display(); // re-render to update text fields
                }));

        new Setting(containerEl)
            .setName('API key')
            .setDesc(`Enter your API key for ${this.plugin.settings.provider}.`)
            .addText(text => text
                .setValue(this.plugin.settings.apiKeys[this.plugin.settings.provider] || '')
                .onChange((value) => {
                    this.plugin.settings.apiKeys[this.plugin.settings.provider] = value;
                    // Also keep the root apiKey in sync with deepseek so old views don't completely break, 
                    // but we will update view.ts to use apiKeys anyway.
                    if (this.plugin.settings.provider === 'deepseek') {
                        this.plugin.settings.apiKey = value;
                    }
                    void this.plugin.saveSettings().catch(console.error);
                }));

        new Setting(containerEl)
            .setName('API URL')
            .setDesc('Endpoint for the API. (Will auto-update if Provider is changed)')
            .addText(text => text
                .setValue(this.plugin.settings.apiUrl)
                .onChange((value) => {
                    this.plugin.settings.apiUrl = value;
                    void this.plugin.saveSettings().catch(console.error);
                }));

        new Setting(containerEl)
            .setName('Model')
            .setDesc('Model to use.')
            .addText(text => text
                .setValue(this.plugin.settings.model)
                .onChange((value) => {
                    this.plugin.settings.model = value;
                    void this.plugin.saveSettings().catch(console.error);
                }));

        new Setting(containerEl)
            .setName('Skills directory')
            .setDesc('Folder where your Markdown skills are stored (e.g. DeepSeek-Skills).')
            .addText(text => text
                .setValue(this.plugin.settings.skillsDirectory)
                .onChange((value) => {
                    this.plugin.settings.skillsDirectory = value;
                    // Reload skills if directory changes
                    void this.plugin.skillManager.loadSkills().catch(console.error);
                }));

        new Setting(containerEl)
            .setName('Log export directory')
            .setDesc('Folder where execution logs will be exported (e.g. DeepSeek-Logs).')
            .addText(text => text
                .setValue(this.plugin.settings.logDirectory)
                .onChange(async (value) => {
                    this.plugin.settings.logDirectory = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl).setName('Slash Commands').setHeading();

        new Setting(containerEl)
            .setName('Slash Command Trigger')
            .setDesc('Trigger string to show the Light Skills menu in the editor.')
            .addText(text => text
                .setValue(this.plugin.settings.slashCommandTrigger)
                .onChange(async (value) => {
                    this.plugin.settings.slashCommandTrigger = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Action (Enter instantly)')
            .setDesc('If you select a skill here, typing the trigger and hitting Enter will immediately execute this skill instead of showing the menu.')
            .addDropdown(drop => {
                drop.addOption('none', 'Show Menu Only (Default)');
                this.plugin.skillManager.skills.forEach(skill => {
                    drop.addOption(skill.id, skill.name);
                });
                drop.setValue(this.plugin.settings.slashCommandDefaultAction || 'none')
                    .onChange(async (value) => {
                        this.plugin.settings.slashCommandDefaultAction = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl).setName('Telegram Sync Settings').setHeading();

        new Setting(containerEl)
            .setName('Telegram Bot Token')
            .setDesc('Token from @BotFather.')
            .addText(text => text
                .setPlaceholder('Enter your bot token')
                .setValue(this.plugin.settings.tgBotToken)
                .onChange(async (value) => {
                    this.plugin.settings.tgBotToken = value;
                    await this.plugin.saveSettings();
                    this.plugin.startPolling();
                }));

        new Setting(containerEl)
            .setName('My Chat ID')
            .setDesc('Whitelisted Chat ID to receive messages from.')
            .addText(text => text
                .setPlaceholder('Enter your Chat ID')
                .setValue(this.plugin.settings.tgChatId)
                .onChange(async (value) => {
                    this.plugin.settings.tgChatId = value;
                    await this.plugin.saveSettings();
                    this.plugin.startPolling();
                }));

        new Setting(containerEl)
            .setName('Polling Interval (seconds)')
            .setDesc('How often to check for new messages.')
            .addText(text => text
                .setValue(String(this.plugin.settings.tgPollingInterval))
                .onChange(async (value) => {
                    const num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                        this.plugin.settings.tgPollingInterval = num;
                        await this.plugin.saveSettings();
                        // Restart polling with new interval
                        this.plugin.startPolling();
                    }
                }));

        new Setting(containerEl)
            .setName('Target Note Path')
            .setDesc('Path to the Markdown file where notes will be saved (e.g. Inbox/TG-Notes.md).')
            .addText(text => text
                .setValue(this.plugin.settings.tgSavePath)
                .onChange(async (value) => {
                    this.plugin.settings.tgSavePath = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Enable DeepSeek Processing')
            .setDesc('Use AI to format and correct the incoming messages.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.tgAiProcessing)
                .onChange(async (value) => {
                    this.plugin.settings.tgAiProcessing = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Prompt Template')
            .setDesc('Template for AI processing. Use {{tg_message}} as placeholder.')
            .addTextArea(text => text
                .setValue(this.plugin.settings.tgPromptTemplate)
                .onChange(async (value) => {
                    this.plugin.settings.tgPromptTemplate = value;
                    await this.plugin.saveSettings();
                }));
    }
}

