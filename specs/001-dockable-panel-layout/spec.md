# Feature Specification: Dockable Block Layout

**Feature Branch**: `001-dockable-panel-layout`  
**Created**: 2026-02-20  
**Status**: Draft  
**Input**: User description: "需要支持不同Block之间的调整相对位置、宽度和高度，类似jetbrains的IDE那样。目前需要缩略图栏(ThumbScrollView)和其右侧的内容主体区域之间调整。比如缩略图栏可以点按住顶部的‘EHUNTER’，然后拖拽调整到页面右侧或底部。缩略图栏和主题展示区域之间悬浮鼠标，可以触发调整缩略图栏的宽度。要求：1. 需要考虑到以后的扩展性和复用性，避免hardcode或者仅针对缩略图栏做过于简单或不可复用的实现 2. 交互设计需要美观简洁易懂"

## Clarifications

### Session 2026-02-20

- Q: Layout persistence scope for different contexts → A: 按模式全局存储（书页模式与滚动模式分别独立存储布局）
- Q: Touch device interaction scope for docking and resizing → A: Mouse + touch docking/resizing, with touch-specific long-press handle behavior.
- Q: Touch long-press activation duration for layout operations → A: 500ms.
- Q: Layout application behavior when switching reading modes → A: Automatically apply the saved layout of the target mode.

## User Scenarios & Testing *(mandatory)*

**Validation Note**: For each completed development cycle, run `npm run dev` and verify changed behavior in browser using `chrome-devtools-mcp` before marking work complete.

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Drag to Reposition Panels (Priority: P1)

As a reader, I can drag a panel by its visible header area and dock it to another side of the workspace so I can choose a layout that matches my reading preference.

**Why this priority**: Repositioning is the core requested behavior and unlocks immediate user value for both left-right and top-bottom reading workflows.

**Independent Test**: Can be fully tested by dragging the thumbnail panel header and verifying it docks to each supported side while the content panel remains usable.

**Acceptance Scenarios**:

1. **Given** the thumbnail panel is docked on the left, **When** the user drags its header to the right docking target and releases, **Then** the thumbnail panel docks on the right and the content panel reflows without overlap.
2. **Given** the thumbnail panel is docked on the left or right, **When** the user drags its header to the bottom docking target and releases, **Then** the thumbnail panel docks at the bottom and the content panel stays visible above it.
3. **Given** a drag is in progress, **When** the pointer is over a valid docking target, **Then** the interface shows a clear visual drop indicator before release.
4. **Given** each reading mode has its own saved layout, **When** the user switches reading modes, **Then** the workspace automatically applies the saved layout for the target mode.

---

### User Story 2 - Resize Between Adjacent Panels (Priority: P2)

As a reader, I can resize the boundary between the thumbnail panel and the main content panel so I can control how much space each area occupies.

**Why this priority**: Resizing is explicitly required and directly affects readability and navigation speed for different screen sizes and user habits.

**Independent Test**: Can be tested by hovering the panel divider, dragging to resize, and verifying both panels update continuously within allowed size limits.

**Acceptance Scenarios**:

1. **Given** two panels share a vertical boundary, **When** the user hovers the boundary, **Then** a resize affordance appears and communicates that dragging is possible.
2. **Given** the resize affordance is active, **When** the user drags the boundary horizontally, **Then** panel widths update in real time and stop at defined minimum and maximum limits.
3. **Given** two panels share a horizontal boundary, **When** the user drags the boundary vertically, **Then** panel heights update in real time and both panels remain visible.

---

### User Story 3 - Reusable Layout Behavior for Future Blocks (Priority: P3)

As a product maintainer, I can apply the same docking and resizing behavior to other blocks beyond thumbnails so future layout features do not require one-off logic.

**Why this priority**: The request emphasizes extensibility and reuse, which reduces future rework and prevents a thumbnail-only solution.

**Independent Test**: Can be tested by registering a second block with the same layout rules and verifying docking and resizing work without custom per-block behavior.

**Acceptance Scenarios**:

1. **Given** a new block is registered in the workspace, **When** it is marked as dockable and resizable, **Then** it can participate in the same docking and resizing interactions as existing blocks.
2. **Given** two different block types are docked, **When** either is moved or resized, **Then** layout behavior remains consistent and no block-specific exceptions are required for normal operations.

---

### Edge Cases

- User drags a panel but releases outside any valid docking target; layout returns to the prior stable position.
- User attempts to resize below minimum visible size; system clamps size and keeps both panels interactable.
- Viewport becomes too small to honor preferred sizes; system preserves panel order and applies safe fallback proportions.
- Fast repeated drag and resize actions occur; interface remains responsive and does not enter an inconsistent state.
- User starts drag or resize while content is loading; interaction feedback remains visible and final layout remains valid.
- On touch devices, brief taps on the handle must not trigger drag; only the defined long-press gesture can start docking or resizing.
- User switches reading mode while dragging or resizing; in-progress interaction is cancelled and target mode layout is immediately applied.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The workspace MUST support docking relationships between at least two blocks, initially covering the thumbnail panel and the main content panel.
- **FR-002**: Users MUST be able to initiate block repositioning by dragging a clearly identifiable block header area.
- **FR-003**: During drag operations, the system MUST display valid docking targets and a visible preview of where the block will be placed.
- **FR-004**: The system MUST allow dropping a dockable block on the left, right, or bottom side of the workspace when those targets are enabled.
- **FR-005**: The system MUST preserve a valid, non-overlapping layout after each completed drop action.
- **FR-006**: Users MUST be able to resize adjacent docked blocks by dragging the shared boundary after a hover-triggered resize affordance appears.
- **FR-007**: The system MUST enforce configurable minimum and maximum size constraints for each resizable block.
- **FR-008**: The system MUST provide a reusable block registration model so new blocks can opt into docking and resizing without introducing hardcoded block-specific interaction rules.
- **FR-009**: The system MUST keep layout interactions visually clear and minimal, including distinct drag, hover, and active-resize states.
- **FR-010**: The system MUST save and restore the last successful layout configuration separately per reading mode, so book mode and scroll mode each retain an independent global layout.
- **FR-011**: The system MUST support both pointer and touch input for docking and resizing, using a touch-specific long-press gesture of 500ms on the block handle to prevent accidental drag operations.
- **FR-012**: When users switch between reading modes, the system MUST immediately apply the saved global layout of the target mode without requiring manual confirmation.

### Assumptions

- Initial release scope covers one active docking relationship: thumbnail panel and main content panel.
- Allowed docking targets for the thumbnail panel are left, right, and bottom; top docking is out of scope for this request.
- Layout restoration is global per reading mode and persists between sessions unless reset by the user.
- Keyboard-only layout manipulation is not required for this feature increment.

### Dependencies

- Thumbnail panel and main content panel both expose a stable, user-visible container in the workspace.
- Each dockable block provides a visible drag handle region in its header area.
- Existing reader views support dynamic layout reflow without blocking primary reading interactions.

### Key Entities *(include if feature involves data)*

- **Layout Block**: A user-visible workspace section that can declare whether it is dockable and/or resizable, plus its allowed docking targets and size constraints.
- **Dock Slot**: A named workspace position where a block can be placed (left, right, bottom), including ordering and adjacency rules.
- **Split Boundary**: The interactive divider shared by adjacent blocks, including orientation and permitted resize range.
- **Layout Configuration**: A persisted representation of current block positions and dimensions keyed by reading mode, used to restore the workspace later.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability validation, at least 90% of users can move the thumbnail panel from left to right or bottom in one attempt without guidance.
- **SC-002**: At least 95% of resize attempts result in the user reaching a desired panel size within 5 seconds.
- **SC-003**: On supported viewport sizes, 100% of completed dock and resize actions maintain a visible, non-overlapping main content area.
- **SC-004**: In internal feature extension testing, a new block can be added to the layout system with no custom interaction behavior and still pass all docking/resizing acceptance scenarios.
