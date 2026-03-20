---
tags:
  - obsidian-plugin
  - deepseek
  - roadmap
  - development
  - ai-assistant
  - technical-planning
  - feature-tracking
---
# Obsidian DeepSeek Plugin - Future Roadmap

[English Version Below](#english-version) | [中文版往下看](#中文版) 

---

## English Version

The plugin currently has completed its core context awareness, streaming interaction (now fully native and secure via `requestUrl`), and Agentic automated operations. To continuously evolve, we have divided our future plans into completed milestones and new areas to explore:

> [!CAUTION]
> **🌟 Urgent & High Priority (Urgent Bugfix)**
> - [x] **Fix settings persistence failure**: The `this.plugin.saveSettings()` method call error in `main.ts` has been fixed, and configuration can now correctly persist.

## ✅ Phase 1: Interactive Experience (Completed)
- [x] **Hover UI Modal (v1.6.1)**
  Floating, context-aware AI chat window triggered by hotkey (`Cmd+Shift+J`) directly over the editor for immediate, sidebar-free access.
- [x] **Streaming Response (Native)**
  Integrated DeepSeek API and adapted it for native Obsidian `requestUrl` compliance while maintaining fast rendering.
- [x] **Selection Memory (Focus)**
  Resolved the issue of losing highlight upon editor blur, supporting caching of the last selection.
- [x] **One-Click Quick Copy**
  Added a Copy button to the response interface to improve the output closed loop.

## ✅ Phase 2: Deep Knowledge Base Integration (Completed)
- [x] **RAG / Vault Search**
  Achieved full-vault knowledge extraction via the `search_vault` tool.
- [x] **Bidirectional Link Deep Resolution**
  Automatically tracks `[[bi-links]]` and reads associated note contents.
- [x] **Structured Data Injection (Metadata)**
  Automated management of YAML properties through the `update_metadata` tool.

## ✅ Phase 3: Agentic Automation Output (Completed)
- [x] **Fully Automated Note Operations (Function Calling)**
  AI can autonomously execute `create_note` and `append_to_note`.
- [x] **Vault Bulk Modification Pre-scan**
    Achieves safe bulk refactoring through directory scanning and streaming loop calls.
- [x] **Agentic Pipeline System (V3)**
    Introduced "Light Skills" DSL, multi-step execution, and human-in-the-loop support.

---

## 🚀 Future Exploration: Phase 4 and Beyond

### 📸 Phase 4: Multimodal Perception (Vision)
- [ ] **Image Content Recognition and Analysis**
  Allow the model to read `![[images]]` in notes, analyzing flowcharts, handwritten notes, or chart contents.
- [ ] **Image-to-Code**
  One-click conversion of screenshots to Mermaid flowchart code or Markdown tables.

## ✅ Phase 5: Deep Command Flow (Workflow Integration - Completed)
- [x] **Shortcut Keys and Slash Commands**
  Support quick polishing/questioning in-place within the editor via native `/ds` or other configured triggers, featuring smart context sensing.
- [ ] **External Services Extension**
  Allow API integration to push notes to personal blogs or commit via Git.


## ✅ Phase 6: Mobile Inbox (Telegram Sync - Completed)
- [x] **Telegram Bot Polling Engine**: Integration with Telegram API for secure message retrieval.
- [x] **Smart AI Refinement**: Automatic typo correction and Markdown formatting via DeepSeek.
- [x] **Whitelist Security**: Chat ID filtering to prevent unauthorized access.
- [x] **Background capture**: Seamlessly append incoming messages to local inbox notes.

### 🧩 Future Exploration: Phase 7 and Beyond
- [ ] **Phase 7: Local Logic & Multi-Agent Collaboration**
  - **Local LLM Integration**: Support Ollama or LM Studio for 100% offline privacy projects.
  - **Multi-Agent Orchestration**: Allow different "Skills" to communicate with each other autonomously.
  - **Skill Marketplace**: A community platform to share and download "Light Skills" Markdown snippets.
- [ ] **Canvas Integration**
  Support spatial note reading and generation on Obsidian Canvas.
- [ ] **Codebase Refactoring (UI Componentization)**
  Refactor the monolithic `src/view.ts` (currently 34KB of native DOM manipulation) into modular UI components (e.g., using Svelte) to reduce maintenance cost and pave the way for complex features like a visual Pipeline builder.

---
*This document is used for long-term thinking and planning. Welcome to iterate based on new pain points in daily use.*

<br>
<br>
<br>

---

## 中文版

目前插件已完成了核心的上下文感知、安全请求交互以及 Agentic 自动化操作。为了持续进化，我们将未来的规划分为已完成的里程碑和待探索的新领域：

> [!CAUTION]
> **🌟 紧急修复任务 (Urgent & High Priority)**
> - [x] **解决设置持久化失效问题**：已修复 `main.ts` 中的 `this.plugin.saveSettings()` 方法调用错误，现在配置可以正确持久化保存了。

## ✅ 第一阶段：交互体验（已完成）
- [x] **划词浮窗 AI Chat (v1.6.1)**
  通过全局快捷键 (`Cmd+Shift+J`) 在编辑器上方直接唤起悬浮交互窗口，上下文精准锁定，支持拖拽与实时流式输出，无需侧边栏亦可问答。
- [x] **原生极速响应 (Native Response)**
  接入 DeepSeek API 并完美适配了 Obsidian 原生的 `requestUrl` 安全规范。
- [x] **局部文本精准聚焦 (Selection Memory)**
  解决了失焦导致高亮消失的问题，支持缓存最后一次选择。
- [x] **一键快速复制**
  在回复界面加入 Copy 按钮，提升产出闭环。

## ✅ 第二阶段：深度知识库整合（已完成）
- [x] **全库检索增强 (RAG / Vault Search)**
  通过 `search_vault` 工具实现全库知识提取。
- [x] **双向链接深度解析**
  自动追踪 `[[双链]]` 并读取关联笔记内容。
- [x] **结构化数据注入 (Metadata)**
  通过 `update_metadata` 工具实现 YAML 属性的自动化管理。

## ✅ 第三阶段：Agentic 自动化执行（已完成）
- [x] **全自动笔记操作 (Function Calling)**
  AI 可自主执行 `create_note` 和 `append_to_note`。
- [x] **全库批量修改预审**
    通过目录扫描和流式循环调用实现安全的批量重构。
- [x] **智能管道系统 (V3 / Pipeline)**
    引入了 "Light Skills" DSL、多步顺序执行以及人机协作（Manual Intervention）系统。

---

## 🚀 未来探索：第四阶段及以后

### 📸 第四阶段：多模态感知 (Vision)
- [ ] **图片内容识别与分析**
  允许模型读取笔记中的 `![[图片]]`，分析流程图、手写笔记或图表内容。
- [ ] **图片转代码 (Image-to-Code)**
  一键将截图转化为 Mermaid 流程图代码或 Markdown 表格。

## ✅ 第五阶段：深度命令流 (Workflow Integration - 已完成部分)
- [x] **快捷键与斜杠命令 (Slash Commands)**
  支持在编辑器内通过 `/ds` 原生建议菜单唤醒轻技能，实现快速原地润色和智能上下文捕获。
- [ ] **外部服务扩展**
  允许通过 API 联动将笔记推送到个人博客或通过 Git 提交。


## ✅ 第六阶段：移动端“闪念”收件箱 (Telegram 同步 - 已完成)
- [x] **Telegram Bot 轮询引擎**：接入 Telegram API 实现安全的消息调取。
- [x] **DeepSeek 智能润色**：自动修正语音转文字错别字并进行 Markdown 格式化。
- [x] **白名单安全过滤**：基于 Chat ID 的权限校验，防止非法消息注入。
- [x] **静默后台捕获**：无感同步至本地 Inbox 笔记中。

### 🧩 未来探索：第七阶段及以后
- [ ] **第七阶段：本地逻辑与多代理协作**
  - **本地大模型集成**：支持 Ollama / LM Studio 实现 100% 离线隐私项目。
  - **多代理编排**：支持不同“技能 (Skills)”之间自主通信与协作。
  - **技能市场**：用于分享和下载“轻技能”Markdown 脚本的社区平台。
- [ ] **Canvas（白板）集成**
  支持在白板模式下阅读多张卡片并生成新的可视化节点。
- [ ] **核心 UI 重构 (侧边栏组件化)**
  重构当前用于渲染右侧边栏的巨石文件 `src/view.ts` (34KB 的原生 DOM 操作)。计划深度引入 Svelte 以实现组件化，降低后期维护成本，并为未来增加“可视化 Pipeline 拖曳编辑器”等复杂交互做技术储备。

---
*此文档用于长期思考和规划。欢迎在日常使用中根据新痛点进行迭代。*
