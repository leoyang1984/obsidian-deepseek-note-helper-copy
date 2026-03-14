---
name: "Pipeline 技能模板"
mode: "pipeline"
# 一级 action 在 pipeline 模式下通常不填或填 pipeline
---

# 📖 Pipeline 技能编写指南
# 每个步骤由 [STEP: ID] 开始。ID 建议使用中文，方便后续调用。

[STEP: 步骤1_AI思考]
action: process
# action: process 表示后台静默执行，结果不直接展示。
这是第一步的指令，处理 {{selection}}。

[STEP: 步骤2_人工确认]
action: ask_user
# action: ask_user 会在侧边栏弹出编辑框，等待用户修改或点击确认。
这里显示上一步的结果：
{{步骤1_AI思考}}

[STEP: 步骤3_输出结果]
action: insert_below
# 最后一步可以将结果插入到文档中。
这是最终确认后的版本：
{{步骤2_人工确认}}
