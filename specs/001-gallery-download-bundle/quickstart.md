# Quickstart: Gallery Download Bundle

## Prerequisites

- Node.js environment compatible with project toolchain
- Dependencies installed (`npm install`)
- Active branch: `001-gallery-download-bundle`

## Run

1. Start dev runtime:

```bash
npm run dev
```

2. Open reader page and verify runtime behavior using `chrome-devtools-mcp`.

## Validation Checklist

### Story P1: Confirm-to-download and chunked export

- Open `DownloadConfirmDialog`, click confirm, and verify task starts immediately.
- Validate images are processed in page order and file names use zero-padded numbering (`001`, `002`, ...).
- For a gallery > 200 pages, verify two or more zip downloads are triggered, each containing images + YAML.
- Validate YAML includes intro URL, gallery title, total pages, download time, eHunter version, total chunks, chunk index.

### Story P2: Reusable floating status notifications

- Verify notification stack appears at bottom-right above status-pannel.
- Trigger 2-3 download tasks and verify notifications are vertically stacked without overlap.
- Validate phase transitions in UI: fetching -> compressing -> completed/partial/failed.

### Story P3: Robustness and retry behavior

- Simulate intermittent image request failures and verify per-request policy is initial attempt + 2 retries.
- With `autoRetryByOtherSource` enabled, verify stage order is `ChangeSource` then `Origin`.
- With `autoRetryByOtherSource` disabled, verify only default/origin chain is used.
- Verify partial failures do not abort entire task and final notification reports failure count.

## Responsive Verification

1. Desktop viewport: 1200x900.
2. Mobile viewport: 390x844 (iPhone 12 Pro profile).
3. Confirm notification readability, spacing, and non-overlap in both viewports.

## Regression Checks

- Scroll mode reading flow unchanged while download runs in background.
- Book mode reading flow unchanged while download runs in background.
- No third-party UI component library introduced.

## Optional Static Check

```bash
npm run type-check
```
