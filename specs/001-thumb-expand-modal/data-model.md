# Data Model: Thumb Expand Modal

## 1) ExpandEntry

- Description: 悬浮“展开”入口的视图状态模型。
- Fields:
  - `placement` (enum, required): `bottom|right`，由 `ThumbScrollView` 停靠方向推导。
  - `visible` (boolean, required): 是否在当前可视区域展示。
  - `opacityState` (enum, required): `idle|hover|active`，用于半透明交互态。
  - `clickable` (boolean, required): 是否允许触发弹层。
- Validation rules:
  - `placement` 必须与当前停靠方向一致（纵向停靠 => `bottom`，横向停靠 => `right`）。
  - `visible=true` 时 `clickable` 必须为 `true`。

## 2) ThumbnailModalState

- Description: 全部缩略图弹层的会话状态。
- Fields:
  - `isOpen` (boolean, required): 弹层开关状态。
  - `layoutMode` (enum, required): `five-column|three-column`。
  - `activeSegmentIndex` (number, required): 当前分页分段索引（从 0 开始）。
  - `segmentSize` (number, required): 固定值 `100`。
  - `highlightedPage` (number, required): 当前阅读页（1-based，用于高亮）。
  - `styleProfile` (enum, required): `settings-dialog`，表示风格基线。
- Validation rules:
  - `segmentSize` 必须恒等于 `100`。
  - `activeSegmentIndex` 必须落在有效分段范围。
  - `highlightedPage` 必须在 `[1, totalPages]` 范围。

## 3) ThumbnailItem

- Description: 弹层网格中的单个缩略图项。
- Fields:
  - `pageNumber` (number, required): 对应阅读页码（1-based，唯一）。
  - `thumbUrl` (string, optional): 缩略图资源地址。
  - `renderState` (enum, required): `ready|loading|error`。
  - `isCurrentPage` (boolean, required): 是否为当前阅读页。
  - `jumpEnabled` (boolean, required): 是否允许点击跳转。
- Validation rules:
  - `pageNumber` 在同一图集中必须唯一。
  - `renderState=error` 时 `jumpEnabled` 仍必须为 `true`。

## 4) ThumbnailSegment

- Description: 按每 100 页切分的缩略图分段。
- Fields:
  - `segmentIndex` (number, required): 分段索引（0-based）。
  - `startPage` (number, required): 分段起始页（1-based）。
  - `endPage` (number, required): 分段结束页（包含）。
  - `items` (ThumbnailItem[], required): 当前分段缩略图集合。
- Validation rules:
  - `startPage <= endPage`。
  - `items.length <= 100`。
  - `items.pageNumber` 必须在 `[startPage, endPage]` 范围。

## Relationships

- `ExpandEntry` 触发 `ThumbnailModalState.isOpen=true`。
- `ThumbnailModalState.activeSegmentIndex` 指向一个 `ThumbnailSegment`。
- `ThumbnailSegment.items` 由多个 `ThumbnailItem` 组成。
- `ThumbnailItem.pageNumber` 与阅读器当前页状态双向关联（高亮与跳转目标）。

## State Transitions

- `entry-idle -> modal-open`: 点击悬浮入口，弹层打开并定位到当前阅读页所在分段。
- `modal-open -> segment-switched`: 使用分页器切换分段索引，网格数据切换为目标分段。
- `modal-open -> page-jump-committed`: 点击某缩略图项，触发跳转并关闭弹层。
- `modal-open -> modal-closed`: 点击关闭动作或遮罩，返回阅读状态不变。
- `thumbnail-loading -> thumbnail-ready|thumbnail-error`: 缩略图资源完成加载或失败；失败时仍保留跳转能力。
