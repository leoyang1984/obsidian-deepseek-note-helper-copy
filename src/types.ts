export interface ChatMessage {
    role: 'user' | 'assistant' | 'system' | 'tool' | 'pipeline-approval';
    content: string | null;
    tool_calls?: Array<{ id: string, type: string, function: { name: string, arguments: string } }>;
    tool_call_id?: string;
    name?: string;
    pipeline_data?: { stepId: string, resolverId: string };
}
