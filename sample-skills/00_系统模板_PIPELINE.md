---
name: "00 系统模板: Pipeline"
mode: "pipeline"
---
[STEP: 步骤1]
action: process
在这里填写你的指令...

[STEP: 步骤2]
action: ask_user
让用户确认中间结果：{{步骤1}}

[STEP: 步骤3]
action: replace
最终输出：{{步骤2}}
