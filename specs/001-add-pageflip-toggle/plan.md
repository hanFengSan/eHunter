# Implementation Plan: 书页模式翻页动效开关

**Branch**: `001-add-pageflip-toggle` | **Date**: 2026-02-18 | **Spec**: `/Users/alex/Desktop/works/js/eHunter/specs/001-add-pageflip-toggle/spec.md`
**Input**: Feature specification from `/specs/001-add-pageflip-toggle/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

为书页模式新增可配置翻页动效，提供并默认启用拟真翻页，同时支持平移翻页和无动效。实现采用统一翻页状态流（同一输入管线驱动三种动效）+ 全局偏好持久化策略，确保连续快速翻页下行为可预期、设置在会话间保持一致，且不影响卷轴模式。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9 + Vue 3.5 (Vite 6)  
**Primary Dependencies**: Vue 3 runtime, existing core widget components, existing i18n/store modules  
**Storage**: 浏览器端偏好存储（优先 userscript storage，降级 localStorage）  
**Testing**: `vue-tsc --noEmit` + 手动场景验收（书页模式交互）  
**Target Platform**: 桌面浏览器中的 e-hentai/exhentai userscript 注入场景
**Project Type**: 前端单项目（userscript UI）  
**Performance Goals**: 翻页交互响应在 100ms 内触发可见结果；平移/拟真动效在常见桌面环境保持流畅（目标 55+ FPS）；无动效为即时切换  
**Constraints**: 仅变更书页模式；快速连续翻页不得产生页码错乱；设置为全局偏好；需支持 reduced-motion 策略  
**Scale/Scope**: 新增 1 个全局设置项、3 种动效策略、覆盖书页模式所有翻页入口（点击/滚轮/键盘/自动翻页）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- 当前 `.specify/memory/constitution.md` 仍为占位模板（无可执行条款），无法形成强制门禁。
- 采用替代门禁（来自仓库约束与 AGENTS.md）：
  - 仅在 `core/` 与 `src/` 重构目录内规划，不将旧目录实现直接搬运回新目录。
  - 明确限定本功能仅影响书页模式，不改变卷轴模式行为。
  - 动效相关设计需覆盖异步与高频交互容错（连续翻页、边界页、加载中）。
- **Gate 结果（Phase 0 前）**: PASS
- **Gate 结果（Phase 1 设计后复核）**: PASS（研究与数据模型已覆盖上述约束）

## Project Structure

### Documentation (this feature)

```text
specs/001-add-pageflip-toggle/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── main.ts
└── platform/
   ├── eh/
   ├── nh/
   └── base/

core/
├── components/
│   ├── AlbumBookView.vue
│   ├── TopBar.vue
│   └── widget/
├── store/
│   ├── app.ts
│   └── event.ts
└── assets/
   └── i18n.ts
```

**Structure Decision**: 采用单仓前端结构，在 `core/` 内实现书页模式动效与设置入口，在 `core/store/` 内扩展全局偏好状态与校验逻辑；`src/` 保持平台注入链路不变。

## Complexity Tracking

无额外复杂度豁免项。
