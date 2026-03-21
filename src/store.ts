import { writable } from 'svelte/store';
import type { ChatMessage } from './types';

// Global state for Chat UI
export const chatMessages = writable<ChatMessage[]>([]);
export const isProcessing = writable<boolean>(false);
export const stopRequested = writable<boolean>(false);
export const activeAssistantName = writable<string>('Assistant');

// Context memories
export const lastSelection = writable<string>('');

// Pipeline intervention
export const pipelineResolversStore = writable<Map<string, (val: string | null) => void>>(new Map());

export const pipelineProgress = writable<{
    skillName: string;
    currentStep: number;
    totalSteps: number;
    action: string;
} | null>(null);

// Functions to manipulate state easier
export function addMessage(msg: ChatMessage) {
    chatMessages.update(msgs => [...msgs, msg]);
}

export function clearMessages() {
    chatMessages.set([]);
    pipelineResolversStore.set(new Map());
}

export function requestStop() {
    stopRequested.set(true);
}

export function resetStop() {
    stopRequested.set(false);
}
