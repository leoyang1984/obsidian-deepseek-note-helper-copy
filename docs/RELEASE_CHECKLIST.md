# 🚀 插件版本发布与收尾自检清单 (Release Checklist)

这份清单用于在每次开发告一段落（完成重大 Feature 或 Bugfix）后，进行标准化的收尾工作。请在每次准备提交 GitHub 和打包 Release 时，逐项核对本清单，确保所有底层文档与配置都已完美同步。

---

## 🟢 1. 版本号与配置同步 (Version Bumping)
- [ ] **`manifest.json`**: 更新 `"version"` 字段至最新版本号。
- [ ] **`package.json`**: 更新 `"version"` 字段以保持一致。
- [ ] **`versions.json`**: 在字典中新增一行当前版本号与所需的 `minAppVersion`（例如 `"1.7.0": "0.15.0"`）。

## 🟡 2. 核心文档梳理 (Documentation)
- [ ] **`README.md`**: 
  - 更新底部的 **Changelog (更新日志)**，简明扼要写出新功能。
  - 如果增加了核心特性，需要在“核心亮点/Core Features”中增加相关描述，并保持中英双语同步更新。
- [ ] **`docs/ROADMAP.md`**: 
  - 将刚才完成的阶段性任务打勾 (`- [x]`)。
  - 将完成的任务从“未来探索 (Future Exploration)”移动到“已完成的里程碑”。
- [ ] **`docs/MANUAL.md` 或 `MANUAL_ARCHITECT.md`** (视情况而定): 
  - 如果添加了全新的用户系统（如 Slash Commands、Hover UI），请为其增加使用说明和“怎么用”的场景示例。

## 🔵 3. 记忆库状态归档 (Memory Bank Updates)
保持 Memory Bank 最新是让下一个接手的 AI Agent 能迅速进入状态的关键。
- [ ] **`memorybank/progress.md`**: 
  - 将新完成的特性挪入 `Completed Milestones 🏁`。
  - 更新 `Current Status` 一句话总结当前状态。
  - 清理或更新 `Next Steps 🚀` 里的待办。
- [ ] **`memorybank/activeContext.md`**: 
  - 更新最近一次的开发意图和解决的痛点。
- [ ] **`memorybank/systemPatterns.md`** (可选): 
  - 如果这次开发引入了全新的架构（如 EditorSuggest 原生拦截、新的 Context Parsing），请在此记录模式与决策原因。

## 🟣 4. 编译与打包 (Build & Package)
- [ ] **执行编译**: 在终端运行 `node esbuild.config.js production`。
- [ ] **提取发行版文件**: 脚手架会自动读取版本号，并在根目录下生成类似于 `releases/v1.7.0/` 的文件夹，里面存放着干净整洁的 `main.js`、`manifest.json`、`styles.css`，这就是你要发布的最终内容。

## 🔴 5. Git 提交与 GitHub 归档 (Sync & Release)
- [ ] **检查修改** (`git status`): 确认不包含敏感测试数据。
- [ ] **Commit & Push**: 编写提交信息并推送代码 (`git push`)。
- [ ] **GitHub Release**: 
  - 前往 GitHub 仓库点击 **Draft a new release**。
  - Tag name 和版本号一致（如 `v1.7.0`）。
  - **进入刚生成好的 `releases/v1.7.0/` 文件夹，将里面的这 3 个文件一并拖入 GitHub 的网页附件框中发布。**

---
✅ *完成以上所有步骤，你就完整闭环了一次专业级的 Obsidian 插件更新！*
