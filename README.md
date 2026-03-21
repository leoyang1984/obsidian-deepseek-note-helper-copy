---
tags:
  - obsidian-plugin
  - deepseek
  - ai-assistant
  - agentic-workflow
  - pipeline
  - light-skills
  - second-brain
---
# Obsidian DeepSeek Plugin (DeepSeek Note Helper)

[English Version Below](#english-version) | [中文版往下看](#中文版) 

---

## English Version

A powerful, **Agentic Workflow Engine** designed to transform your Obsidian knowledge base into a living "Second Brain". This plugin goes beyond simple chat—it enables sequential, multi-step AI reasoning directly within your notes.

### 🌟 V3 Breakthrough: Agentic Pipeline System
The latest version introduces **Light Skills**, a Markdown-based DSL that allows you to build complex AI workflows without writing code.
- **Sequential Multi-Step Reasoning**: AI can perform a series of tasks, passing data from one step to the next.
- **Human-in-the-Loop**: High-stakes steps can pause and display **Manual Intervention Cards** in the sidebar, waiting for your approval or edit before proceeding.
- **Variable Injection**: Automatically inject `{{selection}}`, `{{title}}`, and previous step results into your prompts.
- **Headless Processing**: Run complex background tasks (like bulk metadata updates) without UI clutter.

---

### 🚀 Core Features

#### 1. 🔍 Hover AI Chat (v1.6.1)
- **Instant Access**: Select any text in your editor and press `Cmd+Shift+J` (Mac) / `Ctrl+Shift+J` (Win) to summon a sleek AI chat window.
- **Immersive Left-Sidebar Layout**: The window automatically anchors to the left side of your screen (40% width) to give you a massive workspace without blocking your reading pane.
- **Context-Aware**: The window locks onto your highlighted text, ensuring the AI maintains context even if the editor highlight disappears.
- **Real-Time Streaming**: Watch responses stream in instantly.
- **Premium UX**: Draggable, resizable (CSS-based), glassmorphism design, and one-click copy button.

#### 2. 🪄 Slash Command (v1.7.0+)
- **Immediate Inline Editing**: Type `/ds` directly in the editor to pop up a native menu of your Light Skills. 
- **In-Place Replacement**: Seamlessly translate, polish, or generate text right where your cursor is, without opening any side panels.
- **Smart Context Sensing**: The AI intelligently captures your sentence or the entire preceding paragraph if triggered on an empty line.
- **Default Action**: Set your favorite skill to trigger instantly when you press `Enter` after `/ds`.

#### 3. 🤖 Universal UI Assistant (v1.8.0)
- **Natural Language UI Control**: Tell the AI to "close sidebar", "open local graph", or "refresh Dataview".
- **Fuzzy Command Engine**: Our "Keyword Intersection" algorithm finds the right Obsidian command even if you don't know the exact name.
- **Sequential Execution**: Stable multi-command handling with 100ms safety delays.
- **Cross-Plugin Logic**: Control other plugins (like Templater or Dataview) directly from the chat interface.

#### 4. 🧠 Native Tool Calling (RAG & Management)
- Supports any OpenAI-compatible API. Native optimizations for **DeepSeek** and **Kimi**.
- Switch models seamlessly in settings to balance speed, cost, and reasoning power.

- **`search_vault`**: RAG-level vault-wide search to ground AI answers in your existing knowledge.
- **`create_note` & `append_to_note`**: Automate note creation and capture ideas from chat directly into your files.
- **`update_metadata`**: Hands-free management of YAML Properties. Ask AI to "categorize this note" and watch it update your tags automatically.

#### 3. 🔗 Deep Context Awareness
- **Selection Focus**: Highlight text in the editor, and the AI will lock onto it, even if you navigate away.
- **Bidirectional Link Resolution**: AI "follows the trail" of `[[Links]]`, reading linked notes to provide comprehensive, context-aware answers.

#### 5. 🛠️ Skill Architect (AI Metadata Generator)
- Use our built-in **Skill Architect** pipeline to help you *generate new skills*. Just describe what you want the AI to do, and it will write the Markdown DSL for you.

#### 7. 📨 Telegram "Inbox" Synchronization
- **Mobile Capture**: Send text or voice-to-text messages to your dedicated Telegram Bot while on the go.
- **AI Refinement**: Automatically correct typos, remove filler words, and format into structured Markdown using DeepSeek.

#### 8. 🎮 AI Node Branching (Visual Intelligence - v2.2.0)
- **"Aha Moment" on Canvas**: AI responses now appear directly as new nodes on your Canvas, spatially placed next to your selection.
- **Context-Aware Selection**: Use `{{canvas_selection}}` to pass only specific nodes to the AI, reducing noise and token costs.
- **Real-Time Visual Feedback**: Watch a "Thinking..." placeholder appear instantly before being replaced by the final AI response.
- **Glassmorphic Prompt UI**: A redesigned, sleek input modal with blur effects and multiline support for a premium creative experience.

---

### 🛠️ Installation & User Guide

1. **Manual Install**: Download the latest Release (containing `main.js`, `styles.css`, `manifest.json`).
2. **Directory**: Place files in `.obsidian/plugins/obsidian-deepseek-note-helper/`.
3. **Configure**: Enter your **API Key** and optional **Telegram Bot Token** in settings.
4. **Documentation**:
    - [Light Skills Guide V3](docs/LIGHT_SKILLS_GUIDE-V3.md) - **Required Reading** for workflow creation.
    - [User Manual](docs/MANUAL.md) - Comprehensive guide to all features.
    - [Architecture Manual](docs/MANUAL_ARCHITECT.md).
    - [Development Roadmap](docs/ROADMAP.md).
    - [Memory Bank](memorybank/index.md) - Project context & state for developers.
58: 
59: ---
60: 
### ⚖️ License
This project is licensed under a **Custom Non-Commercial License**. Commercial use, unauthorized redistribution, and plagiarism for profit are strictly prohibited. See [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md) for full terms.

---

### 📝 Changelog

- **v2.2.0 (2026-03-21)**: The **AI Node Branching** Milestone. Introduced "Visual Intelligence" for Obsidian Canvas. AI responses can now be instantiated as new nodes directly on the whiteboard with smart spatial placement, real-time visual feedback (placeholder nodes), and a premium glassmorphic prompt UI.
- **v2.0.0 (2026-03-21)**: The **Svelte UI Architecture** Update. Completely rewrote the rendering engine from Vanilla JS to Svelte for ultimate performance and maintainability. Added Pipeline execution progress bars, robust inline approval cards, and instantaneous Slash Command eager deletions.
- **v1.8.0 (2026-03-21)**: The **Universal Assistant** Update. Added sequential tool execution stability, keyword intersection matching, and comprehensive UI linkage guides.
- **v1.7.0 (2026-03-20)**: Added native **Slash Command (`/ds`)** system for in-place text replacement.
- **v1.6.1 (2026-03-19)**: Improved Hover UX with immediate input clearing, scrollable context area.
- **v1.5.1 (2026-03-17)**: Maintenance release. Cleaned up repository and optimized Git synchronization rules.

---

## 中文版

这不仅是一个侧边栏聊天插件，更是一个为 Obsidian 打造的**智能代理工作流引擎 (Agentic Workflow Engine)**。它允许您通过简单的 Markdown 定义多步 AI 推理过程，深度挖掘您的知识库潜能。

### 🌟 V3 重大突破：智能管道系统 (Pipeline)
最新版本引入了 **Light Skills** 系统，通过 Markdown 即可构建复杂的 AI 工作流：
- **顺序多步推理**：AI 可以执行一系列任务，并将上一步的结果作为下一步的输入。
- **人机协同 (Human-in-the-Loop)**：关键步骤会弹出**人工干预卡片**，您可以修改 AI 的中间产物或点击确认后再继续执行。
- **动态变量注入**：自动将 `{{selection}}` (选中文本)、`{{title}}` 和历史步骤产物注入 Prompt。
- **静默后台执行**：支持无需 UI 干扰的后台任务（如批量更新元数据）。

---

### 🚀 核心亮点

#### 1. 🔍 划词浮窗 AI (v1.6.1)
- **即时响应**：在编辑器中选中任意文本，按下 `Cmd+Shift+J` (Mac) / `Ctrl+Shift+J` (Win) 即可随时唤起 AI 对话。
- **沉浸式左侧边栏布局**：浮窗默认以 40% 宽度、95% 高度吸附于屏幕左侧。既保证了充足的问答阅读空间，又完全不遮挡右侧的原笔记。
- **上下文感知**：浮窗会锁定您选中的文本，并在界面上方保留视觉反馈，让提问更有针对性。
- **流式输出**：支持打字机效果的实时进度渲染，告别干等。
- **极致体验**：支持拖拽移动、支持右下角拉伸大小，提供一键复制按钮与毛玻璃质感 UI。

#### 2. 🪄 斜杠命令 (Slash Command - v1.7.0+)
- **无感行内编辑**：在编辑器中随时输入 `/ds` 即可呼出你的“轻技能”快捷菜单。
- **原地替换交互**：直接在光标处为你完成翻译、润色或扩写，无需打开侧边栏，全程不打断心流。
- **智能段落感应**：自动捕获同行的短句内容。如果在空行输入，AI 会自动向上溯源，抓取上一段完整的文字作为处理上下文。
- **一键回车响应**：设置常用的默认技能后，输入 `/ds` 然后回车即可瞬间触发智能执行。

#### 3. 🤖 全能 UI 管家 (Universal UI Assistant - v1.8.0)
- **自然语言操控**：直接对 AI 说“帮我关了侧边栏”、“打开局部关系图”或“刷新 Dataview 数据”。
- **意图顺序执行**：支持连招指令，通过 100ms 延迟确保多级 UI 指令稳定触发。
- **模糊命令引擎**：采用“关键词交集匹配”算法，不记得准确命令名也没关系，AI 懂你。
- **跨插件联动**：直接从对话框控制 Templater 插入模板或强刷 Dataview 视图。

#### 4. 🧠 原生工具调用 (RAG 与管理)面向任务执行
- 支持任何兼容 OpenAI 格式的 API。针对 **DeepSeek** 和 **Kimi** 进行了原生优化。
- 在设置中自由切换，兼顾速度、成本与复杂推理能力。

- **`search_vault`**：RAG 级别的全库搜索，让 AI 的回答基于您的真实笔记。
- **`create_note` 与 `append_to_note`**：自动创建新笔记，或将聊天灵感一键追加到现有文件末尾。
- **`update_metadata`**：全自动 YAML 属性管理。只需说“帮我分类”，AI 就会自动补全标签。

#### 4. 🔗 深度上下文感知
- **局部精准聚焦**：即便切换了页面，AI 也会牢牢记住您刚才高亮选中的内容。
- **双向链接穿透**：AI 会顺着 `[[双向链接]]` 在后台阅读关联笔记，拒绝“盲人摸象”。

#### 6. 🛠️ 技能架构师 (AI 辅助生成)
- 内置 **Skill Architect** 管道。只要描述您的需求，AI 就会为您写好用于定义新技能的 Markdown 脚本。

#### 7. 📨 Telegram “闪念”同步
- **移动端捕获**：在外出时通过 Telegram Bot 发送文字或语音转文字，随时捕捉灵感。
- **AI 自动润色**：利用 DeepSeek 自动修正口语错别字并转化为整齐的 Markdown。

#### 8. 🎮 AI 白板空间衍生 (Canvas Node Branching - v2.2.0)
- **白板上的 “Aha Moment”**：AI 的回答不再局限于侧边栏，而是直接在白板上以新节点的形式“啪”地出现，并自动排列在选区旁。
- **局部选区感知**：支持 `{{canvas_selection}}` 变量。AI 只关注你框选的节点，反馈更精准，Token 消耗更低。
- **实时视觉反馈**：点击生成后，白板会立即出现一个“思考中...”的占位节点，随后原地更新为最终内容。
- **毛玻璃极简 UI**：专为白板设计的半透明沉浸式输入框，支持多行灵活输入。

---

### 🛠️ 安装与使用

1. **手动安装**：下载最新的 Release 包（包含 `main.js`、`styles.css` 和 `manifest.json`）。
2. **存放目录**：放在 `.obsidian/plugins/obsidian-deepseek-note-helper/` 下。
3. **配置**：在设置中填入 **API Key** 以及可选的 **Telegram Bot Token**。
4. **必看文档**：
    - [轻技能 V3 指南](docs/LIGHT_SKILLS_GUIDE-V3.md) - 构建自动化流的必读手册。
    - [用户官方手册](docs/MANUAL.md) - 全功能的深度使用说明。
    - [架构师手册](docs/MANUAL_ARCHITECT.md)。
    - [开发路线图](docs/ROADMAP.md)。
    - [项目记忆库](memorybank/index.md) - 针对开发者和 AI Agent 的技术上下文。
102: 
103: ---
104: 
### ⚖️ 知识产权与授权
本项目采用**自定义商业禁用协议**。严禁任何形式的商业行为、商业性抄袭或未经授权的分发。详情请参阅 [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md)。

---

### 📝 更新日志

- **v2.2.0 (2026-03-21)**：“AI 白板空间衍生”里程碑。正式开启视觉智能阶段。支持 AI 回答直接实例化为白板节点、空间就近放置、实时进度反馈以及全新的毛玻璃沉浸式对话框。
- **v2.0.0 (2026-03-21)**：“Svelte 响应式架构”里程碑。彻底抛弃了原生 DOM 渲染逻辑，将项目视图层完全重写为基于 Svelte 的现代化组件架构。新增了 Pipeline 流畅的动态执行进度条、上下文内联确认卡片，以及瞬间消除的无感斜杠命令体验。
- **v1.8.0 (2026-03-21)**：“全能管家”里程碑。增加串行工具执行稳定性、关键字交集搜索算法、引号清洗逻辑以及全套自然语言指令指南。
- **v1.7.0 (2026-03-20)**：新增 **Slash Command 斜杠命令 (`/ds`)** 与基础 UI 联动功能。支持原地文本即刻替换。
- **v1.6.1 (2026-03-19)**：优化浮窗交互体验，支持即时清空输入框。
- **v1.6.0 (2026-03-18)**：新增**划词浮窗 AI Chat**，支持流式输出、拖拽移动与拉伸大小，显著提升行内交互体验。
- **v1.5.1 (2026-03-17)**：日常维护。清理仓库冗余数据，优化 Git 同步规则。

---
*与 AI 共建您的数字花园！*
