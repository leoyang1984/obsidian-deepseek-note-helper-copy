# System Patterns

## Architectural Architecture
The plugin follows a modular approach:
- **Main (main.ts)**: Integration with Obsidian lifecycle, command registration, and settings management.
- **View (view.ts)**: A custom `ItemView` providing the chat interface and the dynamic "Manual Intervention" UI.
- **SkillManager (skillManager.ts)**: Handles the discovery, parsing, and hot-reloading of Markdown skill files. Robust YAML parsing handles `\r\n` and BOM.
- **SkillExecutor (skillExecutor.ts)**: The core engine. Implements a sequential runner for Pipelines and standard single-step actions.
- **LlmService (llmService.ts)**: A headless service for background AI processing during pipeline steps.

## Key Patterns
- **Pipeline DSL**: Uses `[STEP: id]` blocks to define sequential tasks.
- **Variable Injection**: Matches `{{variable_name}}` against a context dictionary populated by `selection`, `title`, and previous `step_id` outputs.
- **Human-in-the-loop (Async Pause)**: Uses a `Promise` based suspension. Encountering `action: ask_user` will:
    1. Activate the AI Chat sidebar.
    2. Render an interactive card with `resolve/reject` buttons.
    3. `await` the user's input before resuming the next pipeline step.
- **Hot Reloading**: Watches the skills folder for `modify/create/delete` events to instantly update commands without restart.

## Tech Stack
- TypeScript
- Obsidian API (Native DOM, Workspace, Vault)
- Esbuild (Build system)
- Llm: DeepSeek / Kimi / OpenAI (Provider based)
