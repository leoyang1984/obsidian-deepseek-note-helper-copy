<script lang="ts">
    import { onMount } from 'svelte';
    import { MarkdownRenderer, Component, App } from 'obsidian';
    import type { ChatMessage } from '../../types';
    
    export let msg: ChatMessage;
    export let view: Component;
    export let assistantName: string = 'Assistant';
    export let app: App;

    let contentDiv: HTMLElement;
    let copyButtonText = 'Copy';
    
    $: senderName = msg.role === 'user' ? 'You' : (msg.role === 'assistant' ? assistantName : (msg.role === 'tool' ? 'Tool' : 'System'));
    
    onMount(() => {
        if (msg.role === 'assistant' && msg.content && contentDiv) {
            // we use the current view context to correctly bind component lifecycle
            MarkdownRenderer.render(app, msg.content, contentDiv, '', view);
        }
    });
	
	function copyContent() {
		navigator.clipboard.writeText(msg.content || '');
		copyButtonText = 'Copied!';
		setTimeout(() => copyButtonText = 'Copy', 2000);
	}
</script>

<div class={`chat-msg role-${msg.role} ${msg.role === 'user' ? 'chat-msg-user' : (msg.role === 'assistant' ? 'chat-msg-assistant' : (msg.role === 'tool' ? 'chat-msg-tool' : 'chat-msg-system'))}`}>
    <div class="msg-header">
        <strong class="chat-sender-label">{senderName}</strong>
        {#if msg.role === 'assistant'}
            <button class="clickable-icon chat-copy-btn" on:click={copyContent}>{copyButtonText}</button>
        {/if}
    </div>
    
    <div class="msg-content" class:chat-whitespace-pre={msg.role !== 'assistant'} bind:this={contentDiv}>
        {#if msg.role !== 'assistant'}
            {msg.content}
        {/if}
    </div>
</div>
