<script lang="ts">
    import { isProcessing } from '../../store';

    export let onSend: (text: string) => void;

    let inputText = '';

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    function send() {
        if (!inputText.trim() || $isProcessing) return;
        onSend(inputText);
        inputText = '';
    }
</script>

<div class="chat-input-container">
    <slot></slot>
    <textarea 
        class="chat-input"
        placeholder="Type your message... (Shift+enter for newline, Enter to send)"
        bind:value={inputText}
        on:keydown={handleKeydown}
        disabled={$isProcessing}
    ></textarea>
    <button class="mod-cta" on:click={send} disabled={$isProcessing}>Send</button>
</div>
