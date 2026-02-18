# Data Model: 书页模式翻页动效开关

## Entity: PageTurnAnimationPreference

- Purpose: 存储书页模式翻页动效的全局用户偏好。
- Fields:
  - `animationMode` (enum, required): `realistic` | `slide` | `none`
  - `scope` (enum, required): `global`（固定值，用于约束生效范围）
  - `updatedAt` (datetime, required): 最近一次设置更新时间
  - `schemaVersion` (integer, required): 偏好结构版本号
- Validation Rules:
  - `animationMode` 非法或缺失时回退 `realistic`
  - `scope` 仅允许 `global`
  - `schemaVersion` 缺失时按初始版本处理并补齐
- State Notes:
  - 默认状态为 `animationMode=realistic`
  - 用户切换后立即覆盖为最新值

## Entity: BookPageTurnAction

- Purpose: 描述书页模式一次翻页动作及其动效应用结果。
- Fields:
  - `source` (enum, required): `click` | `wheel` | `keyboard` | `autoflip`
  - `fromIndex` (integer, required): 当前页索引
  - `toIndex` (integer, required): 目标页索引
  - `direction` (enum, required): `next` | `prev`
  - `animationModeApplied` (enum, required): `realistic` | `slide` | `none`
  - `status` (enum, required): `accepted` | `coalesced` | `ignored_boundary`
- Validation Rules:
  - `toIndex` 必须在 `[0, pageCount-1]`，越界时标记 `ignored_boundary`
  - 连续高频输入时允许将旧意图标记为 `coalesced`
  - `animationModeApplied` 必须等于当前有效偏好

## Entity: ReadingSession

- Purpose: 表示一次进入阅读器后的会话，用于验证设置持续生效与模式一致性。
- Fields:
  - `sessionId` (string, required)
  - `startedAt` (datetime, required)
  - `effectiveAnimationMode` (enum, required): `realistic` | `slide` | `none`
  - `readingMode` (enum, required): `book` | `scroll`
- Validation Rules:
  - 当 `readingMode=scroll` 时，不应用本特性动效逻辑
  - 当会话初始化未读到有效偏好时，`effectiveAnimationMode=realistic`

## Relationships

- `ReadingSession` 使用 1 个 `PageTurnAnimationPreference` 作为有效配置来源。
- 1 个 `ReadingSession` 包含多次 `BookPageTurnAction`。
- 每个 `BookPageTurnAction` 在执行时绑定当下 `effectiveAnimationMode`。

## State Transitions

### Preference Transition

- `realistic` -> `slide`（用户切换）
- `slide` -> `none`（用户切换）
- `none` -> `realistic`（用户切换）
- `*` -> `realistic`（配置无效或缺失时回退）

### Page Turn Transition

- `accepted`：合法翻页请求并完成目标页切换。
- `coalesced`：高频场景下被最新意图替代，不单独落地结果。
- `ignored_boundary`：边界页翻页请求被忽略，保持当前页不变。
