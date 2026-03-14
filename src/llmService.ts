import { requestUrl } from 'obsidian';
import DeepSeekPlugin from './main';

export class LlmService {
    plugin: DeepSeekPlugin;

    constructor(plugin: DeepSeekPlugin) {
        this.plugin = plugin;
    }

    /**
     * Executes a headless AI request and returns the string response.
     * Ideal for pipeline processing where we don't want to pollute the chat UI.
     */
    async ask(prompt: string): Promise<string> {
        const { provider, apiKeys, apiUrl, model } = this.plugin.settings;
        const apiKey = apiKeys[provider];

        if (!apiKey) {
            throw new Error(`API Key not set for provider ${provider}.`);
        }

        const messages = [{ role: 'user', content: prompt }];
        
        let endpoint = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
        
        const payload = {
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4000
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        try {
            const response = await requestUrl({
                url: endpoint,
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (response.status !== 200) {
                throw new Error(`API returned status ${response.status}: ${response.text}`);
            }

            const data = response.json;
            if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error('Headless LLM request failed:', error);
            throw error;
        }
    }
}
