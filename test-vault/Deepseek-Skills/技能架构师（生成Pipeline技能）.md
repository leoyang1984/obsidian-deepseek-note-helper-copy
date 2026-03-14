---
name: "🛠️ 技能架构师：一键生成Pipeline"
mode: "pipeline"
---

[STEP: 步骤1_逻辑设计]
action: process
你是一个精通 Obsidian DeepSeek 插件的技能开发专家。
用户现在提供了一段关于新技能的描述：
{{selection}}

请根据这个描述，设计一个多步 Pipeline 流水线的方案。
包括：
1. 思考需要哪几个步骤？
2. 每个步骤的 action 是什么 (process, ask_user, to_chat, insert_below, replace)？
3. 步骤之间的变量如何传递？
请用简洁的列表列出设计方案。

[STEP: 步骤2_用户确认设计]
action: ask_user
### 🤖 技能设计稿预览
请查看我为您设计的流水线逻辑，您可以直接修改这些步骤，点击 Continue 后我将为您生成最终的 Markdown 代码：

{{步骤1_逻辑设计}}

[STEP: 步骤3_生成最终代码]
action: to_chat
你是一个严谨的代码生成助手。请根据以下设计方案：
{{步骤2_用户确认设计}}

为用户生成一个完整的 Obsidian “轻 SKILL” 笔记内容。

### 示例参考 (必须严格遵守此格式)：
```markdown
---
name: "示例技能名称"
mode: "pipeline"
---
[STEP: 第一步]
action: process
处理 {{selection}} 的指令。

[STEP: 第二步]
action: insert_below
这是基于 {{第一步}} 的最终输出。
```

核心要求：
1. 必须包含完整的 YAML 前言（包含 name 和 mode: pipeline）。
2. 使用 [STEP: ID] 语法。
3. 必须包含用户需要的变量注入（如 {{selection}} 等）。
4. 代码必须放在 Markdown 的代码块内，方便用户复制。

这是您的专属 Pipeline 技能代码：
(请将其保存为 .md 文件并放入您的技能目录)
