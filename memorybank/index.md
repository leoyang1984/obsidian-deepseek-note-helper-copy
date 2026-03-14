# Knowledge Map (Documentation Index)

This file serves as the central hub for all project documentation. AI agents should start here to locate specific context of the codebase.

## 🧠 Memory Bank (Internal Context)
*Focus: Architecture, progress, and development logic.*

- [Project Brief](projectbrief.md): High-level vision and goals.
- [System Patterns](systemPatterns.md): **[CRITICAL]** Technical architecture, Pipeline DSL, and async logic.
- [Active Context](activeContext.md): Current focus and recent changes.
- [Progress Log](progress.md): Historical milestones and future tasks.
- [Development Notes](development_notes.md): Pitfalls, bugs, and specific development instructions.
- [Walkthrough V3](walkthrough_v3.md): Detailed verification and demonstration of the Pipeline system.

## 📖 User Documentation (docs/)
*Focus: Usage guides, manuals, and compliance.*

- [Light Skills Guide V3](../docs/LIGHT_SKILLS_GUIDE-V3.md): The official manual for the current version (Pipeline support).
- [Light Skills Guide V2](../docs/LIGHT_SKILLS_GUIDE-V2.md): Legacy documentation for single-step skills.
- [Plugin Manual](../docs/MANUAL.md): Comprehensive user manual for general plugin features.
- [Architect Manual](../docs/MANUAL_ARCHITECT.md): Detailed guide for the "Skill Architect" philosophy.
- [Review Bot Guidelines](../docs/OB_REVIEW_BOT_GUIDELINES.md): Technical requirements for Obsidian community approval.
- [Roadmap](../docs/ROADMAP.md): Future planning and feature wishlists.

## 🧪 Functional Environment (test-vault/)
*Focus: Integration testing, UI demonstration, and sandbox usage.*

- [DeepSeek-Skills/](../test-vault/Deepseek-Skills/): **[CRITICAL]** The live directory for skill execution. Contains demo pipelines like "Skill Architect" and "Professional Translation".
- [Help Guide](../test-vault/LIGHT_SKILLS_GUIDE-V3.md): An in-vault shortcut to the V3 manual for user convenience during testing.
- `.obsidian/`: Plugin configuration and environment settings for the test vault.

## 📂 Source Code (Internal Index)
- [Main Entry](../src/main.ts): Plugin lifecycle.
- [Pipeline Engine](../src/skillExecutor.ts): Execution logic.
- [Skill Manager](../src/skillManager.ts): DSL Parsing logic.
- [Chat Interface](../src/view.ts): Sidebar UI and Human-in-the-loop components.
