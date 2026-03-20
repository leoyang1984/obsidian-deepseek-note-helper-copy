# Active Context

## Current Focus
Implemented **Slash Commands (v1.7.0)** for in-place text replacement, featuring smart paragraph-level context sensing and customizable trigger actions.

## Recent Changes
- Added `DeepSeekSlashSuggest` (`src/slashSuggest.ts`) extending `EditorSuggest`.
- Upgraded `SkillExecutor` to intercept `slash` source events.
- Rewrote `executeReplace` to replace the exact initial trigger range automatically.
- Added intelligent upwards-scanning paragraph context extraction.
- Released version **1.7.0** across all config files and docs.
- Previously: Released version **1.6.1** improving Hover UX and **1.6.0** with Hover UI.


## Contextual Notes
- Pipeline DSL matches `[STEP: ID]`. ID can be Chinese.
- Variables are injected via `{{}}`.
- `action: ask_user` is the key to human-in-the-loop functionality.
- Commands are registered via `callback` instead of `editorCallback` to maintain visibility in the palette.

## Immediate Tasks
- No critical bugs remaining. 
- Awaiting user feedback on newly added inline Slash Commands (`/ds`).
