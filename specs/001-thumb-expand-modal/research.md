# Phase 0 Research - Thumb Expand Modal

## Decision 1: 浮动入口锚定策略

- Decision: “展开”入口锚定在 `ThumbScrollView` 可视区域边缘，而非列表内容末端；纵向停靠时位于可视区域底部，横向停靠时位于可视区域右侧。
- Rationale: 与用户视觉焦点和操作路径一致，避免滚动到列表末尾才能触发；在停靠方向切换时仍保持可预测位置。
- Alternatives considered:
  - 锚定列表末端（拒绝：在长列表下发现成本高）
  - 锚定主阅读区角落（拒绝：与缩略图上下文割裂）

## Decision 2: 高密度网格与响应式规则

- Decision: 弹层网格采用两档布局：宽屏最多 5 列，窄屏 3 列；5 列模式下保证首屏至少可见 4 行。
- Rationale: 兼顾桌面端浏览密度与窄屏可读性，满足“快速扫页”目标并符合规格中的信息密度要求。
- Alternatives considered:
  - 仅自动填充列数（拒绝：不同设备间密度不可预测）
  - 固定 4 列（拒绝：大屏利用率不足）

## Decision 3: 分页分段策略（每 100 页）

- Decision: 按固定 100 页切分缩略图分段，通过现有 `Pagination` 组件切换分段，仅渲染当前分段的数据。
- Rationale: 限制单次渲染规模，保证交互稳定；复用现有分页交互降低认知成本。
- Alternatives considered:
  - 无限滚动（拒绝：在大页数下定位困难）
  - 50 页分段（拒绝：分页操作次数过多）
  - 200 页分段（拒绝：单屏密度过大，渲染压力上升）

## Decision 4: 点击缩略图后的闭环行为

- Decision: 单击缩略图后立即执行“关闭弹层 + 跳转对应页”；若页码越界则进行边界收敛（clamp）后再跳转。
- Rationale: 操作链路最短，符合用户“选中即跳转”预期；边界收敛降低异步更新时的异常风险。
- Alternatives considered:
  - 二次确认后跳转（拒绝：额外点击降低效率）
  - 跳转后保留弹层（拒绝：打断阅读流）

## Decision 5: 风格一致性基线

- Decision: 弹层视觉风格以现有“设置类弹窗”为基线（遮罩、圆角、层级、间距、交互态一致），不引入新视觉体系。
- Rationale: 已在澄清中确认该决策，可降低风格割裂和验收争议。
- Alternatives considered:
  - 复用缩略图列表原样式（拒绝：与澄清结果不一致）
  - 采用全新视觉语言（拒绝：超出当前需求范围）

## Decision 6: 验收与质量门禁

- Decision: 本功能验收以规格中的场景和成功标准为准，并执行 `npm run type-check`、`npm run dev`、`chrome-devtools-mcp` 手动链路验证。
- Rationale: 符合仓库 Constitution Principle III（Validation Before Completion）。
- Alternatives considered:
  - 仅静态检查（拒绝：不足以覆盖 userscript DOM 运行时行为）
