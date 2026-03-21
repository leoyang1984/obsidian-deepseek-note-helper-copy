import { App, TFile, TFolder } from 'obsidian';

export class FileService {
    app: App;
    pluginSettings: any;

    constructor(app: App, pluginSettings: any) {
        this.app = app;
        this.pluginSettings = pluginSettings;
    }

    async resolveFile(pathStr: string): Promise<TFile | null> {
        // 1. Try exact path first
        let file = this.app.vault.getAbstractFileByPath(pathStr);
        if (file instanceof TFile) return file;

        // 2. Try adding .md if missing
        if (!pathStr.endsWith('.md')) {
            file = this.app.vault.getAbstractFileByPath(pathStr + '.md');
            if (file instanceof TFile) return file;
        }

        // 3. Try to find by basename globally (most common failure case)
        const basename = pathStr.split('/').pop()?.replace('.md', '') || pathStr;
        const allFiles = this.app.vault.getMarkdownFiles();
        const found = allFiles.find(f => f.basename.toLowerCase() === basename.toLowerCase());
        return found || null;
    }

    async executeReadNote(path: string): Promise<string> {
        const file = await this.resolveFile(path);
        if (!file) return `Error: Note "${path}" not found. Try searching for it first.`;
        const content = await this.app.vault.read(file);
        return `Full content of [[${file.basename}]] (Path: ${file.path}):\n\n${content}`;
    }

    async executeSearchVault(query: string): Promise<string> {
        const files = this.app.vault.getMarkdownFiles();
        const results: string[] = [];
        const lowerQuery = query.toLowerCase();
        
        const logDir = (this.pluginSettings.logDirectory || 'DeepSeek-Logs').toLowerCase();
        const skillsDir = (this.pluginSettings.skillsDirectory || 'DeepSeek-Skills').toLowerCase();

        // 1. Filter out logs and skills to prevent pollution - more aggressive match
        let filteredFiles = files.filter(file => {
            const path = file.path.toLowerCase();
            if (path.includes(logDir)) return false;
            if (path.includes(skillsDir)) return false;
            return true;
        });

        // 2. Prioritize exact basename matches
        const exactMatches = filteredFiles.filter(f => f.basename.toLowerCase() === lowerQuery);
        
        // 3. Sort by last modified for the rest
        filteredFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);

        // Put exact matches first in the search process
        const sortedFiles = [...exactMatches, ...filteredFiles.filter(f => !exactMatches.includes(f))];

        for (const file of sortedFiles) {
            const content = await this.app.vault.cachedRead(file);
            const contentLower = content.toLowerCase();
            const nameLower = file.basename.toLowerCase();
            const pathLower = file.path.toLowerCase();
            
            if (contentLower.includes(lowerQuery) || nameLower.includes(lowerQuery) || pathLower.includes(lowerQuery)) {
                const isExactMatch = nameLower === lowerQuery;
                const matchIndex = contentLower.includes(lowerQuery) ? contentLower.indexOf(lowerQuery) : 0;
                const start = Math.max(0, matchIndex - 60);
                const end = Math.min(content.length, matchIndex + 140);
                
                if (isExactMatch) {
                    // Return LARGER snippet or full content for exact matches to save a 'read_note' turn
                    const fullOrLarge = content.length < 3000 ? content : content.substring(0, 3000) + '... (truncated, use read_note for full)';
                    results.push(`--- EXACT MATCH: [[${file.basename}]] (Path: ${file.path}) ---\nFull/Large snippet content:\n${fullOrLarge}\n`);
                } else {
                    results.push(`--- File: [[${file.basename}]] (Path: ${file.path}) ---\n...${content.substring(start, end)}\n`);
                }
                
                if (results.length >= 5) break; 
            }
        }

        if (results.length === 0) return `No files found matching "${query}".`;
        return `Search results for "${query}" (Excluding logs/skills):\n\n` + results.join('\n');
    }

    async executeUpdateMetadata(properties: Record<string, string | number | boolean | string[]>): Promise<string> {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return "Error: No active file to update.";

        try {
            await this.app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
                for (const [key, value] of Object.entries(properties)) {
                    frontmatter[key] = value;
                }
            });
            return `Successfully updated metadata for ${activeFile.basename}.`;
        } catch (e) {
            return `Failed to update metadata: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async executeCreateNote(path: string, content: string): Promise<string> {
        try {
            if (!path.endsWith('.md')) path += '.md';
            const normalizedPath = path.replace(/^\//, '');
            const fileExists = this.app.vault.getAbstractFileByPath(normalizedPath);
            if (fileExists) {
                return `Error: File already exists at path ${normalizedPath}`;
            }
            await this.app.vault.create(normalizedPath, content);
            return `Successfully created new note at ${normalizedPath}`;
        } catch (e) {
            return `Failed to create note: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async executeAppendToNote(path: string, content: string): Promise<string> {
        try {
            if (!path.endsWith('.md')) path += '.md';
            const file = await this.resolveFile(path);
            if (!file) {
                return `Error: Markdown file not found for "${path}". Try searching for it first if you're unsure of the path.`;
            }
            await this.app.vault.append(file, '\n' + content);
            return `Successfully appended content to ${file.path}`;
        } catch (e) {
            return `Failed to append to note: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async executeModifyDirectory(directoryPath: string, instruction: string): Promise<string> {
        try {
            const normalizedPath = directoryPath.replace(/^\//, '').replace(/\/$/, '');
            const folder = normalizedPath === '' ? this.app.vault.getRoot() : this.app.vault.getAbstractFileByPath(normalizedPath);

            if (!folder) {
                return `Error: Directory not found at path ${normalizedPath || '/'}`;
            }

            const markdownFiles: TFile[] = [];

            // Recursive helper to get all MD files
            const getFiles = (f: import("obsidian").TAbstractFile) => {
                if (f instanceof TFolder) {
                    for (const child of f.children) {
                        getFiles(child);
                    }
                } else if (f instanceof TFile && f.extension === 'md') {
                    markdownFiles.push(f);
                }
            };

            getFiles(folder);

            if (markdownFiles.length === 0) {
                return `No markdown files found in directory ${normalizedPath || '/'}`;
            }

            const filePaths = markdownFiles.map(f => f.path).join(', ');
            return `Found ${markdownFiles.length} files in directory ${normalizedPath || '/'}. The files are: ${filePaths}. \nTo apply the instruction "${instruction}", please call 'update_metadata' or 'append_to_note' on these files one by one.`;
        } catch (e) {
            return `Failed to process directory: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async executeReadCanvas(path: string): Promise<string> {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile) || file.extension !== 'canvas') {
            return "No active canvas file found or the file is not a .canvas file.";
        }

        try {
            const content = await this.app.vault.read(file);
            const data = JSON.parse(content);
            const nodes = data.nodes || [];
            const edges = data.edges || [];

            let result = `--- Canvas Context: [[${file.basename}]] ---\n\nNodes:\n`;
            
            const nodeMap = new Map();
            nodes.forEach((node: any) => {
                nodeMap.set(node.id, node);
                let nodeDesc = `- [ID: ${node.id}] `;
                if (node.type === 'text') {
                    nodeDesc += `(Text): ${node.text}`;
                } else if (node.type === 'file') {
                    nodeDesc += `(File): [[${node.file}]]`;
                } else if (node.type === 'link') {
                    nodeDesc += `(URL): ${node.url}`;
                } else if (node.type === 'group') {
                    nodeDesc += `(Group): ${node.label || 'Untitled Group'}`;
                } else {
                    nodeDesc += `(Other: ${node.type})`;
                }
                result += nodeDesc + '\n';
            });

            if (edges.length > 0) {
                result += '\nConnections:\n';
                edges.forEach((edge: any) => {
                    const from = nodeMap.get(edge.fromNode);
                    const to = nodeMap.get(edge.toNode);
                    const fromLabel = from ? (from.text || from.file || from.url || from.label || edge.fromNode) : edge.fromNode;
                    const toLabel = to ? (to.text || to.file || to.url || to.label || edge.toNode) : edge.toNode;
                    result += `- "${fromLabel}" -> "${toLabel}"${edge.label ? ` (Label: ${edge.label})` : ''}\n`;
                });
            }

            return result;
        } catch (e) {
            return `Error parsing canvas file: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    async getSelectedCanvasNodes(): Promise<{ text: string, x: number, y: number, width: number, height: number }[]> {
        const canvasView = this.app.workspace.getActiveViewOfType(TFile as any); // Dynamic cast
        const activeView = this.app.workspace.activeLeaf?.view as any;
        
        if (activeView?.getViewType() !== 'canvas') return [];
        
        const canvas = activeView.canvas;
        const selection = canvas.selection;
        if (!selection || selection.size === 0) return [];

        const selectedNodes: any[] = [];
        selection.forEach((node: any) => {
            if (node.unknownData) { // It's a node
                selectedNodes.push({
                    text: node.text || node.file?.path || node.url || node.label || "",
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height
                });
            }
        });
        return selectedNodes;
    }

    async createCanvasNode(text: string, existingId?: string): Promise<string> {
        const activeView = this.app.workspace.activeLeaf?.view as any;
        if (activeView?.getViewType() !== 'canvas') {
            return "";
        }

        try {
            const canvas = activeView.canvas;
            const selection = canvas.selection;
            const data = canvas.getData();
            
            let id = existingId;
            let targetX = 0;
            let targetY = 0;

            if (id) {
                const node = data.nodes.find((n: any) => n.id === id);
                if (node) {
                    node.text = text;
                    canvas.setData(data);
                    canvas.requestSave();
                    return id;
                }
            }

            // Calculation for new node only if not updating or if id not found
            if (selection && selection.size > 0) {
                let maxX = -Infinity;
                let minY = Infinity;
                selection.forEach((node: any) => {
                    if (node.x + node.width > maxX) maxX = node.x + node.width;
                    if (node.y < minY) minY = node.y;
                });
                targetX = maxX + 50; 
                targetY = minY;
            } else {
                const viewState = activeView.getState();
                targetX = (viewState.x || 0) + 100;
                targetY = (viewState.y || 0) + 100;
            }

            if (!id) {
                id = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
            }

            data.nodes.push({
                id: id,
                x: targetX,
                y: targetY,
                width: 400,
                height: 200,
                type: 'text',
                text: text
            });

            canvas.setData(data);
            canvas.requestSave();

            return id;
        } catch (e) {
            console.error("Failed to create/update canvas node:", e);
            return "";
        }
    }
}
