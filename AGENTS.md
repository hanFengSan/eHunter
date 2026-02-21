# AGENTS.md

本文件用于说明本仓库中 AI Agent / 自动化协作者 的工作边界与项目上下文，帮助在重构期间保持一致性。

## 项目概述

- 项目名称：eHunter
- 项目类型：面向 e-hentai 网站的油猴脚本插件
- 核心能力：解析原站 DOM，提取漫画图片地址，并渲染更友好的阅读体验
- 阅读模式：
  - 书页模式（Book Mode）
  - 卷轴模式（Scroll Mode）

## 当前状态

- 项目处于**重构阶段**，整体尚未完成。
- 重构与历史代码并存，修改前请先确认目标目录。
- 当前默认入口以测试挂载为主：`src/main.ts` 目前注入 `core/TestApp.vue` + `src/platform/test/AlbumService.ts`，真实站点注入逻辑仍在整理中。

## 目录职责约定

- `core/`：重构版本核心代码
- `src/`：重构版本业务与前端代码
- `core_old/`：旧版本核心代码（历史实现）
- `old/`：旧版本遗留代码（历史实现）

建议：

- 新功能、问题修复、结构优化优先落在 `core/` 与 `src/`。
- 若需参考旧实现，可阅读 `core_old/` 与 `old/`，但避免把历史结构直接复制回重构目录。

## 技术栈

- 构建工具：Vite
- 前端框架：Vue 3
- 样式：Less（历史）+ SCSS（当前 `core/` 中大量样式为 SCSS）
- 语言：TypeScript
- 构建形态：
  - 开发：`vite.config.ts`
  - 产物：`vite.config.prod.ts`（IIFE + `vite-plugin-css-injected-by-js`，用于脚本注入场景）

## 平台范围与重构优先级

- 目标站点不仅有 e-hentai/exhentai，代码中还包含 nhentai 平台实现（`src/platform/nh/`）。
- 若进行重构迁移，优先保证 **EH 平台链路可用**（`src/platform/eh/`），再处理 NH 平台一致性。
- `src/platform/base/` 为跨平台基础层（请求队列、重试、平台 fetch 适配），改动时需同步评估 EH/NH 两端影响。

## 协作原则（给 Agent）

- 在重构完成前，优先保证改动**可读、可迁移、可回退**。
- 涉及旧目录（`core_old/`, `old/`）的改动需明确目的（修复历史 bug / 对照迁移 / 文档补充）。
- 当前存在“新旧模块交叉依赖”现象（`src/` 仍引用部分 `core/` 产物），修改 import 路径时优先做最小改动，避免一次性大迁移。
- 涉及 DOM 解析逻辑时，优先关注：
  - 选择器稳定性
  - 异步加载场景
  - 页面结构变化下的容错
- 涉及阅读器渲染逻辑时，优先关注：
  - 书页模式与卷轴模式行为一致性
  - 图片加载与缓存策略
  - 渲染性能与滚动体验
- 涉及 EH 缓存/抓取链路（`AlbumCacheService`、`ImgUrlListParser`）时，额外注意：
  - 缩略图 Normal/Large 模式切换兼容
  - 本地缓存版本号变更带来的迁移与刷新行为
  - 并发请求队列与超时重试参数对稳定性的影响

## 调试与验证建议

- 与抓取、解析、缓存相关的改动，至少手动验证：
  - 首屏是否可正常拉取页数/标题/当前页
  - 书页模式与卷轴模式切换是否正常
  - 缩略图加载与定位是否正确
  - 原图/换源逻辑（若平台支持）是否可用
- 若修改平台基础请求层（`TextReq`/`ReqQueue`/`MultiAsyncReq`），优先在 EH 与 NH 两个平台链路都做回归。
- 每次开发完后，必须先运行 `npm run dev`，再使用 `chrome-devtools-mcp` 打开页面进行功能验收，确认行为符合预期后才可视为完成。

### 使用 chrome-devtools-mcp 进行测试的注意事项

**重要：开发服务器后台运行**
- 在使用 `chrome-devtools-mcp` 测试前，必须将 `npm run dev` 启动的开发服务器放到后台运行
- 推荐命令：`npm run dev > /tmp/vite-dev.log 2>&1 &`
- 原因：如果在前台运行 `npm run dev`，Bash 工具会因为超时（默认 2 分钟）而中断服务器进程，导致无法进行浏览器测试
- 测试前可通过 `tail /tmp/vite-dev.log` 确认服务器已成功启动

**UI 效果验证流程**
1. 使用 `chrome-devtools-mcp_new_page` 或 `chrome-devtools-mcp_navigate_page` 打开测试页面
2. **重要**：使用 `chrome-devtools-mcp_take_snapshot` 检查页面 DOM 中是否存在 `vite-error-overlay` 元素
   - 如果存在该元素，说明 Vite 编译出错，需要先查看错误信息并修复
   - 可以通过 snapshot 中的错误信息或使用 `chrome-devtools-mcp_take_screenshot` 截图查看详细错误
   - 必须先解决 Vite 错误后才能继续后续测试
3. 使用 `chrome-devtools-mcp_take_snapshot` 获取页面结构，定位交互元素
4. 使用 `chrome-devtools-mcp_click` 等工具进行交互操作
5. **关键步骤**：使用 `chrome-devtools-mcp_take_screenshot` 截图，利用多模态能力确认 UI 视觉效果
   - 截图可以验证样式、布局、颜色、间距等视觉细节
   - 对于弹窗、悬停效果、动画等需要视觉确认的场景尤为重要
6. 重复步骤 3-5 完成完整的交互流程测试

**响应式测试要求**
- 每次 UI 相关的改动都需要测试**两种视口宽度**：
  1. **桌面端（PC）**：1200px × 900px
     - 使用 `chrome-devtools-mcp_emulate` 设置：`{ "viewport": { "width": 1200, "height": 900, "deviceScaleFactor": 1 } }`
  2. **移动端（iPhone 12 Pro）**：390px × 844px
     - 使用 `chrome-devtools-mcp_emulate` 设置：`{ "viewport": { "width": 390, "height": 844, "deviceScaleFactor": 3, "isMobile": true, "hasTouch": true } }`
- 验证响应式布局是否正确：
  - 网格列数变化（如 5 列 → 3 列）
  - 间距和尺寸调整
  - 移动端特定的交互优化
  - 边界情况（如 767px、1023px 等断点附近）

**测试检查清单**
- [ ] 开发服务器已后台运行且可访问
- [ ] 页面加载后已检查 `vite-error-overlay` 元素，确认无编译错误
- [ ] 桌面端视口测试完成并截图确认
- [ ] 移动端视口测试完成并截图确认
- [ ] 关键交互流程（打开、关闭、点击、滚动等）已验证
- [ ] UI 视觉效果（颜色、间距、阴影、圆角等）符合设计预期
- [ ] 响应式断点处的布局变化正常

## 提交建议

- 提交信息建议明确标注作用域，例如：
  - `refactor(core): ...`
  - `feat(src): ...`
  - `fix(platform-eh): ...`
  - `fix(platform-base): ...`
  - `fix(parser): ...`
- 对重构迁移类提交，建议在描述中附上“来源目录/目标目录/迁移原因”。


## 要求
- 所有UI组件都需要自建，不能使用第三方库
- UI默认使用flex布局，且需要显示指定flex-direction

# 平台设计说明和目标
- 参考./design.md

## Active Technologies
- TypeScript 5.9 + Vue 3.5 (Vite 6) + Vue 3 runtime, existing core widget components, existing i18n/store modules (001-add-pageflip-toggle)
- 浏览器端偏好存储（优先 userscript storage，降级 localStorage） (001-add-pageflip-toggle)
- TypeScript 5.9 + Vue 3.5 + Vue runtime, Vite 6, existing core widget components (`DropOption`, `NumDropOption`, `SimpleSwitch`, `SimpleDialog`, `Popover`, `CircleIconButton`) (001-more-settings-modal)
- Userscript storage (`GM_*`) preferred with Platform storage/localStorage fallback; existing reader/cache storage keys (001-more-settings-modal)
- TypeScript 5.9 + Vue 3.5 SFC + SCSS + Vue runtime (`vue`), existing eHunter components and store modules, no new UI library (001-dockable-panel-layout)
- Userscript storage (`GM_getValue`/`GM_setValue`) preferred, fallback to `PlatformService.storageGet/storageSet` (001-dockable-panel-layout)
- TypeScript 5.9 + Vue 3.5 SFC + SCSS + Vue runtime, existing core widget components (`AwesomeScrollView`, `Pagination`), existing app store/actions (001-thumb-expand-modal)
- N/A（本功能不新增持久化） (001-thumb-expand-modal)

## Recent Changes
- 001-add-pageflip-toggle: Added TypeScript 5.9 + Vue 3.5 (Vite 6) + Vue 3 runtime, existing core widget components, existing i18n/store modules
