# Implementation Plan: 统一更多设置弹窗

**Branch**: `001-more-settings-modal` | **Date**: 2026-02-18 | **Spec**: `/Users/alex/Desktop/works/js/eHunter/specs/001-more-settings-modal/spec.md`
**Input**: Feature specification from `/specs/001-more-settings-modal/spec.md`

## Summary

新增一个统一“更多设置”弹窗入口，替代原顶栏二层“更多设置”展开区；弹窗采用左侧分类导航 + 右侧配置内容结构，覆盖现有全部可配置项（含旧二层高级项），并增加“快捷设置”可见项管理与拖拽排序。关键策略是复用现有配置模型与行为语义，新增统一分组与交互编排层，保证滚动/书页模式规则一致、配置持久化可回退、以及高风险操作（清空缓存并重置全部设置）具备二次确认。

## Technical Context

**Language/Version**: TypeScript 5.9 + Vue 3.5  
**Primary Dependencies**: Vue runtime, Vite 6, existing core widget components (`DropOption`, `NumDropOption`, `SimpleSwitch`, `SimpleDialog`, `Popover`, `CircleIconButton`)  
**Storage**: Userscript storage (`GM_*`) preferred with Platform storage/localStorage fallback; existing reader/cache storage keys  
**Testing**: `npm run type-check`, `npm run dev`, browser runtime verification via `chrome-devtools-mcp`  
**Target Platform**: Userscript-injected browser UI (Chrome/Firefox/Safari; desktop + mobile narrow screen)
**Project Type**: Single frontend userscript project  
**Performance Goals**: Settings modal open/close interaction feels immediate; category jump and active highlight update within one interaction frame under normal album sizes  
**Constraints**: No third-party UI library; preserve EH chain stability first; keep behavior parity for book/scroll mode; destructive reset must require explicit confirmation  
**Scale/Scope**: One reader settings surface; five categories; all existing configurable items consolidated; one global quick-action ordering model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate

- Principle I (Refactor-First Boundaries): PASS - Planned changes stay in `core/` and `src/`; no new feature logic in `core_old/` or `old/`.
- Principle II (Behavior-Preserving Changes): PASS - Plan preserves existing setting semantics, mode constraints, and top-bar behavior while only changing entry/container UI.
- Principle III (Validation Before Completion): PASS - Plan includes mandatory `npm run dev` and `chrome-devtools-mcp` runtime verification in quickstart.
- Principle IV (Story-Independent Delivery): PASS - Stories remain independent slices: entry/modal shell, category setting migration, quick settings management.
- Principle V (Built-in UI and Mode Consistency): PASS - Uses self-built existing components only; explicitly defines mode-specific visibility rules.

## Project Structure

### Documentation (this feature)

```text
/Users/alex/Desktop/works/js/eHunter/specs/001-more-settings-modal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── settings-modal.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
/Users/alex/Desktop/works/js/eHunter/core/
├── components/
│   ├── TopBar.vue
│   ├── QuickActionList.vue
│   ├── [new] MoreSettingsDialog.vue
│   └── widget/
├── store/
│   ├── app.ts
│   └── i18n.ts
└── assets/
    └── i18n.ts

/Users/alex/Desktop/works/js/eHunter/src/
├── platform/base/service/PlatformService.js
└── platform/eh/service/AlbumCacheService.ts
```

**Structure Decision**: Keep all feature implementation in existing refactor UI/state layers under `core/` and reuse storage/cache integrations via existing `src/platform/*` services. No new top-level modules.

## Phase 0: Research Output

- Completed in `/Users/alex/Desktop/works/js/eHunter/specs/001-more-settings-modal/research.md`.
- All technical unknowns resolved: navigation behavior, persistence model, reset semantics, mobile adaptation, and destructive action UX.

## Phase 1: Design & Contracts Output

- Data model defined in `/Users/alex/Desktop/works/js/eHunter/specs/001-more-settings-modal/data-model.md`.
- Contracts defined in `/Users/alex/Desktop/works/js/eHunter/specs/001-more-settings-modal/contracts/settings-modal.openapi.yaml`.
- Validation quickstart in `/Users/alex/Desktop/works/js/eHunter/specs/001-more-settings-modal/quickstart.md`.
- Agent context refresh executed via `.specify/scripts/bash/update-agent-context.sh opencode`.

## Post-Design Constitution Re-Check

- Principle I (Refactor-First Boundaries): PASS - Data model/contracts reference only refactor directories.
- Principle II (Behavior-Preserving Changes): PASS - Contract explicitly keeps mode-filtered quick settings and existing setting semantics.
- Principle III (Validation Before Completion): PASS - quickstart mandates dev server + browser runtime verification.
- Principle IV (Story-Independent Delivery): PASS - API-like contract and model support incremental delivery by story.
- Principle V (Built-in UI and Mode Consistency): PASS - Design uses repository UI components only and codifies mode consistency rules.

## Complexity Tracking

No constitution violations requiring justification.
