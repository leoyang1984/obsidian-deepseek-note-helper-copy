import { requestUrl, TFile, Notice } from 'obsidian';
import DeepSeekPlugin from './main';
import { LlmService } from './llmService';

export class TelegramService {
    private plugin: DeepSeekPlugin;
    private intervalId: number | null = null;
    private llmService: LlmService;
    private isFetching = false;

    constructor(plugin: DeepSeekPlugin) {
        this.plugin = plugin;
        this.llmService = new LlmService(plugin);
    }

    startPolling() {
        this.stopPolling();
        const interval = this.plugin.settings.tgPollingInterval || 60;
        this.plugin.logger.log('system', 'system', `Starting Telegram polling every ${interval} seconds`);
        
        // Immediate first run
        void this.fetchUpdates();
        
        this.intervalId = window.setInterval(() => {
            void this.fetchUpdates();
        }, interval * 1000);
    }

    stopPolling() {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
            this.plugin.logger.log('system', 'system', 'Stopped Telegram polling');
        }
    }

    async fetchUpdates() {
        if (this.isFetching) return;
        
        const { tgBotToken, tgChatId, tgLastUpdateId } = this.plugin.settings;
        if (!tgBotToken || !tgChatId) return;

        this.isFetching = true;

        try {
            // 1. Prepare request with offset
            const offset = tgLastUpdateId + 1;
            const url = `https://api.telegram.org/bot${tgBotToken}/getUpdates?offset=${offset}`;

            const response = await requestUrl({ url, method: 'GET' });
            if (response.status !== 200) {
                throw new Error(`Telegram API returned ${response.status}`);
            }

            const data = response.json;
            if (data.ok && data.result && data.result.length > 0) {
                let maxUpdateId = tgLastUpdateId;
                
                // 2. Process batch of messages
                for (const update of data.result) {
                    try {
                        await this.processUpdate(update);
                    } catch (e: any) {
                        console.error('Error processing individual update:', e);
                        this.plugin.logger.log('system', 'system', `Error processing update ${update.update_id}: ${e.message || String(e)}`);
                    }
                    
                    if (update.update_id > maxUpdateId) {
                        maxUpdateId = update.update_id;
                    }
                }

                // 3. Update游标 & 4. 持久化保存
                if (maxUpdateId > tgLastUpdateId) {
                    this.plugin.settings.tgLastUpdateId = maxUpdateId;
                    await this.plugin.saveSettings();
                    this.plugin.logger.log('system', 'system', `Updated Telegram lastUpdateId to ${maxUpdateId} and saved settings.`);
                }
            }
        } catch (error) {
            console.error('Failed to fetch Telegram updates:', error);
            this.plugin.logger.log('system', 'system', `Telegram fetch failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            this.isFetching = false;
        }
    }

    private async processUpdate(update: any) {
        const { tgChatId } = this.plugin.settings;
        const message = update.message;

        if (!message) return;

        // Security filter
        if (String(message.chat.id) !== String(tgChatId)) {
            this.plugin.logger.log('system', 'system', `Ignored message from unauthorized Chat ID: ${message.chat.id}`);
            return;
        }

        const text = message.text;
        if (text) {
            await this.handleMessage(text);
        }
    }

    private async handleMessage(text: string) {
        let finalContent = text;
        const { tgAiProcessing, tgPromptTemplate, tgSavePath } = this.plugin.settings;

        if (tgAiProcessing) {
            try {
                const prompt = tgPromptTemplate.replace('{{tg_message}}', text);
                this.plugin.logger.log('system', 'system', 'Processing Telegram message with AI...');
                finalContent = await this.llmService.ask(prompt);
            } catch (error) {
                console.error('AI Processing failed for TG message:', error);
                this.plugin.logger.log('system', 'system', `AI processing failed, falling back to original. Error: ${error instanceof Error ? error.message : String(error)}`);
                finalContent = `[AI 处理失败] ${text}`;
            }
        }

        await this.appendToVault(tgSavePath, finalContent);
    }

    private async appendToVault(path: string, content: string) {
        const { vault } = this.plugin.app;
        const timestamp = new Date().toLocaleString();
        const formattedEntry = `\n\n--- \n### 📅 ${timestamp}\n${content}\n`;

        try {
            let file = vault.getAbstractFileByPath(path);
            
            if (file instanceof TFile) {
                await vault.process(file, (data) => data + formattedEntry);
            } else {
                // Ensure parent directory exists
                const pathParts = path.split('/');
                if (pathParts.length > 1) {
                    const dirPath = pathParts.slice(0, -1).join('/');
                    if (!vault.getAbstractFileByPath(dirPath)) {
                        await vault.createFolder(dirPath);
                    }
                }
                await vault.create(path, `# Telegram Notes\n${formattedEntry}`);
            }
            
            new Notice(`Telegram message captured to ${path}`);
            this.plugin.logger.log('system', 'system', `Appended Telegram message to ${path}`);
        } catch (error) {
            console.error('Failed to append message to vault:', error);
            this.plugin.logger.log('system', 'system', `Failed to append to vault: ${error instanceof Error ? error.message : String(error)}`);
            new Notice(`Failed to save Telegram message: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
