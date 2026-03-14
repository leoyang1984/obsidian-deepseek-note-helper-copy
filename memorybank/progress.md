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

## Current Status
System is stable. Multi-step workflows and human-intervention cards are fully functional with premium CSS styling.

## Next Steps 🚀
- [ ] Support more variables (date, path, props).
- [ ] Implement conditional branching in pipelines (if/else).
- [ ] Add support for embedding images/files in pipelines.
