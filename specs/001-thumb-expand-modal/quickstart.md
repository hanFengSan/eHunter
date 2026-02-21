# Quickstart: Thumb Expand Modal

## Prerequisites

- Node.js environment compatible with current project toolchain
- Dependencies installed (`npm install`)
- Active branch: `001-thumb-expand-modal`

## Run

1. Start dev runtime:

```bash
npm run dev
```

2. Open reader page and validate runtime behavior with `chrome-devtools-mcp`.

## Validation Checklist

### Story P1: Floating expand entry

- Set thumbnail panel to side dock and verify entry is fixed to visible right edge.
- Set thumbnail panel to bottom dock and verify entry is fixed to visible bottom edge.
- Scroll thumbnail list to random positions and verify entry remains viewport-anchored.

### Story P2: Full thumbnail modal density and style

- Click entry and verify modal opens without title.
- Verify each thumbnail item shows image + page number at bottom area.
- On wide viewport, verify 5 columns and at least 4 visible rows.
- On narrow viewport, verify 3 columns.
- Confirm modal shell style matches existing settings dialog style language.

### Story P3: Segmented pagination and jump

- Use bottom `Pagination` to switch 100-page segments.
- Open modal when current reading page is in a non-first segment and verify default segment focus is correct.
- Click a thumbnail item and verify modal closes and reader jumps to target page.

## Edge & Regression Checks

- Total pages <= 100: pagination remains visible with single segment state.
- Thumbnail load failure: item still displays page number and remains jumpable.
- Last row incomplete: grid alignment remains stable, no duplicate/invalid page labels.
- Scroll mode and book mode both preserve existing reading behavior after jump.
- No third-party UI component library introduced.

## Optional Static Check

```bash
npm run type-check
```

## Verification Record (2026-02-21)

- `npm run type-check`: PASS
- `npm run dev` + `chrome-devtools-mcp`: PASS
- Runtime checks passed:
  - Expand button is visible in thumb viewport and opens modal.
  - Modal has no title and uses settings-dialog style language.
  - Thumbnail grid shows page numbers and supports click-to-jump with auto-close.
  - Bottom pagination is visible and functional (single-segment state confirmed at <=100 pages).
