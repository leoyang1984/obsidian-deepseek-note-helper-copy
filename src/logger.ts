export interface LogEntry {
    timestamp: string;
    type: 'chat' | 'tool' | 'pipeline' | 'system' | 'api';
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    data?: any;
}

export class ExecutionLogger {
    private logs: LogEntry[] = [];

    log(type: LogEntry['type'], role: LogEntry['role'], content: string, data?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            type,
            role,
            content,
            data
        };
        this.logs.push(entry);
        console.log(`[DeepSeek Log] ${role.toUpperCase()}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    }

    clear() {
        this.logs = [];
    }

    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    getMarkdown(): string {
        let md = `# DeepSeek Note Helper Execution Logs\n\n`;
        md += `Generated at: ${new Date().toLocaleString()}\n\n`;
        md += `---\n\n`;

        for (const log of this.logs) {
            md += `### [${log.timestamp}] ${log.role.toUpperCase()} (${log.type.toUpperCase()})\n`;
            md += `${log.content}\n\n`;
            if (log.data) {
                md += `**Data:**\n\`\`\`json\n${JSON.stringify(log.data, null, 2)}\n\`\`\`\n\n`;
            }
            md += `---\n\n`;
        }

        return md;
    }
}
