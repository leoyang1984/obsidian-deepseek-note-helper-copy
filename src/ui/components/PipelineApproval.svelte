<script lang="ts">
    import { pipelineResolversStore } from '../../store';

    export let stepId: string;
    export let resolverId: string;
    export let initialContent: string;

    let editValue = initialContent;
    let resolved = false;
    let cancelled = false;

    function handleContinue() {
        const resolveFn = $pipelineResolversStore.get(resolverId);
        if (resolveFn) {
            resolveFn(editValue);
            resolved = true;
        }
    }

    function handleCancel() {
        const resolveFn = $pipelineResolversStore.get(resolverId);
        if (resolveFn) {
            resolveFn(null);
            cancelled = true;
        }
    }
</script>

<div class="chat-msg role-assistant pipeline-approval" class:pipeline-resolved={resolved} class:pipeline-cancelled={cancelled}>
    <div class="msg-header">
        <strong class="chat-sender-label">Pipeline Pause: {stepId}</strong>
        {#if resolved}<span class="pipeline-status"> (Resumed)</span>{/if}
        {#if cancelled}<span class="pipeline-status"> (Cancelled)</span>{/if}
    </div>
    
    <p class="pipeline-instruction">AI has generated the following. You can edit it before continuing:</p>
    
    <textarea class="chat-input pipeline-edit-area" bind:value={editValue} rows="5" disabled={resolved || cancelled}></textarea>

    <div class="pipeline-buttons">
        <button class="mod-cta" on:click={handleContinue} disabled={resolved || cancelled}>✅ Continue</button>
        <button on:click={handleCancel} disabled={resolved || cancelled}>❌ Cancel Pipeline</button>
    </div>
</div>
