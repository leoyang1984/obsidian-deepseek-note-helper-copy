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
- [ ] **代码编译**: 在终端运行 `node esbuild.config.js production`（或如果你配了 `"build": "node esbuild.config.js production"` 则运行 `npm run build`）。
- [ ] **Typescript 检查**: 运行 `npx tsc --noEmit` 确保没有漏网的 TS 报错。
- [ ] **打压缩包 (ZIP)**: 将生成的 `main.js`、`manifest.json` 和 `styles.css` 三个文件放入同名文件夹或直接打包为 `.zip` 文件（如 `plugin-release-V3.zip`），准备用于分发。

## 🔴 5. Git 提交与 GitHub 归档 (Sync & Release)
- [ ] **检查修改** (`git status`): 确认没有意外包含如 `test-vault/` 等测试数据（应在 `.gitignore` 外或清理干净）。
- [ ] **Commit**: 编写优雅的提交信息（例如 `feat: implemented contextual slash commands (v1.7.0)`）。
- [ ] **Push**: 推送至 `origin main`。
- [ ] **GitHub Release**: 
  - 去 GitHub 代码仓库新建一期 Release。
  - Tag name 填写版本号（如 `1.7.0`）。
  - Release Title 写上亮眼的新特性介绍。
  - 将刚才打包出的 `.zip` 上传到附件中发布。

---
✅ *完成以上所有步骤，你就完整闭环了一次专业级的 Obsidian 插件更新！*
