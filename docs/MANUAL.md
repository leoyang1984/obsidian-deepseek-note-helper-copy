---
tags:
  - obsidian
  - deepseek
  - plugin
  - manual
  - user-guide
  - ai-assistant
  - automation
  - tutorial
  - productivity-tools
---
# Obsidian DeepSeek Plugin - The Ultimate Magic Manual

[English Version Below](#english-version) | [中文版往下看](#中文版) 

---

## English Version

Welcome to the **Obsidian DeepSeek Sidebar Assistant**!
This plugin is not just a standard Q&A bot. Powered by an exclusively developed **Agentic Core**, it grows "hands" and "feet"—proactively reading your knowledge base, rewriting properties, and even automating the creation and organization of your files.

This manual will thoroughly dismantle its **Seven God-Tier Capabilities**. To help you get started quickly, each capability comes with specific application examples for three major scenarios: [Life], [Study], and [Work].

---

## 👁️ 1. "Heaven's Eye": Current Note & Highlight Focus
**What it is:**
DeepSeek is always watching the note you currently have open. No manual copy-pasting is needed. If you **highlight** a specific paragraph in your note, it will prioritize focusing its "gaze" on your selection.

**How to use it:**
- 🏠 **[Life] Reading Recipes**: Open a *Beef Stew Recipe.md*, highlight the text "simmer on low heat for 40 minutes". Ask the sidebar: *"I'm in a hurry today, can I use a pressure cooker instead? How long do I need to pressure cook it?"*
- 📚 **[Study] Breaking Down Obscure Papers**: When reading a psychology note and encountering a difficult paragraph, highlight it and type in the sidebar: *"Use language a primary schooler could understand, give me an analogy to explain this paragraph."*
- 💼 **[Work] Polishing Weekly Reports**: After writing your entire *Week 3 Work Report.md*, **without highlighting anything**, just tell the sidebar: *"Help me check if the wording in this weekly report is professional enough, and provide revision suggestions."*

---

## 🔗 2. "Wall-Piercing": Deep Resolution of Bidirectional Links
**What it is:**
If you embed a `[[Bi-directional Link]]` in your current note referencing another note, DeepSeek will "pierce through the wall," automatically fetching the content of the referenced notes for comprehensive analysis.

**How to use it:**
- 🏠 **[Life] Travel Planning**: In your *7-Day Japan Trip Plan.md*, write `For packing luggage, please refer to [[Universal Travel Gear List]]`. Ask the AI directly: *"Based on this itinerary and combined with my universal list, what extra warm gear do I need to add for winter in Japan?"*
- 📚 **[Study] Knowledge Connection**: In your *Relativity Notes.md*, include a reference `Review [[Newton's First Law]] for what an inertial frame is`. Ask AI: *"Combining Newton's old law, explain why relativity says an absolutely stationary inertial frame does not exist?"*
- 💼 **[Work] Advancing Complex Projects**: In your *Q4 Promo Main Plan.md*, link `[[Financial Budget Sheet]]` and `[[Supplier Cooperation Details]]`. Ask AI: *"Synthesizing the budget limits in the financial sheet and the supplier delivery cycles, summarize the three highest risk stages of this promo."*

---

## 🗂️ 3. "Carpet Search": RAG Vault Exploration (`search_vault`)
**What it is:**
If your question transcends the scope of the current note, the AI automatically triggers high-level permissions, initiating a carpet scan across your entire Obsidian vault to find all relevant notes, summarizing them to give you an answer.

**How to use it:**
- 🏠 **[Life] Sorting Old Accounts**: Tell AI: *"Initiate vault search! Help me look through my diaries from the past two years, find what stomach symptoms I complained about, and what medicine I took at the time."*
- 📚 **[Study] Pre-exam Memory Stitching**: Tell AI: *"Search the whole vault, in what different notes have I mentioned 'Maslow's Hierarchy of Needs'? Summarize their core points into one large review handout."*
- 💼 **[Work] Reusing Historical Assets**: Tell AI: *"I need to write a new HR regulation policy soon. Help me search the vault for all 'Policy Release Email Templates' I've written over the past two years, and extract the most rigorous and formal templates for me to choose from."*

---

## 🏷️ 4. "Geek Hacker": Metadata Automation Manager (`update_metadata`)
**What it is:**
You no longer have to manually type YAML or Properties at the top. The AI can call official background commands to quietly modify attributes for you!

**How to use it:**
- 🏠 **[Life] Auto-Archiving**: After finishing today's *Ramblings.md*, instruct AI: *"Based on the emotional tone of this article, automatically generate at least 3 appropriate `emotion_tags` in the properties, and change the `status` to `archived`."*
- 📚 **[Study] Building a Reading Tracker**: After writing a book review, say: *"Inject the following property fields into this note's metadata: `author` (infer from note content), `read_date` (fill in today), `rating` (rate 1-5 based on my insights)."*
- 💼 **[Work] Batch Advancing Processes**: After discussing customer follow-up strategies with AI in *This Week's High Priority Client List.md*, just command: *"Change the `project_stage` property value of this note from 'contacting' to 'negotiation'."*

---

## ✍️ 5. "Shadow Hand": Full Auto Create & Append (`create_note` & `append_to_note`)
**What it is:**
While sparking ideas with AI, you can directly ask it to "turn these wild inspirations into reality, creating a new article in your vault" or "append it to the end of an existing summary list."

**How to use it:**
- 🏠 **[Life] New Movie List Log**: After fiercely debating recent must-watch cyberpunk movies with AI, say: *"Great chat! Help me create a new note under `/Life/Movies` called `Must-Watch Cyberpunk Movies.md`, and put the top 5 we just finalized into it formatted as a Markdown table."*
- 📚 **[Study] Fleeting "Web Clipper"**: When seeing good sentences in an article, after AI translates them, instruct: *"Awesome, append this English paragraph and your beautiful translation to the very end of my `/English Study/Advanced Corpus.md` file."*
- 💼 **[Work] One-Minute Meeting Minutes**: After jotting down a long string of messy meeting points, just let AI show off: *"Organize this messy note into a formal minutes template, then create a new document named `Feb 27 Weekly Meeting Minutes.md` in my `/Work/Project Minutes` and save it."*

---

## 🌪️ 6. "The Scavenger": Directory Bulk Operation Pre-scan (`modify_files_in_directory`)
**What it is:**
One of the craziest operations! When you want to uniformly refactor all diaries or notes under a specific folder, issue the grand cleansing command. It will first scan the directory to get a manifest report for you. Upon your authorization or confirmation in streaming chat, it will individually append content or update attributes.

**How to use it:**
- 🏠 **[Life] Batch Diary Beautification (Prep Phase)**: *"I want to uniformly organize the property fields of all diaries under my `/Diary/2025` folder. Please scan the directory and tell me how many logs are in there."* (After AI lists them, command: *"Now review them one by one. If any diary mentions 'running', add `#sports` to its YAML tags."*)
- 📚 **[Study] Wrong Question Book**: *"Help me check the `/Wrong Questions/Math` folder. I need to append a `[✅ Needs Review]` tag to the end of every question document that doesn't have a solution steps section. Go scan it first!"*
- 💼 **[Work] Project Rename Cleanup**: *"Our project code name changed from Apollo to Zeus. Help me comprehensively scan all MD notes in `/Project Files/Apollo`. You need to look at every document—if it has an `alias` property, replace Apollo with Zeus and inject it back. Start scanning now!"*

---

## ✨ 7. "Floating Whisper": Hover AI Chat
**What it is:**
Don't want to open the sidebar? No problem. Select any text in your editor, press `Cmd+Shift+J` (Mac) or `Ctrl+Shift+J` (Win), and a sleek, draggable floating window pops up directly on the left side of your screen. Operating like a "temporary immersive sidebar", it takes up about 40% of the width—giving you massive conversational space without occluding the note you're reading on the right. The AI answers right under your fingertips via real-time streaming, and the text you selected stays pinned at the top of the window so you never lose context.

**How to use it:**
- 🏠 **[Life] Casual Browsing**: When reading a long web-clipped article, highlight a confusing paragraph, press `Cmd+Shift+J`, and ask *"TL;DR?"*. Get your answer instantly and hit `Esc` to close the modal.
- 📚 **[Study] Instant Translation**: Highlight a complex foreign language term, hit the hotkey, and command *"Translate this tightly and precisely"*. Click the **Copy** button in the modal and paste it right back in your notes.
- 💼 **[Work] Micro-Refinement**: Highlight a blunt sentence in your drafted email to a client, trigger the floating window, and ask *"Make this sound more polite and professional"*.

---

💡 **Pro Tip**:
All these functions can be used in **combos**. For example: *"Search vault (`search_vault`) for materials related to 'post-mortem', summarize them, create a note (`create_note`) called `Overall Post-Mortem.md` in the root directory to save it, and finally automatically attach the `#postmortem` tag to it (`update_metadata`)."*

Unleash your second brain to the fullest!

<br>
<br>
<br>

---

## 中文版

欢迎使用 **Obsidian DeepSeek 侧边栏管家**！
这个插件不仅仅是一个普通的问答机器，通过独家研发的 **Agentic 核心**，它长出了“手”和“脚”，能主动读取您的知识库、改写属性、乃至自动化创建和整理您的文件。

本手册将全面拆解它的**七大神级能力**。为了帮您快速上手，每个能力都附带了【生活】、【学习】和【工作】三大场景的具体应用范例。

---

## 👁️ 1. “天眼”：当前笔记与高亮聚焦
**是什么：**
DeepSeek 始终盯着您目前打开的笔记。不需要手动复制粘贴，如果您在笔记里**高亮选中**了某一段话，它会优先将目光“聚焦”在您选中的这部分。

**怎么用：**
- 🏠 **【生活】读食谱**：打开一篇《土豆炖牛肉食谱.md》，选中“小火慢炖40分钟”这段文字。向侧边栏提问：“*我今天赶时间，能改成用高压锅吗？需要压多久？*” 
- 📚 **【学习】拆解晦涩论文**：阅读某篇心理学笔记时遇到难以大段艰涩内容，直接将其高亮，然后在侧边栏输入：“*用小学生能听懂的语言，打个比方来解释这段话。*”
- 💼 **【工作】润色周报**：在写完您的《第3周工作周报.md》整篇内容后，**无需高亮任何内容**，直接对侧边栏说：“*帮我检查一下这篇周报的用词是不是足够专业，并给出修改建议。*”

---

## 🔗 2. “穿墙术”：双向链接深度解析
**是什么：**
如果您在这篇笔记里打上了 `[[双链接]]` 引用了别的笔记，DeepSeek 会像会“穿墙穿透”一样，自动把被引用的那些笔记内容也一波吸过来综合分析。

**怎么用：**
- 🏠 **【生活】旅行规划**：在这篇《日本七日游计划.md》中写上一句 `行李打包请参考 [[通用旅行装备清单]]`。直接问 AI：“*根据这份行程，结合我的通用清单，看看日本冬天还需要额外补充啥保暖装备？*”
- 📚 **【学习】知识串联**：在《相对论笔记.md》里包含了一条引用 `关于什么是惯性系请复习 [[牛顿第一定律]]`。问 AI：“*结合牛顿的那个旧定律，解释一下为什么相对论里说绝对静止的惯性系不存在？*”
- 💼 **【工作】复杂项目推进**：在您的《Q4大促主活动方案.md》里链入了 `[[财务预算表]]` 和 `[[供应商合作细则]]`。向 AI 提问：“*综合预算表里的资金限制和供应商的交付周期，总结出这次大促哪三个环节风险最高。*”

---

## 🗂️ 3. “地毯式搜索”：RAG 全库探索 (`search_vault`)
**是什么：**
如果您的提问超越了当前笔记的范畴，AI 会自动触发高阶权限，启动地毯式扫描，在您的整个 Obsidian 库中寻找所有的相关笔记，汇总后给您答案。

**怎么用：**
- 🏠 **【生活】旧账梳理**：对 AI 说：“*启动全库搜索！帮我找找过去两年日记里，我曾经抱怨过哪些胃病症状，并且当时吃了什么药。*”
- 📚 **【学习】考前记忆缝合**：对 AI 说：“*全库检索一下，我到底在哪些不同的笔记里提到过‘马斯洛需求层次理论’？把它们的核心要点汇总成一段大复习讲义。*”
- 💼 **【工作】复用历史资产**：对 AI 说：“*我马上要写一份新的人事规章制度，帮我在库里搜一下过去两年我写过的所有《制度发布邮件模板》，提取出最严谨正式的几套话术供我挑选。*”

---

## 🏷️ 4. “极客黑客”：元数据自动化管家 (`update_metadata`)
**是什么：**
您不必再繁琐地去顶部手敲 YAML 或者 Properties 了，AI 可以直接调用官方命令在后台神不知鬼不觉地帮您修改属性！

**怎么用：**
- 🏠 **【生活】自动归档**：在写完今天的《杂感录.md》后，吩咐 AI：“*根据我这篇文章的情感基调，自动帮我在属性里生成至少 3 个合适的 emotion_tags，并且把 status 改成 archived。*”
- 📚 **【学习】建立阅读追踪表**：写完一本书的读后感，说：“*在这篇笔记的元数据里注入以下属性字段：author（根据笔记内容推断填写）、read_date（填今天）、rating（根据我的感悟打个1-5的分）。*”
- 💼 **【工作】批量推进流程**：在《本周高优先级客户清单.md》中与 AI 探讨完客户跟进策略后，直接下令：“*把这篇笔记的 `project_stage` 属性值从 'contacting' 改成 'negotiation'。*”

---

## ✍️ 5. “无影手”：全自动新建与追加 (`create_note` & `append_to_note`)
**是什么：**
您和 AI 聊着聊着突然火花四溅，可以直接让它“把这篇天马行空的灵感变现，在您的库里新建一篇文章”或者“补充到某篇已存在的汇总清单末尾”。

**怎么用：**
- 🏠 **【生活】新建影单记录**：和 AI 激烈探讨了最近最值得看的赛博朋克电影后，说：“*聊得不错！帮我在 `/生活/观影录` 文件夹下新建一个笔记叫《必看赛博电影名单.md》，把咱们刚才确定的前 5 名用 Markdown 表格整理好写进去。*”
- 📚 **【学习】闪念“剪藏”**：看文章遇到好词好句，让 AI 翻译完之后直接吩咐：“*太赞了，把这段英文和你的精美翻译追加到我的 `/英语学习/高级表达语料库.md` 文件的最末尾去。*”
- 💼 **【工作】一分钟起草会议纪要**：在记录了一长串乱七八糟的会议要点后，直接让 AI 表现：“*把这份乱糟糟的笔记梳理成正规的纪要模板，然后在我的 `/工作/项目纪要` 里新建一篇名为《2月27日周会纪要.md》的文档保存起来。*”

---

## 🌪️ 6. “清道夫”：文件夹批量操作预审 (`modify_files_in_directory`)
**是什么：**
最疯狂的操作之一！当您想统一重构某个文件夹下的所有日记或笔记时，向它下达大清洗指令。它会先扫描目录获取清单名单报告给您，经由您授权或流式对话确认后，它将逐个击破地去追加内容或更新属性。

**怎么用：**
- 🏠 **【生活】批量日记美化 (准备阶段)**：“*我想把我 `/日记/2025年` 文件夹下的所有日记的属性栏统一梳理一下，请扫描该目录，告诉我里面有多少篇日志。*”（AI 列出清单后，您可以继续下令：“*现在依次帮我看它们，如果哪篇日记里提到了‘跑步’，就在它的 YAML tags 里加上 `#运动`。*”）
- 📚 **【学习】错题本刷题**：“*帮我检查 `/错题本/数学` 这个文件夹，我需要给每一道没写过解答步骤的题目文档末尾追加一个 `[✅ 待复习]` 的标签。先去扫描一下吧！*”
- 💼 **【工作】项目重命名大扫除**：“*我们的项目代号从 Apollo 改为了 Zeus，帮我全面扫描 `/项目文件/Apollo` 文件夹的所有 MD 笔记。你需要把每篇文档如果存在 alias 属性的，都把 Apollo 换成 Zeus 并注入回去。马上开始扫描！*”

---

## ✨ 7. “耳边低语”：左侧沉浸式 AI Chat
**是什么：**
不想打开固定的右侧边栏？没问题。在编辑器里随便选中一段文本，按下 `Cmd+Shift+J` (Mac) 或者 `Ctrl+Shift+J` (Win)，一个优雅、支持拖拽和拉伸的悬浮窗口就会直接弹在你的屏幕左侧（默认占据 40% 宽度，高度拉满）。
这相当于一个**随时随地呼出和隐藏的“临时左侧沉浸面板”**，既有全屏宽大舒适的对话和阅读空间，又完全不会遮挡右侧的原笔记内容。
AI 通过极速的流式输出为你解答疑问，而被选中的文本也会被吸附在浮窗顶部，让你在 Obsidian 编辑器失去高亮焦点时也能随时查看上下文。

**怎么用：**
- 🏠 **【生活】网页剪藏随看随问**：看一篇很长的网文剪报时，遇到不懂的专业词汇，直接高亮，按下 `Cmd+Shift+J`，问：“*说人话，这啥意思？*”。看完答案按 `Esc` 就能立刻关掉。
- 📚 **【学习】即时划词翻译**：遇到拗口的外文长难句，划词弹窗，命令：“*信达雅地翻译这段话*”。利用右上角的 **Copy 按钮**，一键复制替换原句。
- 💼 **【工作】微调语气**：写给客户的邮件里有一句稍微有点生硬的话，划词唤起浮窗问：“*把这句话改写得更礼貌、委婉一点*”。

---

💡 **进阶用法 Tip**：
所有这些功能都可以**连招使用**。例如：“*全库搜索 (`search_vault`) 与‘复盘’相关的材料，汇总出一份总结后，在根目录下新建一篇 (`create_note`) 叫《总复盘总结.md》的笔记存起来，最后再附带为它添加 `#复盘` 的标签 (`update_metadata`)*”。

尽情发挥您的第二大脑吧！
