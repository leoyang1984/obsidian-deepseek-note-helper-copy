<script lang="ts">
    import { afterUpdate } from 'svelte';
    import { chatMessages, isProcessing } from '../../store';
    import MessageItem from './MessageItem.svelte';
    import PipelineApproval from './PipelineApproval.svelte';
    import type { Component, App } from 'obsidian';
    
    export let view: Component;
    export let app: App;
    export let assistantName: string;

    let container: HTMLElement;

    afterUpdate(() => {
        if (container) {
            container.scrollTo(0, container.scrollHeight);
        }
    });
</script>

<div class="chat-messages" bind:this={container}>
    <!-- Initial Greeting -->
    <MessageItem msg={{ role: 'assistant', content: "Hello! Ask me anything. If you highlight text in your note, I will remember it and focus on that. I can also search your entire vault or update your note metadata if you ask me to!" }} {view} {app} {assistantName} />
    
    {#each $chatMessages as msg}
        {#if msg.role === 'pipeline-approval'}
            <PipelineApproval 
                stepId={msg.pipeline_data?.stepId || ''} 
                resolverId={msg.pipeline_data?.resolverId || ''} 
                initialContent={msg.content}
            />
        {:else}
            <MessageItem {msg} {view} {app} {assistantName} />
        {/if}
    {/each}

    {#if $isProcessing}
        <div class="chat-msg role-assistant chat-msg-assistant">
            <div class="msg-header">
                <strong class="chat-sender-label">{assistantName} (thinking...)</strong>
            </div>
            <div class="msg-content">
                <!-- processing indicator empty -->
            </div>
        </div>
    {/if}
</div>
