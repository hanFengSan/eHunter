# Tasks: Dockable Block Layout

**Input**: Design documents from `/specs/001-dockable-panel-layout/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/layout-contract.openapi.yaml`, `quickstart.md`

**Tests**: No mandatory automated test tasks were explicitly requested in the spec; this plan includes required manual runtime verification tasks.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- `[P]`: Can run in parallel (different files, no dependency on incomplete tasks)
- `[Story]`: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create feature scaffolding and shared definitions used by all stories.

- [X] T001 Create layout module directory and export entry in `core/components/layout/index.ts`
- [X] T002 Create shared dock constants and defaults in `core/model/layout.ts`
- [X] T003 [P] Add dock/resize design tokens in `core/style/_variables.scss`
- [X] T004 [P] Add i18n labels for dock targets and resize hints in `core/store/i18n.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build reusable interaction and persistence foundation that blocks all user stories.

**CRITICAL**: Complete this phase before starting user story phases.

- [X] T005 Implement mode-scoped layout preference schema and sanitizer in `core/store/layoutPreference.ts`
- [X] T006 [P] Implement pointer/touch gesture utilities with 500ms long-press arming in `core/utils/layoutGesture.ts`
- [X] T007 Create `DockWorkspace` base structure with slot registration and projection in `core/components/layout/DockWorkspace.vue`
- [X] T008 [P] Create `DockHandle` component with idle/armed/dragging visual states in `core/components/layout/DockHandle.vue`
- [X] T009 [P] Create `SplitHandle` component with boundary interaction events in `core/components/layout/SplitHandle.vue`
- [X] T010 Integrate base layout state and defaults into reader store in `core/store/app.ts`

**Checkpoint**: Foundation ready for independent story implementation.

---

## Phase 3: User Story 1 - Drag to Reposition Panels (Priority: P1) 🎯 MVP

**Goal**: Let readers drag the thumbnail block header and dock it to left/right/bottom with clear drop feedback and safe revert on invalid drop.

**Independent Test**: Drag `EHUNTER` header to right and bottom targets, verify successful docking, and verify invalid drop restores prior valid layout.

### Implementation for User Story 1

- [X] T011 [US1] Refactor reader container to mount `DockWorkspace` with thumb/main blocks in `core/components/ReaderView.vue`
- [X] T012 [P] [US1] Expose thumbnail header drag handle integration in `core/components/ThumbScrollView.vue`
- [X] T013 [US1] Implement dock target preview, valid drop commit, and invalid drop rollback in `core/components/layout/DockWorkspace.vue`
- [X] T014 [US1] Implement dock slot assignment actions and mutations in `core/store/app.ts`
- [X] T015 [P] [US1] Add drag-preview and dock-target highlight styles in `core/components/layout/DockWorkspace.vue`
- [X] T016 [US1] Auto-apply target mode saved layout on reading-mode switch in `core/store/app.ts`

**Checkpoint**: User Story 1 works independently and delivers MVP value.

---

## Phase 4: User Story 2 - Resize Between Adjacent Panels (Priority: P2)

**Goal**: Let readers resize thumb/main boundary with hover affordance on pointer devices and long-press activation on touch.

**Independent Test**: Hover boundary to see affordance, drag to resize with live updates, and verify min/max clamps keep both panels visible.

### Implementation for User Story 2

- [X] T017 [US2] Implement boundary hover affordance and resize cursor behavior in `core/components/layout/SplitHandle.vue`
- [X] T018 [US2] Implement live boundary resize calculations for vertical/horizontal layouts in `core/components/layout/DockWorkspace.vue`
- [X] T019 [US2] Enforce configurable min/max bounds and constrained viewport fallback in `core/store/app.ts`
- [X] T020 [P] [US2] Wire touch long-press resize arming and tap-ignore safety in `core/utils/layoutGesture.ts`
- [X] T021 [US2] Bind resized dimensions to thumbnail/main rendering in `core/components/ReaderView.vue`

**Checkpoint**: User Story 2 works independently with stable and constrained resize behavior.

---

## Phase 5: User Story 3 - Reusable Layout Behavior for Future Blocks (Priority: P3)

**Goal**: Ensure docking/resizing behavior is block-registry driven and persisted globally per mode for future block reuse.

**Independent Test**: Register an additional block through metadata, verify it participates in dock/resize flow, and verify per-mode restore after refresh.

### Implementation for User Story 3

- [X] T022 [US3] Implement reusable block registration model (dockability/resizability/slot capabilities) in `core/model/layout.ts`
- [X] T023 [US3] Implement per-mode layout save/load/reset helpers with invalid-value fallback in `core/store/layoutPreference.ts`
- [X] T024 [US3] Connect persistence lifecycle (dock commit, resize commit, app init, mode switch) in `core/store/app.ts`
- [X] T025 [P] [US3] Align reader layout preference contract with implemented payload fields in `specs/001-dockable-panel-layout/contracts/layout-contract.openapi.yaml`
- [X] T026 [US3] Document block onboarding steps for future extensions in `specs/001-dockable-panel-layout/quickstart.md`

**Checkpoint**: User Story 3 proves extensibility and mode-scoped persistence.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete final validation and cross-story quality hardening.

- [X] T027 [P] Review and tighten edge-case handling notes in `specs/001-dockable-panel-layout/spec.md`
- [X] T028 Run static validation (`npm run type-check`) and record results in `specs/001-dockable-panel-layout/plan.md`
- [X] T029 Run runtime verification (`npm run dev` + `chrome-devtools-mcp`) and record outcomes in `specs/001-dockable-panel-layout/plan.md`
- [X] T030 [P] Update feature validation checklist with final manual pass criteria in `specs/001-dockable-panel-layout/checklists/requirements.md`
- [X] T031 Tighten bottom-docked thumbnail spacing density in `core/components/ThumbScrollView.vue`
- [X] T032 Fix resize-handle highlight artifact after drag in `core/components/layout/SplitHandle.vue`
- [X] T033 Remove side-docked thumbnail strip trailing gap in `core/components/ThumbScrollView.vue`
- [X] T034 Refactor thumbnail sizing/indicator logic for maintainability in `core/components/ThumbScrollView.vue`
- [X] T035 Remove dead thumbnail styles/events and add typed emits in `core/components/ThumbScrollView.vue`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies
- Foundational (Phase 2): depends on Phase 1 and blocks all story phases
- User Story phases: start after Phase 2
  - US1 (Phase 3): no story dependency
  - US2 (Phase 4): no story dependency
  - US3 (Phase 5): depends on US1 and US2 integration points
- Polish (Phase 6): depends on completed target stories

### User Story Dependency Graph

- `US1 -> US3`
- `US2 -> US3`
- `US1` and `US2` can be built in parallel after foundational work

---

## Parallel Execution Examples

### User Story 1

```bash
Task T012 in core/components/ThumbScrollView.vue
Task T015 in core/components/layout/DockWorkspace.vue
```

### User Story 2

```bash
Task T020 in core/utils/layoutGesture.ts
Task T017 in core/components/layout/SplitHandle.vue
```

### User Story 3

```bash
Task T025 in specs/001-dockable-panel-layout/contracts/layout-contract.openapi.yaml
Task T026 in specs/001-dockable-panel-layout/quickstart.md
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) only.
3. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Foundation (Phases 1-2)
2. US1 (docking)
3. US2 (resizing)
4. US3 (reusable registration + persistence)
5. Polish and final runtime verification

### Parallel Team Strategy

1. Pair on Phase 2 to stabilize foundational components.
2. Split US1 and US2 in parallel after foundation checkpoint.
3. Merge into US3 for persistence and extension path.

---

## Notes

- `[P]` tasks are isolated by file path and can be run concurrently.
- Story phases preserve independent validation criteria from `spec.md`.
- Manual runtime verification is mandatory before considering implementation complete.
