# Phase 0 Research: Dockable Block Layout

## Decision 1: Layout persistence scope

- Decision: Persist layout globally per reading mode (`scroll`, `book`) and auto-apply on mode switch.
- Rationale: Reading intent differs by mode, so independent defaults avoid repeated manual adjustments and match clarified product behavior.
- Alternatives considered:
  - Single global layout shared by both modes (simpler storage but poorer UX fit).
  - Per-album layout keys (more personalized but higher complexity and migration overhead).

## Decision 2: Docking model

- Decision: Use explicit dock slots (`left`, `right`, `bottom`) with slot capability declared by block metadata.
- Rationale: Deterministic slot layout prevents overlap and keeps extension path reusable for future blocks without block-specific conditions.
- Alternatives considered:
  - Freeform drag placement (flexible but hard to persist and validate on viewport changes).
  - Include `top` in v1 (broader scope without current user demand).

## Decision 3: Resize behavior and bounds

- Decision: Use split-handle resize with clamped min/max bounds and keep last valid size on invalid pointer end.
- Rationale: Clamping guarantees readable main content area and prevents invalid geometry on aggressive dragging.
- Alternatives considered:
  - Persist every intermediate drag size (can capture accidental transient states).
  - Revert to initial size on invalid drag end (safe but frustrating).

## Decision 4: Touch interaction safety

- Decision: Support touch and pointer in v1; touch requires 500ms long-press on the handle before docking/resizing is armed.
- Rationale: Prevents accidental layout operations during scrolling while keeping parity across desktop and touch devices.
- Alternatives considered:
  - Immediate touch drag (high accidental trigger risk).
  - Partial touch support for docking only (inconsistent capability matrix).

## Decision 5: Small viewport fallback

- Decision: Maintain slot ordering and enforce safe fallback proportions when viewport is constrained; disable invalid sizes instead of hiding primary content.
- Rationale: Core reading experience must remain visible in all successful interactions.
- Alternatives considered:
  - Collapse thumbnail panel automatically (can surprise users and break predictability).
  - Allow overflow clipping (risks inaccessible controls).

## Decision 6: Persistence transport and compatibility

- Decision: Reuse existing preference pattern: userscript storage first, platform/local fallback, schema versioned payload with invalid-value sanitization.
- Rationale: Aligns with current app persistence architecture and constitution requirement for invalid-value fallback behavior.
- Alternatives considered:
  - Introduce a new persistence subsystem (unnecessary complexity).
  - Only localStorage fallback path (lower compatibility in userscript runtime).
