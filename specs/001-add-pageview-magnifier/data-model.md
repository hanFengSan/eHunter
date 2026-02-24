# Data Model - PageView Magnifier Menu

## 1. PageViewInteractionContext

- Purpose: 描述当前菜单/放大镜交互所绑定的 PageView 上下文。
- Fields:
  - `pageViewId` (string): 当前交互目标 PageView 的唯一标识。
  - `readingMode` (enum): `scroll | book`。
  - `deviceType` (enum): `desktop | mobile`。
  - `platformSupportsSourceRefresh` (boolean): 平台是否支持换源刷新。
  - `isInBookCenterWhitespace` (boolean): 书页模式点击是否命中现有中间留白区。
  - `menuOpen` (boolean): 当前 PageView 菜单是否打开。

- Validation rules:
  - `isInBookCenterWhitespace` 仅在 `readingMode=book` 时参与菜单打开判定。
  - `deviceType=mobile` 时，放大镜相关菜单项均不可用。

## 2. MagnifierState

- Purpose: 描述当前 PageView 的放大镜显示状态。
- Fields:
  - `enabled` (boolean): 放大镜开关状态。
  - `zoomLevel` (enum): `2x | 3x | 4x | 5x`。
  - `lensVisible` (boolean): 放大镜框当前是否显示。
  - `focusIndicatorVisible` (boolean): 80x80 焦点框当前是否显示。
  - `lensSide` (enum): `right | left`（相对鼠标展示侧）。
  - `isClamped` (boolean): 是否触发边界钳制。

- Validation rules:
  - 初始默认值：`enabled=false`，`zoomLevel=3x`。
  - `enabled=false` 时，`lensVisible=false` 且 `focusIndicatorVisible=false`。
  - `zoomLevel` 只能在四档枚举值内变更。

- State transitions:
  - `disabled -> enabled`: 通过菜单“打开放大镜”。
  - `enabled -> disabled`: 通过菜单“关闭放大镜”。
  - `enabled` 下可执行 `zoomLevel` 上下档变更。
  - 指针离开当前 PageView 时，保持 `enabled` 不变但临时切换 `lensVisible=false` 与 `focusIndicatorVisible=false`。

## 3. MagnifierSessionPreference

- Purpose: 会话级放大镜偏好，用于跨 PageView 继承。
- Fields:
  - `sessionId` (string): 当前阅读会话标识。
  - `enabled` (boolean): 会话内继承的放大镜开关状态。
  - `zoomLevel` (enum): 会话内继承倍率。

- Validation rules:
  - 仅在同一阅读会话内有效，不持久化。
  - 切换到新 PageView 时，优先应用该偏好初始化 `MagnifierState`。

## 4. PageMenuActionItem

- Purpose: 表示菜单中的单个动作及其可见性/可用性。
- Fields:
  - `actionKey` (enum): `toggleMagnifier | loadOriginal | toggleOddEven | zoomIn | zoomOut`。
  - `visible` (boolean): 是否展示。
  - `enabled` (boolean): 是否可执行。
  - `disabledReason` (string | null): 禁用原因文案（例如加载原图不支持时）。

- Validation rules:
  - `toggleMagnifier/zoomIn/zoomOut` 仅桌面端可见。
  - `zoomIn/zoomOut` 仅在 `MagnifierState.enabled=true` 时可见。
  - `toggleOddEven` 仅书页模式可见。
  - `loadOriginal` 始终可见；当 `platformSupportsSourceRefresh=false` 时 `enabled=false` 且必须提供 `disabledReason`。

## 5. PointerFocusIndicator

- Purpose: 描述焦点参考框可视状态与几何信息。
- Fields:
  - `size` (fixed): `80x80`。
  - `opacity` (number): 约 `0.30` 白色透明层。
  - `positionX` (number): 在 PageView 内的横向位置。
  - `positionY` (number): 在 PageView 内的纵向位置。

- Validation rules:
  - 仅桌面端且放大镜开启时可见。
  - 位置必须保持在 PageView 可视范围内。

## Relationships

- `PageViewInteractionContext` 1:1 `MagnifierState`（按当前激活 PageView）。
- `MagnifierSessionPreference` 1:N `MagnifierState`（同一会话跨多个 PageView 继承）。
- `PageViewInteractionContext` 1:N `PageMenuActionItem`（每次菜单渲染动作集合）。
