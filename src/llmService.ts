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
            this.plugin.logger.log('api', 'system', `Sending request to ${provider}`, { model, messages });
            const response = await requestUrl({
                url: endpoint,
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            // Check if user stopped while waiting for network
            const leaves = this.plugin.app.workspace.getLeavesOfType('deepseek-chat-view');
            const view = leaves[0]?.view as any;
            if (view && view.stopRequested) {
                this.plugin.logger.log('api', 'system', 'Request returned but stop was requested. Aborting.');
                throw new Error('STOPPED_BY_USER');
            }

            if (response.status !== 200) {
                const errorText = `API returned status ${response.status}: ${response.text}`;
                this.plugin.logger.log('api', 'system', `API error: ${errorText}`);
                throw new Error(errorText);
            }

            const data = response.json;
            if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
                const content = data.choices[0].message.content;
                this.plugin.logger.log('api', 'assistant', `Received response from ${provider}`, { content });
                return content;
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error('Headless LLM request failed:', error);
            this.plugin.logger.log('api', 'system', `Request failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Executes a streaming AI request.
     */
    async streamAsk(prompt: string, onUpdate: (text: string) => void, signal?: AbortSignal): Promise<string> {
        const { provider, apiKeys, apiUrl, model } = this.plugin.settings;
        const apiKey = apiKeys[provider];

        if (!apiKey) {
            throw new Error(`API Key not set for provider ${provider}.`);
        }

        let endpoint = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
        const payload = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            stream: true
        };

        try {
            this.plugin.logger.log('api', 'system', `Starting stream request to ${provider}`, { model });
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload),
                signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error ${response.status}: ${errorText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('Response body is null');

            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: ')) continue;

                    const dataStr = trimmed.slice(6);
                    if (dataStr === '[DONE]') break;

                    try {
                        const data = JSON.parse(dataStr);
                        const content = data.choices[0]?.delta?.content || '';
                        if (content) {
                            fullText += content;
                            onUpdate(fullText);
                        }
                    } catch (e) {
                        // Sometimes chunks are split across multiple 'read' calls, 
                        // but this character-based stream parsing is usually robust for OpenAI-compatible APIs.
                    }
                }
            }

            this.plugin.logger.log('api', 'assistant', `Stream complete from ${provider}`);
            return fullText;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                this.plugin.logger.log('api', 'system', 'Stream request aborted by user');
                throw error;
            }
            console.error('Streaming LLM request failed:', error);
            this.plugin.logger.log('api', 'system', `Stream failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
