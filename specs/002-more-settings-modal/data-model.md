# Data Model: 统一更多设置弹窗

## 1) SettingsCategory

- Purpose: 定义弹窗左侧导航与右侧分组的分类模型。
- Fields:
  - `id` (string, unique): `general | scroll | book | quick | other`
  - `labelKey` (string): 多语言展示 key
  - `order` (number): 分类显示顺序（固定）
  - `anchorId` (string): 右侧滚动定位目标
  - `visible` (boolean): 当前会话是否展示
- Validation:
  - `id` 必须唯一且属于固定枚举。
  - `order` 不可重复。

## 2) SettingItem

- Purpose: 描述统一设置中的具体可配置项。
- Fields:
  - `id` (string, unique)
  - `categoryId` (SettingsCategory.id)
  - `labelKey` (string)
  - `descriptionKey` (string, optional)
  - `controlType` (enum): `select | number | toggle | action | readonly`
  - `valueType` (enum): `string | number | boolean | none`
  - `defaultValue` (string|number|boolean|null)
  - `currentValue` (string|number|boolean|null)
  - `modeScope` (enum): `both | scroll-only | book-only`
  - `isUserVisible` (boolean)
  - `isExperimental` (boolean)
- Validation:
  - 仅 `isUserVisible=true` 且非实验项进入统一弹窗。
  - `currentValue` 必须符合 `valueType` 与业务边界（如最小/最大值）。
  - 非法值读取后回退到 `defaultValue`。

## 3) QuickSettingItem

- Purpose: 顶部快捷配置栏候选项与约束。
- Fields:
  - `settingItemId` (SettingItem.id)
  - `isPinned` (boolean)
  - `isSelected` (boolean)
  - `globalOrder` (number)
  - `modeScope` (enum): `both | scroll-only | book-only`
- Validation:
  - 固定项“阅读模式”满足：`isPinned=true`, `isSelected=true`, `globalOrder=0`。
  - 非固定项可拖拽排序，但不得占用固定项顺位。
  - 渲染时按 `globalOrder` 排序后再按 `modeScope` 过滤。

## 4) SettingsPreferenceSnapshot

- Purpose: 用户设置持久化快照（统一设置 + 快捷项偏好）。
- Fields:
  - `schemaVersion` (number)
  - `updatedAt` (ISO datetime string)
  - `settings` (map<string, string|number|boolean>)
  - `quickSelection` (array<string>)
  - `quickGlobalOrder` (array<string>)
- Validation:
  - `quickGlobalOrder` 必须包含固定项且固定项首位。
  - `quickSelection` 必须包含固定项。
  - 缺失字段补默认值；未知字段丢弃。

## 5) ResetOperation

- Purpose: 描述“清空缓存并重置全部设置”操作状态。
- Fields:
  - `type` (enum): `factory-reset`
  - `requiresConfirmation` (boolean, fixed true)
  - `status` (enum): `idle | confirming | running | success | failed`
  - `errorMessage` (string, optional)
  - `confirmedAt` (ISO datetime string, optional)
- State transitions:
  - `idle -> confirming -> running -> success`
  - `idle -> confirming -> idle` (取消)
  - `running -> failed` (失败后可重试回 `confirming`)

## Relationships

- 一个 `SettingsCategory` 包含多个 `SettingItem`。
- 一个 `SettingItem` 可以映射为零个或一个 `QuickSettingItem`。
- `SettingsPreferenceSnapshot` 持久化 `SettingItem` 当前值与 `QuickSettingItem` 的可见性和全局顺序。
- `ResetOperation` 执行成功后会重建 `SettingsPreferenceSnapshot` 为默认值，并清空缓存域。
