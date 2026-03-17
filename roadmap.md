# 🚀 开发计划：Telegram 碎片化捕获与 DeepSeek 智能处理模块

## 📌 核心目标
利用 Telegram Bot 作为移动端文本/语音转文字的输入源，通过 Obsidian 插件在本地（PC 端）后台定时拉取（Polling），结合 DeepSeek 强大的语义理解能力进行错字纠正与格式化，最终无缝追加到本地 Markdown 笔记中。

## ⚙️ 第一阶段：前提准备 (Telegram 侧)
1. **申请 Bot**：在 Telegram 中找 `@BotFather` 发送 `/newbot`，获取 **Bot Token**。
2. **获取 Chat ID**：给自己的 Bot 随便发条消息，然后在浏览器访问 `https://api.telegram.org/bot<你的Token>/getUpdates`，找到返回 JSON 中的 `chat.id`（通常是一串数字），作为白名单凭证。

## 🖥️ 第二阶段：插件设置面板 (Settings Tab) 改造
在现有的插件设置 UI 中，新增一个专属的【Telegram 同步设置】区块：

- [ ] **Telegram Bot Token** (`text` / 密码框): 填入 Bot Token。
- [ ] **My Chat ID** (`text`): 安全白名单，非此 ID 发来的消息直接丢弃。
- [ ] **同步间隔 / Polling Interval** (`number`): 下拉框或输入框，建议默认设为 `60` 秒。
- [ ] **目标笔记路径 / Save Path** (`text`): 例如 `Inbox/Telegram-Notes.md`。如果文件不存在则自动创建。
- [ ] **处理模式 / Processing Mode** (`toggle`): 开关选择 `纯文本直存` 或 `开启 DeepSeek 智能处理`。
- [ ] **专属系统提示词 / Prompt Template** (`textarea`):
      *默认值建议：*
      "你是一个知识库助手。以下是用户在户外通过手机【语音转文字】发来的碎片记录，可能包含同音错别字和中英夹杂错误。请修复错误、去除口语废话，并提炼为结构清晰的 Markdown 格式（可适度加粗或列点）。只返回处理后的内容，不要回复其他废话。原文：\n{{tg_message}}"

## 🧠 第三阶段：核心逻辑实现 (TypeScript)

### 1. 状态管理 (极其重要)
- 需要在插件的 `data.json` 中持久化存储一个变量：`lastUpdateId`（初始值为 0）。
- **作用**：每次拉取 Telegram 消息时，必须带上 `offset=${lastUpdateId + 1}`，否则 Telegram 会把历史消息反复发送给你，导致笔记无限重复记录。

### 2. 轮询模块 (Polling Engine)
- 在插件的 `onload()` 生命周期中，注册一个定时器：
  `this.tgInterval = setInterval(this.fetchTelegramUpdates.bind(this), interval * 1000);`
- 在 `onunload()` 中务必 `clearInterval(this.tgInterval)` 防止内存泄漏。

### 3. 数据处理流 (Data Pipeline)
在 `fetchTelegramUpdates` 异步函数中实现以下流转：
- **发起请求**：`GET https://api.telegram.org/bot<Token>/getUpdates?offset=<lastUpdateId + 1>`
- **安全过滤**：遍历返回的 `result` 数组，校验 `message.chat.id === 设置中的 Chat ID`。
- **提取文本**：获取 `message.text`（忽略图片/语音等非纯文本消息）。
- **更新游标**：将处理过的最大 `update_id` 覆写回 `lastUpdateId` 并保存。

### 4. DeepSeek 融合 (AI Processing)
- 读取提取到的 `message.text`。
- 如果开启了 AI 处理，则替换 `Prompt Template` 中的 `{{tg_message}}`。
- 调用插件现有的 DeepSeek 请求函数（复用原有逻辑）。
- **异常降级机制 (Fallback)**：如果 DeepSeek API 超时或报错，必须 `catch` 住，并将原文本（带上 `[AI处理失败]` 的前缀）进入下一步，确保数据绝对不丢。

### 5. 写入 Obsidian 库 (Vault API)
- 使用 `app.metadataCache.getFirstLinkpathDest(path, "")` 获取目标文件。
- 如果文件不存在：`app.vault.create(path, formattedText)`。
- 如果文件存在：使用 `app.vault.process(file, (data) => { return data + "\n\n" + formattedText })`。
  *(注：推荐使用 `process` 而不是 `modify`，以避免并发写入时的冲突)*

## 🛡️ 第四阶段：边界测试与优化
- [ ] 测试多条消息堆积：在电脑关机时用手机发 5 条消息，开机打开 Obsidian，确认是否一次性成功拉取并按顺序写入。
- [ ] 测试非本人恶意消息：用别的 Telegram 账号给 Bot 发消息，确认插件日志显示 "非授权用户，已忽略"。
- [ ] 测试空消息/纯表情包处理。