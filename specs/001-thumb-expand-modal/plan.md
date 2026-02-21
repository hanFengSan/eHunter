# Implementation Plan: Thumb Expand Modal

**Branch**: `[001-thumb-expand-modal]` | **Date**: 2026-02-21 | **Spec**: `/Users/alex/Desktop/works/js/eHunter/specs/001-thumb-expand-modal/spec.md`
**Input**: Feature specification from `/specs/001-thumb-expand-modal/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

为 `ThumbScrollView` 增加可视区域锚定的半透明“展开”按钮，并打开“全部缩略图”弹层完成高密度浏览、分页（每 100 页一段）与点击跳转。实现将复用现有阅读状态与 `Pagination` 组件，在 `core/` 目录内新增自建弹层与网格交互，保持设置类弹窗视觉风格与书页/卷轴模式一致行为。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9 + Vue 3.5 SFC + SCSS  
**Primary Dependencies**: Vue runtime, existing core widget components (`AwesomeScrollView`, `Pagination`), existing app store/actions  
**Storage**: N/A（本功能不新增持久化）  
**Testing**: `npm run type-check` + `npm run dev` + `chrome-devtools-mcp` 手动验收  
**Target Platform**: 浏览器端 userscript 注入场景（EH 优先）
**Project Type**: 单体前端（Vite + Vue）  
**Performance Goals**: 弹层首次打开在常规数据量（<=300 页）下保持可感知即时（目标 <=300ms）；缩略图点击跳转 1 次交互闭环完成  
**Constraints**: 仅使用仓库内自建 UI；默认 flex 布局且显式 `flex-direction`；视觉风格需贴合设置类弹窗；不修改 `core_old/` 与 `old/`  
**Scale/Scope**: 单阅读会话内最多数百页缩略图（按 100 页分段）；支持纵向与横向停靠两种 ThumbScrollView 场景

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Principle I (Refactor-First Boundaries): PASS. 仅修改 `core/components/` 及相关样式/状态，不触碰 `core_old/`、`old/`。
- Principle II (Behavior-Preserving Changes): PASS. 仅扩展缩略图导航入口与弹层，不改变现有解析/缓存链路；书页与卷轴均复用同一跳转动作。
- Principle III (Validation Before Completion): PASS. 实施与验收明确包含 `npm run dev` 以及 `chrome-devtools-mcp` 端到端验证。
- Principle IV (Story-Independent Delivery): PASS. 入口、网格展示、分页跳转三条故事可分步实现并独立验收。
- Principle V (Built-in UI and Mode Consistency): PASS. 仅使用仓库内组件，不引入第三方 UI；模式一致性与风格边界已在 spec 明确。

Post-Design Re-check: PASS（Phase 1 产物未引入违例项）

## Project Structure

### Documentation (this feature)

```text
specs/001-thumb-expand-modal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── thumb-expand-modal.openapi.yaml
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
core/
├── components/
│   ├── ThumbScrollView.vue
│   ├── ReaderView.vue
│   ├── dialog/
│   │   └── ThumbExpandDialog.vue           # new
│   └── widget/
│       └── Pagination.vue                  # reused
├── store/
│   └── app.ts                              # existing jump/index state actions reused
└── style/
    └── _variables.scss                     # existing setting-dialog-like tokens reused

src/
└── platform/
    └── eh/
        └── service/                        # no planned changes; data source unchanged
```

**Structure Decision**: 采用现有单体前端结构，在 `core/components` 增量实现入口与弹层，复用 `core/components/widget/Pagination.vue` 和现有 store 跳转动作，不新增后端或独立服务。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
