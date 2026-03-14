import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DeepSeekView, DEEPSEEK_VIEW_TYPE } from './view';

interface DeepSeekSettings {
    provider: string;
    apiKey: string; // Deprecated, kept for backward compatibility and migration
    apiKeys: Record<string, string>;
    apiUrl: string;
    model: string;
    skillsDirectory: string;
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
    skillsDirectory: 'DeepSeek-Skills'
}

import { SkillManager } from './skillManager';

export default class DeepSeekPlugin extends Plugin {
    settings: DeepSeekSettings = DEFAULT_SETTINGS;
    skillManager!: SkillManager;

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
                    void this.plugin.saveSettings().catch(console.error);
                    // Reload skills if directory changes
                    void this.plugin.skillManager.loadSkills().catch(console.error);
                }));
    }
}
