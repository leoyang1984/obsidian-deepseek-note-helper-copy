# Product Context

## Why this exists?
Traditional AI plugins are either too simple (single prompt) or too rigid (pre-coded features). Users have diverse, evolving needs that are often purely text-based.
The "Magic Remote" (魔法遥控器) philosophy is to give users buttons that they can define themselves, without being programmers.

## Core Problem Solved
- **Step-by-Step Complexity**: AI often fails at one-shot complex tasks. Breaking them into a pipeline significantly improves accuracy.
- **Safety**: Pure automation can cause "hallucinations" in documents. `ask_user` ensures a Human is always the final editor.
- **Speed**: Background processing (`action: process`) means users don't have to wait for the UI to stream results if they only care about the final polished product.

## User Flow
1. User writes a description of a task.
2. User runs "Skill Architect".
3. AI designs a pipeline and asks for confirmation.
4. User saves the generated Markdown.
5. A new command is instantly available in the Command Palette.
6. User runs the new command on any note.
