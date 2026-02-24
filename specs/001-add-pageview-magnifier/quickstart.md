# Quickstart - PageView Magnifier Menu

## 1) Prerequisites

- 在仓库根目录执行。
- 使用当前分支：`001-add-pageview-magnifier`。
- 确保依赖已安装。

## 2) Static Validation

```bash
npm run type-check
```

期望结果：无 TypeScript/Vue 类型错误。

## 3) Run Development Server (background)

```bash
npm run dev > /tmp/vite-dev.log 2>&1 &
```

可选检查：

```bash
tail -n 50 /tmp/vite-dev.log
```

期望结果：Vite 服务可访问，且无编译报错。

## 4) Runtime Verification with chrome-devtools-mcp

### Desktop viewport (1200x900)

1. 打开测试页面并先检查是否存在 `vite-error-overlay`。
2. 验证滚动模式桌面端：单击图片可打开页面菜单。
3. 验证书页模式：仅点击现有“中间留白区”命中 PageView 时打开菜单，非该区域保持原翻页行为。
4. 验证放大镜：
   - 菜单可切换开/关。
   - 开启后出现 80x80 半透明白色焦点框。
   - 放大镜默认 3x，可在 2x/3x/4x/5x 间切换。
   - 鼠标靠近 PageView 右边界时放大镜自动翻侧并保持不遮挡鼠标。
5. 验证“加载原图”项：
   - 支持换源时可点击触发。
   - 不支持时仍显示但为禁用状态，并有原因说明。
6. 验证书页模式“奇偶切换”仅在书页模式显示。
7. 截图保存关键状态（菜单展开、放大镜靠边翻侧、禁用态加载原图）。

### Mobile viewport (390x844)

1. 切换到 iPhone 12 Pro 视口。
2. 验证滚动模式：长按 500ms 才打开菜单；短按/滑动不触发。
3. 验证移动端菜单不显示放大镜开关与倍率项。
4. 验证“加载原图”在不支持平台时禁用态说明可见。
5. 验证书页模式中央留白区菜单触发与翻页行为兼容。
6. 截图保存菜单与关键交互结果。

## 5) Completion Checklist

- `npm run type-check` 通过。
- `npm run dev` 正常启动且无 overlay 错误。
- 桌面端与移动端关键验收场景通过。
- 关键视觉状态已截图确认。

## 6) Story-by-Story Independent Validation

### US1 - 快速打开页面菜单

1. 滚动模式桌面端单击图片：菜单打开。
2. 滚动模式移动端短按与滑动：菜单不打开。
3. 滚动模式移动端长按 500ms：菜单打开。
4. 书页模式点击中间留白区命中 PageView：菜单打开。
5. 书页模式点击非中间留白区：保持原翻页行为。

### US2 - 放大镜查看细节

1. 桌面端菜单点击“打开放大镜”：显示放大镜与 80x80 焦点框。
2. 鼠标移动到右边界：放大镜自动切换到左侧，且不遮挡鼠标焦点。
3. 执行倍率增减：倍率仅在 2x/3x/4x/5x 间切换，边界档位不可越界。
4. 切换到下一页再返回：放大镜开关与倍率保持会话继承。

### US3 - 上下文菜单项显隐

1. 书页模式显示“奇偶切换”，滚动模式隐藏该项。
2. 移动端菜单不显示放大镜开关与倍率项。
3. “加载原图”始终显示：支持换源时可点击，不支持时禁用并显示原因。
4. 在支持换源场景点击“加载原图”：当前 PageView 触发原图加载。
