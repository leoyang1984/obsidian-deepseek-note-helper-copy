# Active Context

## Current Focus
Improved the **Hover AI Chat (v1.6.1)** with better UX: immediate input clearing, scrollable context, and expanded output area.


## Recent Changes
- Implemented `streamAsk` in `LlmService` using native `fetch` API for real-time text streaming.
- Added `DeepSeekHoverView` (`src/hoverView.ts`) for rendering context-aware floating UI.
- Integrated Hover UI triggering via `Cmd+Shift+J` global hotkey.
- Styled Hover UI with glassmorphism, making it movable and resizable.
- Improved Hover UI UX: added instant feedback, scrollable context, and adaptive output height.
- Released version **1.6.1** across `package.json`, `manifest.json`, and `versions.json`.
- Previously: Released version **1.6.0** and implemented the core Hover UI feature.


## Contextual Notes
- Pipeline DSL matches `[STEP: ID]`. ID can be Chinese.
- Variables are injected via `{{}}`.
- `action: ask_user` is the key to human-in-the-loop functionality.
- Commands are registered via `callback` instead of `editorCallback` to maintain visibility in the palette.

## Immediate Tasks
- No critical bugs remaining. 
- Awaiting user feedback on "Professional Translation" and "Skill Architect" demo skills.
