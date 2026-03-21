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
}
