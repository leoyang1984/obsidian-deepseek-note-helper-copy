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

#### 1. 🤖 Multi-Provider Support (DeepSeek, Kimi, etc.)
- Supports any OpenAI-compatible API. Native optimizations for **DeepSeek** and **Kimi**.
- Switch models seamlessly in settings to balance speed, cost, and reasoning power.

#### 2. 🧠 Native Tool Calling (RAG & Management)
- **`search_vault`**: RAG-level vault-wide search to ground AI answers in your existing knowledge.
- **`create_note` & `append_to_note`**: Automate note creation and capture ideas from chat directly into your files.
- **`update_metadata`**: Hands-free management of YAML Properties. Ask AI to "categorize this note" and watch it update your tags automatically.

#### 3. 🔗 Deep Context Awareness
- **Selection Focus**: Highlight text in the editor, and the AI will lock onto it, even if you navigate away.
- **Bidirectional Link Resolution**: AI "follows the trail" of `[[Links]]`, reading linked notes to provide comprehensive, context-aware answers.

#### 4. 🛠️ Skill Architect (AI Metadata Generator)
- Use our built-in **Skill Architect** pipeline to help you *generate new skills*. Just describe what you want the AI to do, and it will write the Markdown DSL for you.

#### 5. 📨 Telegram "Inbox" Synchronization
- **Mobile Capture**: Send text or voice-to-text messages to your dedicated Telegram Bot while on the go.
- **AI Refinement**: Automatically correct typos, remove filler words, and format into structured Markdown using DeepSeek.
- **Auto-Sync**: Background polling ensures your "Inbox" in Obsidian is always up-to-date.

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

62: - **v1.5.1 (2026-03-17)**: Maintenance release. Cleaned up repository and optimized Git synchronization rules.

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

#### 1. 🤖 多模型支持 (DeepSeek, Kimi 等)
- 支持任何兼容 OpenAI 格式的 API。针对 **DeepSeek** 和 **Kimi** 进行了原生优化。
- 在设置中自由切换，兼顾速度、成本与复杂推理能力。

#### 2. 🧠 原生工具调用 (RAG 与管理)
- **`search_vault`**：RAG 级别的全库搜索，让 AI 的回答基于您的真实笔记。
- **`create_note` 与 `append_to_note`**：自动创建新笔记，或将聊天灵感一键追加到现有文件末尾。
- **`update_metadata`**：全自动 YAML 属性管理。只需说“帮我分类”，AI 就会自动补全标签。

#### 3. 🔗 深度上下文感知
- **局部精准聚焦**：即便切换了页面，AI 也会牢牢记住您刚才高亮选中的内容。
- **双向链接穿透**：AI 会顺着 `[[双向链接]]` 在后台阅读关联笔记，拒绝“盲人摸象”。

#### 4. 🛠️ 技能架构师 (AI 辅助生成)
- 内置 **Skill Architect** 管道。只要描述您的需求，AI 就会为您写好用于定义新技能的 Markdown 脚本。

#### 5. 📨 Telegram “闪念”同步
- **移动端捕获**：在外出时通过 Telegram Bot 发送文字或语音转文字，随时捕捉灵感。
- **AI 自动润色**：利用 DeepSeek 自动修正口语错别字、去除废话，并转化为整齐的 Markdown。
- **后台自动同步**：定时轮询确保您的 Obsidian “收件箱”始终保持最新状态。

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

106: - **v1.5.1 (2026-03-17)**：日常维护。清理仓库冗余数据，优化 Git 同步规则。

---
*与 AI 共建您的数字花园！*
