# Progress Log

## Completed Milestones 🏁

### 1. Fundamental Chat UI
- [x] Side panel chat view implementation.
- [x] Message history and streaming response support.

### 2. Light Skill System (V1 & V2)
- [x] Single-step YAML-based skills.
- [x] `to_chat` action.
- [x] Context injection (`{{selection}}`, `{{title}}`, etc.).

### 3. Agentic Pipeline System (V3)
- [x] **Multi-step Runner**: Execution of sequential steps with data passing.
- [x] **Headless Processing**: Background LLM calls without UI clutter (`action: process`).
- [x] **Human-in-the-Loop**: State suspension via `action: ask_user`.
- [x] **Direct Editor Actions**: `replace` and `insert_below` actions implemented.
- [x] **Meta-Skill**: "Skill Architect" for generating pipelines from description.

### 4. Developer Tools
- [x] HOT RELOAD for skill files.
- [x] V3 Documentation and Templates.

### 5. Hover AI Chat (v1.6.1)
- [x] Floating context-aware UI that pops up over the editor.
- [x] **v1.6.1**: Optimized input/output UX (immediate clearing, scrollable context, full-height output).
- [x] Streaming LLM response native support (`streamAsk`).
- [x] Global Hotkey integration (`Cmd+Shift+J`).
- [x] Movable header handle, resizable container, and one-click copy button.
- [x] Visual context indicator so users don't lose track of their highlight.


### 6. Maintenance & Optimization (v1.5.1)
- [x] Cleaned up repository by removing large test folders (`test-vault/`) from Git tracking.
- [x] Optimized `.gitignore` for better development workflow.
- [x] Synchronized version identifiers across all config files.

### 7. The Universal Assistant (v1.8.0)
- [x] In-place native Slash Command trigger (`/ds`).
- [x] Smart Context Sensing (Line and Paragraph level).
- [x] Custom default trigger action (Instantly hitting Enter).
- [x] **Universal UI Linkage**: Control Obsidian UI via Sidebar Chat using full command fuzzy matching (Keyword Intersection logic).
- [x] **Sequential Tool Execution**: Stable multi-command handling with 100ms safety delays. <!-- v1.8.0 -->

### 8. V2.0.0 Svelte Architecture Overhaul
- [x] Completely rewrote `src/view.ts` natively into modular Svelte components.
- [x] Decoupled business logic into `ChatService.ts` and `FileService.ts`.
- [x] Streamlined Svelte store reactivity for seamless chat streams and pipeline approvals.
- [x] Introduced real-time UX for pipelines (progress rendering and inline native step pausing).
- [x] Instant slash command trigger text erasure.

## Current Status
System has evolved to version 2.0.0. The underlying DOM manipulation has been completely replaced by an elegantly reactive Svelte web app. Multi-step workflows, Sidebar Chat, the **Hover UI**, and the new **Slash Commands** are now highly stable, visually smooth, and ready for massive functional scaling.

## Next Steps 🚀
- [ ] Support more variables (date, path, props).
- [ ] Implement conditional branching in pipelines (if/else).
- [ ] Add support for embedding images/files in pipelines.
