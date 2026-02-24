# Tasks: PageView Magnifier Menu

**Input**: Design documents from `/specs/001-add-pageview-magnifier/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/pageview-magnifier.openapi.yaml`, `quickstart.md`

**Tests**: 不新增自动化测试任务；本特性按规格要求执行 `npm run type-check` + `npm run dev` + `chrome-devtools-mcp` 手动验收。  
**Organization**: Tasks are grouped by user story for independent implementation and verification.

## Format: `[ID] [P?] [Story] Description`

- [P] = 可并行（不同文件且无未完成依赖）
- [Story] = 用户故事标签（`[US1]`, `[US2]`, `[US3]`）
- 每个任务都包含明确文件路径

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 准备本特性的开发与验收基线。

- [X] T001 对齐特性契约与验收基线并更新 `specs/001-add-pageview-magnifier/quickstart.md`
- [X] T002 记录页面菜单与放大镜实现入口说明到 `specs/001-add-pageview-magnifier/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 提供所有用户故事共享的基础交互与状态框架。  
**⚠️ CRITICAL**: 完成前不得开始 US1/US2/US3 实装。

- [X] T003 在 `core/components/PageView.vue` 建立 PageView 菜单触发统一入口（scroll click / mobile long-press 500ms / book center click）
- [X] T004 [P] 在 `core/components/PageView.vue` 建立 `PageViewInteractionContext` 与 `PageMenuActionItem` 计算骨架
- [X] T005 [P] 在 `core/components/PageView.vue` 建立 `MagnifierState` 与 `MagnifierSessionPreference` 会话继承骨架（默认关闭 + 3x）
- [X] T006 在 `core/components/PageView.vue` 接入并统一 `MoreMenuPopover` 打开/关闭生命周期
- [X] T007 在 `core/components/PageView.vue` 增加平台能力判定桥接（用于“加载原图”可用态）

**Checkpoint**: 菜单触发、动作集合、放大镜状态、会话继承与平台能力判定基础均已可用。

---

## Phase 3: User Story 1 - 快速打开页面菜单 (Priority: P1) 🎯 MVP

**Goal**: 用户在滚动/书页模式下按设备习惯稳定打开 PageView 菜单，且不破坏原有翻页行为。  
**Independent Test**: 滚动桌面单击可开菜单；滚动移动端仅长按 500ms 触发；书页模式仅现有中间留白区命中时开菜单，非该区域维持翻页。

### Implementation for User Story 1

- [X] T008 [US1] 在 `core/components/PageView.vue` 实现滚动模式桌面端图片单击打开菜单
- [X] T009 [US1] 在 `core/components/PageView.vue` 实现移动端长按 500ms 打开菜单与取消条件（位移>10px/滚动/抬起/取消/多指）
- [X] T010 [P] [US1] 在 `core/components/BookPageView.vue` 复用现有中间留白区命中规则并仅在命中时触发 PageView 菜单
- [X] T011 [US1] 在 `core/components/PageView.vue` 处理菜单开关时的事件冲突（阻止误触发翻页与重复触发）
- [X] T012 [US1] 在 `specs/001-add-pageview-magnifier/quickstart.md` 补充 US1 独立验收步骤与预期结果

**Checkpoint**: US1 可独立演示并通过手势/区域触发验收。

---

## Phase 4: User Story 2 - 使用放大镜查看细节 (Priority: P2)

**Goal**: 桌面端用户可在当前 PageView 内开启放大镜、跟随鼠标查看细节并切换倍率。  
**Independent Test**: 桌面端菜单可开关放大镜；显示 80x80 焦点框；倍率仅 2x/3x/4x/5x；靠边自动翻侧且不遮挡鼠标；跨页继承开关和倍率。

### Implementation for User Story 2

- [X] T013 [US2] 在 `core/components/PageView.vue` 实现放大镜开关动作与菜单文案联动（打开/关闭放大镜）
- [X] T014 [US2] 在 `core/components/PageView.vue` 实现放大镜鼠标跟随渲染与 PageView 内定位
- [X] T015 [US2] 在 `core/components/PageView.vue` 实现放大镜边界翻侧与容器内钳制逻辑（默认右侧，越界换侧）
- [X] T016 [P] [US2] 在 `core/components/PageView.vue` 实现 80x80 半透明白色焦点框显示/隐藏与位置同步
- [X] T017 [US2] 在 `core/components/PageView.vue` 实现倍率调整动作（2x/3x/4x/5x）与边界档位保护
- [X] T018 [US2] 在 `core/components/PageView.vue` 实现会话内跨 PageView 继承放大镜开关和倍率（仅内存态）
- [X] T019 [P] [US2] 在 `core/components/PageView.vue` 与 `core/style/_variables.scss` 完成放大镜主题绿色边框+阴影样式与焦点框透明度样式
- [X] T020 [US2] 在 `specs/001-add-pageview-magnifier/quickstart.md` 补充 US2 独立验收步骤与边界场景

**Checkpoint**: US2 可独立演示并完成放大镜核心交互验收。

---

## Phase 5: User Story 3 - 按上下文显示菜单操作 (Priority: P3)

**Goal**: 菜单仅展示当前场景可用动作，且“加载原图”在不支持时保留禁用态与原因。  
**Independent Test**: 书页模式显示奇偶切换；滚动模式隐藏奇偶切换；移动端隐藏放大镜相关项；加载原图始终显示并按平台能力切换可用/禁用。

### Implementation for User Story 3

- [X] T021 [US3] 在 `core/components/PageView.vue` 实现菜单动作可见性矩阵（模式/设备/放大镜状态）
- [X] T022 [US3] 在 `core/components/PageView.vue` 实现“加载原图”始终显示并按平台能力启用或禁用
- [X] T023 [P] [US3] 在 `core/components/PageView.vue` 实现“加载原图”禁用原因文案展示（禁用态说明）
- [X] T024 [US3] 在 `core/components/PageView.vue` 接入“加载原图”动作到当前 PageView 原图源加载流程
- [X] T025 [P] [US3] 在 `core/components/BookPageView.vue` 接入书页模式“奇偶切换”菜单动作并保持滚动模式隐藏
- [X] T026 [US3] 在 `core/store/app.ts` 对接/补齐奇偶切换与原图加载所需动作调用边界
- [X] T027 [US3] 在 `specs/001-add-pageview-magnifier/quickstart.md` 补充 US3 独立验收步骤（显隐、禁用态、动作可执行）

**Checkpoint**: US3 可独立演示并通过上下文动作显隐验收。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事收尾、回归与交付质量确认。

- [X] T028 在 `core/components/PageView.vue` 清理交互分支与重复条件，统一术语（menu/magnifier/load-original/odd-even）
- [X] T029 [P] 在 `specs/001-add-pageview-magnifier/contracts/pageview-magnifier.openapi.yaml` 对齐最终动作行为与字段说明
- [X] T030 在 `specs/001-add-pageview-magnifier/quickstart.md` 完成最终回归清单（桌面 1200x900 + 移动 390x844）
- [ ] T031 运行 `npm run type-check` 并处理问题（仓库根目录）
- [ ] T032 启动 `npm run dev` 并用 `chrome-devtools-mcp` 完成端到端验收与截图记录（依据 `specs/001-add-pageview-magnifier/quickstart.md`）

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): 无依赖，可立即开始。
- Phase 2 (Foundational): 依赖 Phase 1，且阻塞全部用户故事。
- Phase 3 (US1): 依赖 Phase 2；建议先作为 MVP 完成。
- Phase 4 (US2): 依赖 Phase 2；可在 US1 后增量交付。
- Phase 5 (US3): 依赖 Phase 2；与 US2 可并行，但建议在 US1 稳定后推进。
- Phase 6 (Polish): 依赖 US1/US2/US3 目标范围完成。

### User Story Dependency Graph

- `US1 (P1) -> MVP`
- `US2 (P2) -> depends on Foundational only; can start after US1 baseline`
- `US3 (P3) -> depends on Foundational only; can run parallel with US2`

### Within Each User Story

- 先完成交互入口/状态，再补动作细节与边界处理。
- 先完成实现，再执行该故事独立验收更新到 `quickstart.md`。

## Parallel Opportunities

- Foundational: `T004` 与 `T005` 可并行。
- US1: `T010` 可与 `T008/T009` 并行。
- US2: `T016` 与 `T019` 可并行于 `T014/T015`。
- US3: `T023` 与 `T025` 可并行于 `T021/T022`。
- Polish: `T029` 可并行于 `T028`。

## Parallel Example: User Story 2

```bash
# Parallel track A (behavior)
Task: "T014 [US2] Implement pointer-follow lens rendering in core/components/PageView.vue"
Task: "T015 [US2] Implement boundary flip/clamp logic in core/components/PageView.vue"

# Parallel track B (visual + indicator)
Task: "T016 [US2] Implement 80x80 focus indicator in core/components/PageView.vue"
Task: "T019 [US2] Implement magnifier styles in core/components/PageView.vue and core/style/_variables.scss"
```

## Parallel Example: User Story 3

```bash
Task: "T023 [US3] Implement disabled reason text for Load Original in core/components/PageView.vue"
Task: "T025 [US3] Wire odd-even action for book mode in core/components/BookPageView.vue"
```

## Implementation Strategy

### MVP First (US1 Only)

1. 完成 Phase 1 + Phase 2。
2. 完成 Phase 3 (US1)。
3. 运行 `T031` + `T032` 验证 US1 独立可交付。

### Incremental Delivery

1. 交付 US1（菜单触发稳定）。
2. 交付 US2（桌面端放大镜完整体验）。
3. 交付 US3（上下文动作显隐与禁用态说明）。
4. 最后执行 Phase 6 跨故事回归与文档对齐。
