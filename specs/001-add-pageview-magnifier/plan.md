# Implementation Plan: PageView Magnifier Menu

**Branch**: `[001-add-pageview-magnifier]` | **Date**: 2026-02-24 | **Spec**: `/Users/alex/Desktop/works/js/eHunter/specs/001-add-pageview-magnifier/spec.md`
**Input**: Feature specification from `/specs/001-add-pageview-magnifier/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

为 `PageView` 增加上下文化菜单与桌面端放大镜能力：在滚动/书页模式下按既定手势打开菜单，按平台能力控制“加载原图”可用态，支持书页模式奇偶切换，并在桌面端提供仅对当前 PageView 生效的鼠标跟随放大镜（含边界避让、焦点框与倍率切换），同时保持现有阅读模式翻页行为与体验连续性。

## Technical Context

**Language/Version**: TypeScript 5.9 + Vue 3.5 SFC + SCSS  
**Primary Dependencies**: Vue runtime, existing core components (`PageView`, `BookPageView`, `MoreMenuPopover` pattern), existing store/actions and platform capability checks  
**Storage**: In-memory session state only for magnifier toggle/zoom inheritance within one reading session (no persistent storage)  
**Testing**: `npm run type-check` + `npm run dev` + `chrome-devtools-mcp` desktop/mobile viewport manual validation  
**Target Platform**: Browser userscript injection on EH-first reader flows (desktop + mobile interaction paths)  
**Project Type**: Single frontend project (Vite + Vue)  
**Performance Goals**: Pointer-follow magnifier interaction remains visually smooth during normal reading (target perceived 60fps on common desktop devices); menu open response within 100ms in normal page state  
**Constraints**: No third-party UI components; flex layouts explicitly declare `flex-direction`; preserve existing scroll/book mode behavior and central whitespace click semantics; keep changes in `core/` and `src/` only  
**Scale/Scope**: One active reader session, one focused PageView at a time, up to hundreds of pages with per-page menu and magnifier state inheritance across page switches in-session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Principle I (Refactor-First Boundaries): PASS. Planned changes are confined to `core/` and `src/` refactor directories; no `core_old/` or `old/` modifications.
- Principle II (Behavior-Preserving Changes): PASS. Plan preserves existing book/scroll navigation semantics and adds explicit boundary handling for long-press/tap conflict, pointer leave, and page-switch state continuity.
- Principle III (Validation Before Completion): PASS. Plan includes mandatory `npm run dev` and `chrome-devtools-mcp` runtime verification for desktop/mobile.
- Principle IV (Story-Independent Delivery): PASS. Menu entry, desktop magnifier interaction, and context-based menu action visibility remain independently implementable and testable.
- Principle V (Built-in UI and Mode Consistency): PASS. Uses self-built repository UI only; mode-specific behavior is explicit in scope and acceptance.

Post-Design Re-check: PASS (Phase 1 artifacts preserve all constitution constraints and do not introduce violations)

## Project Structure

### Documentation (this feature)

```text
specs/001-add-pageview-magnifier/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── pageview-magnifier.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
core/
├── components/
│   ├── PageView.vue                    # primary magnifier + menu behavior
│   ├── BookPageView.vue                # central whitespace interaction integration
│   └── widget/
│       └── MoreMenuPopover.vue         # existing interaction pattern reference/reuse
├── store/
│   └── app.ts                          # existing reader actions (jump/parity/load-source hooks)
└── style/
    └── *.scss                          # shared tokens and local component styles

src/
├── platform/
│   ├── eh/
│   │   └── ...                         # capability path consumed (no broad refactor expected)
│   └── base/
│       └── ...                         # capability contracts consumed (no behavioral rewrite planned)
└── ...
```

**Structure Decision**: Keep implementation centered in `core/components/PageView.vue` with minimal integration touches in book-mode container and existing action/capability pathways; avoid cross-cutting platform refactors.

## Implementation Entry Notes

- Primary implementation entry: `core/components/PageView.vue`.
- Book mode odd/even action bridge: `core/components/BookPageView.vue` -> `core/store/app.ts`.
- Menu text and labels: `core/assets/i18n.ts`.
- Manual verification baseline and story checks: `specs/001-add-pageview-magnifier/quickstart.md`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified; no complexity exceptions required.
