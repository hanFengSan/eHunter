# Implementation Plan: Dockable Block Layout

**Branch**: `001-dockable-panel-layout` | **Date**: 2026-02-20 | **Spec**: `/Users/alex/Desktop/works/js/eHunter/specs/001-dockable-panel-layout/spec.md`
**Input**: Feature specification from `/specs/001-dockable-panel-layout/spec.md`

## Summary

Implement a reusable dock layout system for reader blocks so users can drag the thumbnail block between left/right/bottom slots and resize the split with mouse and touch (500ms long-press on touch). Persist layout globally per reading mode (scroll/book) and auto-apply the target mode layout on mode switch, while keeping non-overlap and stable reading behavior.

## Technical Context

**Language/Version**: TypeScript 5.9 + Vue 3.5 SFC + SCSS  
**Primary Dependencies**: Vue runtime (`vue`), existing eHunter components and store modules, no new UI library  
**Storage**: Userscript storage (`GM_getValue`/`GM_setValue`) preferred, fallback to `PlatformService.storageGet/storageSet`  
**Testing**: Manual runtime verification via `npm run dev` + `chrome-devtools-mcp`; static type-check via `npm run type-check`  
**Target Platform**: Browser userscript runtime on EH reader UI (desktop + touch-enabled browsers)
**Project Type**: Single frontend userscript app  
**Performance Goals**: Drag/resize visual response appears within one frame budget (target <=16ms per frame on common desktop); mode switch applies saved layout immediately with no visible flicker  
**Constraints**: Keep changes in `core/` and `src/`; no third-party UI components; preserve book/scroll behavior parity; enforce min/max panel size and non-overlap fallback  
**Scale/Scope**: Initial scope is one dock relationship (`ThumbScrollView` + main content), architecture must support adding more blocks without block-specific hardcode

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-Phase 0 Gate Review**

- Principle I (Refactor-First Boundaries): PASS. Planned code touches are in `core/components`, `core/store`, and optionally `src/platform/base/service` only if storage adapter extension is needed.
- Principle II (Behavior-Preserving Changes): PASS. Plan keeps existing scroll/book rendering branches and only changes container layout orchestration; includes invalid drop and small viewport safeguards.
- Principle III (Validation Before Completion): PASS. Quickstart includes mandatory `npm run dev` and browser verification using `chrome-devtools-mcp`.
- Principle IV (Story-Independent Delivery): PASS. Work can be sliced by story: docking first, resize second, reusable registration + persistence third.
- Principle V (Built-in UI and Mode Consistency): PASS. Uses self-built Vue components/SCSS only; layout persistence explicitly independent per mode with auto-apply on switch.

**Post-Phase 1 Design Re-check**

- Principle I: PASS. Data model and contracts map to existing refactor paths only.
- Principle II: PASS. Data model defines mode-scoped layout state and boundary clamping to avoid rendering breakage.
- Principle III: PASS. Quickstart defines runtime verification steps and expected outcomes.
- Principle IV: PASS. Contracts and quickstart preserve independent validation slices for P1/P2/P3 stories.
- Principle V: PASS. No external UI library introduced; mode consistency captured in persisted keying and application rules.

## Project Structure

### Documentation (this feature)

```text
specs/001-dockable-panel-layout/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── layout-contract.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
core/
├── components/
│   ├── ReaderView.vue
│   ├── ThumbScrollView.vue
│   └── layout/
│       ├── DockWorkspace.vue
│       ├── DockHandle.vue
│       └── SplitHandle.vue
├── store/
│   └── app.ts
└── style/
    └── _variables.scss

src/
└── platform/
    └── base/
        └── service/
            └── PlatformService.js
```

**Structure Decision**: Keep a single frontend project structure and implement reusable dock/resizer behavior under `core/components/layout/`, integrating with `ReaderView.vue` and persisted preferences in `core/store/app.ts`.

## Complexity Tracking

No constitution violations requiring justification.

## Validation Log

- `npm run type-check`: fails due to extensive pre-existing type issues outside this feature scope (legacy files in `src/platform/*`, widget typings, and historical strictness gaps). New feature files compile in dev runtime and do not introduce additional blocking runtime errors.
- `npm run dev`: passes and serves app on local Vite port (verified at `http://localhost:5175/`).
- `chrome-devtools-mcp` runtime check: page loads with dock handle, thumbnail panel, and reader content visible; manual flow validation can proceed per `quickstart.md`.
