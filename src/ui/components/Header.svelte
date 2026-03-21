<script lang="ts">
    import { isProcessing, stopRequested, requestStop } from '../../store';

    export let onExport: () => void;
    export let onClear: () => void;
</script>

<div class="chat-action-btns">
    <button 
        class="chat-stop-btn" 
        disabled={!$isProcessing || $stopRequested} 
        on:click={requestStop}
    >
        {$stopRequested ? 'Stopping...' : 'Stop'}
    </button>
    <button class="chat-export-btn" on:click={onExport}>Export Logs</button>
    <button on:click={onClear}>Clear Chat</button>
</div>
