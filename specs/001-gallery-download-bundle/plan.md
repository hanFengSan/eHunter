# Implementation Plan: Gallery Download Bundle

**Branch**: `001-gallery-download-bundle` | **Date**: 2026-02-22 | **Spec**: `/Users/alex/Desktop/works/js/eHunter/specs/001-gallery-download-bundle/spec.md`
**Input**: Feature specification from `/specs/001-gallery-download-bundle/spec.md`

## Summary

Implement confirm-to-download workflow in `DownloadConfirmDialog` that sequentially fetches gallery images, packages them into one or more zip files with a per-chunk YAML metadata file, and surfaces robust real-time progress via a reusable bottom-right floating notification stack. The design prioritizes deterministic ordering, bounded memory via chunking (default 200), and resilient retrieval with source-switch fallback and fixed retry policy (initial + 2 retries).

## Technical Context

**Language/Version**: TypeScript 5.9 + Vue 3.5 SFC + SCSS  
**Primary Dependencies**: Vue runtime (`vue`), existing `AlbumService`/store modules, zip generation library (`jszip`), YAML serialization library (`yaml`)  
**Storage**: Userscript storage preference via existing unified settings persistence (`GM_*` first, platform/local fallback)  
**Testing**: Manual runtime verification via `npm run dev` + `chrome-devtools-mcp`; static check via `npm run type-check` (non-blocking if pre-existing unrelated failures)  
**Target Platform**: Browser userscript runtime on EH reader UI (desktop + mobile viewport validation)
**Project Type**: Single frontend userscript app  
**Performance Goals**: First status notification appears within 1s after confirm; progress updates visible at least once per processed image; chunk finalization starts immediately after chunk fill/completion  
**Constraints**: Keep changes in `core/` and `src/`; no third-party UI component library; sequential image processing only; retry policy fixed at initial attempt + 2 retries; cross-platform safe filename sanitization; mode behavior must remain unchanged outside download flow  
**Scale/Scope**: EH path first; support galleries up to at least 1000 pages through chunked export; concurrent user-triggered download tasks up to 3 with independent notifications

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-Phase 0 Gate Review**

- Principle I (Refactor-First Boundaries): PASS. Planned code changes are limited to `core/` and `src/platform/eh/` refactor paths.
- Principle II (Behavior-Preserving Changes): PASS. Download workflow is isolated from reading-mode rendering; retries/fallback integrate with existing image-source semantics.
- Principle III (Validation Before Completion): PASS. Quickstart includes mandatory `npm run dev` and browser runtime verification using `chrome-devtools-mcp` in desktop/mobile viewports.
- Principle IV (Story-Independent Delivery): PASS. Work is sliceable into (1) download pipeline, (2) notification system, (3) robustness/retry and settings integration.
- Principle V (Built-in UI and Mode Consistency): PASS. Notification UI is self-built Vue component(s), no external UI library introduced; scope explicitly keeps book/scroll behavior parity.

**Post-Phase 1 Design Re-check**

- Principle I: PASS. Data model and contracts map to `core/components`, `core/store`, `core/service`, and `src/platform/eh` only.
- Principle II: PASS. Data model defines sequential download state machine and non-blocking failure handling that avoids mode-specific regressions.
- Principle III: PASS. Quickstart captures required dev runtime and `chrome-devtools-mcp` validation workflow.
- Principle IV: PASS. Contracts and quickstart checks remain independently testable per story.
- Principle V: PASS. UI design uses repository-native components/SCSS and preserves mode-agnostic behavior.

## Project Structure

### Documentation (this feature)

```text
specs/001-gallery-download-bundle/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── gallery-download.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
core/
├── components/
│   ├── dialog/
│   │   └── DownloadConfirmDialog.vue
│   └── status/
│       ├── StatusNotificationStack.vue
│       └── StatusNotificationItem.vue
├── service/
│   ├── AlbumService.ts
│   └── GalleryDownloadService.ts
└── store/
    ├── app.ts
    ├── i18n.ts
    └── settingFieldRuntime.ts

src/
└── platform/
    └── eh/
        └── service/
            └── AlbumServiceImpl.ts
```

**Structure Decision**: Keep a single frontend userscript architecture. Add download orchestration in a dedicated core service, add reusable status notification UI under `core/components/status/`, expose required metadata getters through existing album service abstraction, and wire new setting(s) into existing unified settings flow.

## Complexity Tracking

No constitution violations requiring justification.
