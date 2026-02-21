# Data Model: Dockable Block Layout

## 1) LayoutBlock

- Description: A workspace block that can participate in dock and resize operations.
- Fields:
  - `blockId` (string, required): Stable unique identifier (for v1: `thumb`, `main`).
  - `title` (string, required): Display name used in header/handle.
  - `dockable` (boolean, required): Whether the block can be moved between slots.
  - `resizable` (boolean, required): Whether the block supports split resize.
  - `allowedSlots` (string[], required): Allowed dock targets (`left|right|bottom`).
  - `minSizePx` (number, required): Lower clamp for width/height by orientation.
  - `maxSizePx` (number, required): Upper clamp for width/height by orientation.
  - `touchLongPressMs` (number, required): Gesture activation threshold (fixed to `500` in v1).
- Validation rules:
  - `blockId` MUST be unique in workspace registry.
  - `allowedSlots` MUST be non-empty for `dockable=true`.
  - `minSizePx < maxSizePx`.

## 2) DockSlot

- Description: A deterministic target position in the reader workspace.
- Fields:
  - `slotId` (enum, required): `left|right|bottom`.
  - `orientation` (enum, required): `vertical` for left/right, `horizontal` for bottom.
  - `occupiedBy` (string|null): `blockId` currently placed in slot.
- Validation rules:
  - At most one block occupies one slot.
  - `occupiedBy` MUST reference a registered `LayoutBlock` when non-null.

## 3) SplitBoundary

- Description: Interactive divider between adjacent docked blocks.
- Fields:
  - `boundaryId` (string, required): Stable ID for persistence and interaction.
  - `betweenBlocks` (tuple<string,string>, required): Pair of adjacent block IDs.
  - `axis` (enum, required): `x` for width resize, `y` for height resize.
  - `currentSizePx` (number, required): Active size of primary block for this boundary.
  - `minSizePx` (number, required): Effective min clamp.
  - `maxSizePx` (number, required): Effective max clamp.
- Validation rules:
  - `currentSizePx` MUST remain clamped in `[minSizePx, maxSizePx]`.
  - Boundary MUST exist only when both `betweenBlocks` are visible.

## 4) ModeLayoutConfiguration

- Description: Persisted layout state for one reading mode.
- Fields:
  - `schemaVersion` (number, required): Payload version for migration.
  - `mode` (enum, required): `scroll|book`.
  - `updatedAt` (ISO datetime string, required): Last successful interaction timestamp.
  - `slotAssignments` (record, required): Mapping from `slotId` to `blockId`.
  - `boundarySizes` (record, required): Mapping from `boundaryId` to `currentSizePx`.
- Validation rules:
  - Exactly one configuration per mode is active.
  - Invalid values fallback to safe defaults (default slot assignment + default size clamps).

## Relationships

- `LayoutBlock` occupies `DockSlot` via `slotAssignments`.
- `SplitBoundary` references two `LayoutBlock` items and contributes size entries to `ModeLayoutConfiguration`.
- `ModeLayoutConfiguration` is keyed by mode and restored when reading mode switches.

## State Transitions

- `idle -> dragging`: pointer down on handle OR touch long-press >= 500ms on handle.
- `dragging -> previewing`: pointer enters a valid dock slot target.
- `previewing -> committed`: pointer up on valid slot, apply assignment and persist for current mode.
- `dragging|previewing -> idle`: pointer up outside valid target, restore prior valid assignment.
- `idle -> resizing`: pointer down on split boundary OR touch long-press >= 500ms on split handle.
- `resizing -> committed`: pointer up, clamp size and persist for current mode.
- `mode-switch`: load and apply target mode `ModeLayoutConfiguration` immediately.
