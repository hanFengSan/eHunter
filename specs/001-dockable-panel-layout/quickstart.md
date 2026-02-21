# Quickstart: Dockable Block Layout

## Prerequisites

- Node.js environment compatible with current project toolchain
- Dependencies installed (`npm install`)
- Active branch: `001-dockable-panel-layout`

## Run

1. Start dev runtime:

```bash
npm run dev
```

2. Open the reader page and verify runtime behavior with `chrome-devtools-mcp`.

## Validation Checklist

### Story P1: Docking

- Drag thumbnail header (`EHUNTER`) and dock from left -> right.
- Drag thumbnail header and dock to bottom.
- Drag outside valid target and confirm layout reverts to previous valid state.

### Story P2: Resizing

- Hover split boundary on pointer devices and verify resize affordance appears.
- Drag boundary to resize and verify clamp behavior (no invisible main content).
- On touch device, ensure short tap does not drag; long-press (500ms) activates drag/resize.

### Story P3: Reusability and persistence

- Confirm layout model is block-registry driven (no thumbnail-only logic branch for core behavior).
- Switch reading mode `book <-> scroll` and verify saved layout auto-applies for target mode.
- Refresh page and verify each mode restores its own global layout.

## Regression Checks

- Scroll mode content remains readable and interactive after docking/resizing.
- Book mode page turning and pagination remain functional after mode-specific layout apply.
- No third-party UI component library added.

## Future Block Onboarding

1. Register the block metadata in `core/model/layout.ts` (`blockId`, `allowedSlots`, `minSizePx`, `maxSizePx`, `touchLongPressMs`).
2. Provide a handle region in the block header and emit dock/resize start events compatible with `DockWorkspace`.
3. Mount the block through `DockWorkspace` slot projection in `core/components/ReaderView.vue`.
4. Ensure mode-scoped persistence is sanitized via `core/store/layoutPreference.ts` and applied from `core/store/app.ts`.

## Optional Static Check

```bash
npm run type-check
```
