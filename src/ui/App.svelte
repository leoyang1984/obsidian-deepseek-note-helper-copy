<script lang="ts">
    import { chatMessages, clearMessages, pipelineProgress } from '../store';
    import type { ChatService } from '../services/ChatService';
    import type { Component, App as ObsidianApp } from 'obsidian';

    import Header from './components/Header.svelte';
    import MessageList from './components/MessageList.svelte';
    import ChatInput from './components/ChatInput.svelte';

    export let chatService: ChatService;
    export let view: Component;
    export let app: ObsidianApp;
    export let assistantName: string;

    function handleSend(text: string) {
        chatService.handleSend(text);
    }

    function handleExport() {
        chatService.exportLogs();
    }

    function handleClear() {
        clearMessages();
        chatService.plugin.logger.clear();
    }
</script>

<div class="deepseek-chat-container">
    {#if $pipelineProgress}
        <div class="pipeline-progress-bar" style="background: var(--interactive-accent); color: var(--text-on-accent); padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.15); animation: deepseek-fade-in 0.3s ease-out;">
            <strong style="display: block; font-size: 0.95em; margin-bottom: 2px;">⚙️ Running: {$pipelineProgress.skillName}</strong>
            <small style="opacity: 0.9;">Step {$pipelineProgress.currentStep} of {$pipelineProgress.totalSteps} ({$pipelineProgress.action})</small>
        </div>
    {/if}
    <MessageList {view} {app} {assistantName} />
    <ChatInput onSend={handleSend}>
        <Header onExport={handleExport} onClear={handleClear} />
    </ChatInput>
</div>
