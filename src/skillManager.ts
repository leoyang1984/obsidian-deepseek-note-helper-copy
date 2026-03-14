import { App, TAbstractFile, TFile, TFolder, parseFrontMatterAliases, parseYaml } from 'obsidian';
import DeepSeekPlugin from './main';
import { SkillExecutor } from './skillExecutor';

export interface PipelineStep {
    id: string;
    action: string;
    prompt: string;
}

export interface Skill {
    id: string; // The file path
    name: string;
    action: string;
    mode?: string; // 'pipeline' or undefined
    steps?: PipelineStep[]; // Only populated if mode is 'pipeline'
    icon?: string;
    template: string; // The full body or default prompt
}

export class SkillManager {
    plugin: DeepSeekPlugin;
    app: App;
    executor: SkillExecutor;
    skills: Map<string, Skill> = new Map();
    registeredCommands: Set<string> = new Set();

    constructor(app: App, plugin: DeepSeekPlugin) {
        this.app = app;
        this.plugin = plugin;
        this.executor = new SkillExecutor(app, plugin);
    }

    async loadSkills() {
        const skillsDir = this.plugin.settings.skillsDirectory;
        if (!skillsDir) return;

        // Clean up directory string
        const targetDir = skillsDir.endsWith('/') ? skillsDir : skillsDir + '/';
        const targetDirLower = targetDir.toLowerCase();

        // Instead of relying on getAbstractFileByPath which may fail if the cache isn't fully built on load,
        // we can just grab all markdown files in the vault and filter by path.
        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
            const filePathLower = file.path.toLowerCase();
            if (filePathLower.startsWith(targetDirLower)) {
                await this.loadSkillFromFile(file);
            }
        }

        // Register vault listeners for hot reload
        this.registerWatchers(skillsDir);
    }

    private registerWatchers(skillsDir: string) {
        const skillsDirLower = skillsDir.toLowerCase();
        
        this.plugin.registerEvent(
            this.app.vault.on('modify', async (file) => {
                if (file instanceof TFile && file.path.toLowerCase().startsWith(skillsDirLower) && file.extension === 'md') {
                    await this.loadSkillFromFile(file);
                }
            })
        );

        this.plugin.registerEvent(
            this.app.vault.on('create', async (file) => {
                if (file instanceof TFile && file.path.toLowerCase().startsWith(skillsDirLower) && file.extension === 'md') {
                    await this.loadSkillFromFile(file);
                }
            })
        );

        this.plugin.registerEvent(
            this.app.vault.on('delete', (file) => {
                if (file.path.toLowerCase().startsWith(skillsDirLower)) {
                    this.removeSkill(file.path);
                }
            })
        );
    }

    private async loadSkillFromFile(file: TFile) {
        try {
            const content = await this.app.vault.read(file);
            
            // Manually parse frontmatter to avoid cache latency issues on plugin load, handle \r\n and BOM
            const match = content.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
            
            if (!match) {
                console.log(`Failed to load skill: No valid YAML frontmatter found in ${file.path}`);
                return; 
            }

            const yamlString = match[1];
            const template = match[2].trim();

            let frontmatter;
            try {
                frontmatter = parseYaml(yamlString);
            } catch (e) {
                console.error(`Failed to parse YAML in ${file.path}:`, e);
                return;
            }

            if (!frontmatter || !frontmatter.name) {
                console.log(`Failed to load skill: Missing 'name' in ${file.path}`);
                return;
            }

            if (frontmatter.mode !== 'pipeline' && !frontmatter.action) {
                console.log(`Failed to load skill: Missing 'action' in ${file.path}`);
                return;
            }

            // Check if it's a pipeline mode skill
            let steps: PipelineStep[] | undefined = undefined;
            if (frontmatter.mode === 'pipeline') {
                steps = this.parsePipelineSteps(template);
            }

            const skill: Skill = {
                id: file.path,
                name: frontmatter.name,
                action: frontmatter.action || 'pipeline',
                mode: frontmatter.mode,
                steps: steps,
                icon: frontmatter.icon || 'bot',
                template: template
            };

            this.skills.set(skill.id, skill);
            this.registerCommandForSkill(skill);

        } catch (e) {
            console.error(`Failed to load skill from ${file.path}:`, e);
        }
    }

    private parsePipelineSteps(content: string): PipelineStep[] {
        const steps: PipelineStep[] = [];
        // Regex to split by [STEP: id]
        const stepBlocks = content.split(/^\[STEP:\s*(.+?)\]\s*$/m);
        
        // stepBlocks[0] is everything before the first [STEP: ...]. We ignore it.
        for (let i = 1; i < stepBlocks.length; i += 2) {
            const id = stepBlocks[i].trim();
            const blockContent = stepBlocks[i + 1].trim();
            
            // Extract action: xxx from the block
            const actionMatch = blockContent.match(/^action:\s*(.+)$/m);
            const action = actionMatch ? actionMatch[1].trim() : 'process'; // Default to process
            
            // The prompt is everything after the action line, or the whole block if no action line
            let prompt = blockContent;
            if (actionMatch) {
                prompt = blockContent.replace(actionMatch[0], '').trim();
            }

            steps.push({
                id: id,
                action: action,
                prompt: prompt
            });
        }
        
        return steps;
    }

    private removeSkill(filePath: string) {
        this.skills.delete(filePath);
        // Note: Obsidian doesn't have a direct public API to unregister a command
        // But since we tie the id to the instance, and commands are recreated on reload,
        // it's acceptable for now to just let the old command quietly fail or we just require
        // a plugin reload to fully purge removed commands from the palette.
        // We will just update our internal map.
    }

    private registerCommandForSkill(skill: Skill) {
        const commandId = `skill-${skill.id}`;
        
        this.plugin.addCommand({
            id: commandId,
            name: `Skill: ${skill.name}`,
            icon: skill.icon,
            callback: () => {
                void this.executor.execute(skill).catch(console.error);
            }
        });

        this.registeredCommands.add(commandId);
    }
}
