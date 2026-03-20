import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile, Notice } from 'obsidian';
import DeepSeekPlugin from './main';
import { Skill } from './skillManager';
import { ExecuteContext } from './skillExecutor';

export class DeepSeekSlashSuggest extends EditorSuggest<Skill> {
    plugin: DeepSeekPlugin;

    constructor(app: App, plugin: DeepSeekPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
        const line = editor.getLine(cursor.line);
        const sub = line.substring(0, cursor.ch);
        const trigger = this.plugin.settings.slashCommandTrigger || '/ds';
        
        // Match trigger at the start of line or after common delimiters (space, punctuation)
        const triggerMatch = sub.match(new RegExp(`(?:^|[\\s\\.,!?;，。！？；：：])(${this.escapeRegExp(trigger)})(?:\\s+(.*))?$`, 'i'));

        if (!triggerMatch) return null;

        return {
            start: { line: cursor.line, ch: triggerMatch.index! + (triggerMatch[0].startsWith(' ') ? 1 : 0) },
            end: cursor,
            query: triggerMatch[2] || ''
        };
    }

    getSuggestions(context: EditorSuggestContext): Skill[] {
        const query = (context.query || '').toLowerCase();
        let skills: Skill[] = Array.from(this.plugin.skillManager.skills.values());

        if (query) {
            skills = skills.filter(skill => 
                skill.name.toLowerCase().includes(query) || 
                (skill.id && skill.id.toLowerCase().includes(query))
            );
        }
        
        // Elevate the default action to the top if no query so hitting Enter immediately runs it
        if (!query && this.plugin.settings.slashCommandDefaultAction && this.plugin.settings.slashCommandDefaultAction !== 'none') {
            const defaultSkillIdx = skills.findIndex(s => s.id === this.plugin.settings.slashCommandDefaultAction);
            if (defaultSkillIdx !== -1) {
                const defaultSkill = skills.splice(defaultSkillIdx, 1)[0];
                skills.unshift(defaultSkill);
            }
        }
        
        return skills;
    }

    renderSuggestion(skill: Skill, el: HTMLElement) {
        el.createEl('span', { text: `${skill.icon || 'bot'} ${skill.name}` });
        if (skill.action) {
            el.createEl('small', { text: skill.action, cls: 'slash-skill-action', attr: { style: 'opacity: 0.6; font-size: 0.8em; margin-left: 8px;' } });
        }
    }

    selectSuggestion(skill: Skill, evt: MouseEvent | KeyboardEvent) {
        if (!this.context) return;
        const editor = this.context.editor;
        const start = this.context.start;
        const end = this.context.end;

        const execCtx: ExecuteContext = {
            editor: editor,
            source: 'slash',
            triggerRange: { start, end }
        };

        void this.plugin.skillManager.executor.execute(skill, execCtx).catch(e => {
            console.error(e);
            new Notice(`Error executing slash command: ${e.message}`);
        });
    }

    private escapeRegExp(string: string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
