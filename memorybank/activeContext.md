# Active Context

## Current Focus
Implemented the **Hover AI Chat (v1.6.0)** feature. This feature brings real-time AI assistance directly into the editor view with a draggable/resizable modal.

## Recent Changes
- Implemented `streamAsk` in `LlmService` using native `fetch` API for real-time text streaming.
- Added `DeepSeekHoverView` (`src/hoverView.ts`) for rendering context-aware floating UI.
- Integrated Hover UI triggering via `Cmd+Shift+J` global hotkey.
- Styled Hover UI with glassmorphism, making it movable and resizable.
- Fixed `user-select: text` and absolute copy button placement for better UX.
- Released version **1.6.0** across `package.json`, `manifest.json`, and `versions.json`.
- Previously: Cleaned up `.gitignore` and finalized V3 Pipeline features.

## Contextual Notes
- Pipeline DSL matches `[STEP: ID]`. ID can be Chinese.
- Variables are injected via `{{}}`.
- `action: ask_user` is the key to human-in-the-loop functionality.
- Commands are registered via `callback` instead of `editorCallback` to maintain visibility in the palette.

## Immediate Tasks
- No critical bugs remaining. 
- Awaiting user feedback on "Professional Translation" and "Skill Architect" demo skills.
