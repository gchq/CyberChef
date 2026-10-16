@AGENTS.md

# 中文汉化分支约定

本仓库（`shadowhunter1024/CyberChef-Chinese`）是 CyberChef 的长期维护中文汉化版，只有 `zh-CN` 一个分支（默认分支）。同步官方更新时直接合并官方的 `upstream/master`，不要把 `master` 分支推送到本仓库（会触发官方的 `master.yml`）。推送 `zh-CN` 会自动发布 Release 并更新 GitHub Pages 在线版。详见 `I18N.md`。

## 核心约定

1. **操作的 `name` 永远保持英文。** 它是标识，被配方序列化、URL 分享链接、`Categories.json`、收藏夹（localStorage）、Worker 以及操作间引用所使用。不要修改 `HTMLOperation.name`、`app.operations` 的键或任何写入配方的值（参数值、下拉选项值、`arg-name`）。
2. **只改显示层。** 中文只出现在渲染结果中：`HTMLOperation.displayName`、参数标签、分类标题、DOM 文本与提示属性。从 DOM 读取操作名必须使用 `getOpName(el)`（读取 `data-name`），禁止使用 `textContent` / `innerHTML`。不要让程序逻辑依赖可能被翻译的界面文字（例如按钮文字），应根据状态或 class 判断。
3. **译文放在独立目录。** 所有译文都放在 `src/web/i18n/zh-CN/`（`ui.json`、`categories.json`、`operations.json`），翻译函数放在 `src/web/i18n/i18n.mjs`。词典缺失时必须回退显示英文。不要把中文写进官方源文件。
4. **尽量少改官方文件。** 不修改 `Categories.json`、`OperationConfig.json` 及其生成脚本、`src/web/html/index.html`、`Gruntfile.js`、`package.json`、`src/core/**`。静态文字和固定提示通过 `ui.json` 与 DOM 替换处理；只有带插值或被逻辑依赖的字符串才在官方代码中用 `t()` 包裹。对官方文件的改动要集中、最小，并用 `// i18n` 注释标出。

## 工作流程

- 修改后运行 `npm test`（包含 `tests/node/tests/i18n.mjs`）和 `npx grunt prod`，确认 `build/prod/index.html` 可以离线双击打开。
- 添加或更新译文后运行 `node scripts/i18n-check.mjs`；可用 `--template <file>` 生成待翻译模板。
- `operations.json` 中每个条目的 `src_description` 必须与当前英文说明一致。
- 操作翻译分批进行，不要一次性翻译全部操作。
