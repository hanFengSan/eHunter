type SupportedLang = 'cn' | 'en' | 'jp'

const versionNotesTemplate: Record<SupportedLang, string> = {
    cn: `
### v3.1.0 说明
* 新增放大镜功能（滚动模式：鼠标左键点击图片打开，书页模式：屏幕中间区域点击图片打开）
* 支持快捷键自定义（入口：更多设置）
* 修复”快捷设置“中的拖拽功能

### v3.0.0 说明
* 支持图片打包下载（触发入口：页面右上角的“更多”按钮）
* 支持iPhone使用，优化移动端使用体验
* 支持”快速预览“（入口：缩略图栏底部的悬浮按钮、页面右上角的“更多”按钮）
* 缩略图栏可拖拽改变位置（拖拽顶部的EHUNTER标识）
* 缩略图栏可改变宽度或高度
* 图片加载失败时，支持自动换源重试

### iPhone / iPad 支持
* 目前在 iOS 15/iPadOS 15 上可运行油猴脚本/userscript，因此 eHunter 也可在 iPhone / iPad 使用
* 使用指南: [链接](https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_cn.md)
`,
    en: `
### v3.1.0 Notes
* Added a magnifier feature (Scroll Mode: left-click an image to open; Book Mode: click an image in the center area of the screen to open)
* Added customizable keyboard shortcuts (entry: More Settings)
* Fixed drag behavior in "Quick Settings"

### v3.0.0 Notes
* Added image bundle download (entry: the "More" button in the top-right corner)
* Added iPhone support with improved mobile usability
* Added "Quick Preview" (entry: floating button at the bottom of the thumbnail bar, and the "More" button in the top-right corner)
* Thumbnail bar position can now be changed by drag-and-drop (drag the EHUNTER header)
* Thumbnail bar width/height is now resizable
* Automatically retries with an alternative source when image loading fails

### iPhone / iPad Support
* Userscripts can run on iOS 15 / iPadOS 15, so eHunter is now available on iPhone and iPad
* Guide: [Link](https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_en.md)
`,
    jp: `
### v3.1.0 リリースノート
* 拡大鏡機能を追加（スクロールモード: 画像を左クリックで起動、ブックモード: 画面中央エリアの画像をクリックで起動）
* ショートカットキーのカスタマイズに対応（入口: 「詳細設定」）
* 「クイック設定」のドラッグ機能を修正

### v3.0.0 リリースノート
* 画像の一括ダウンロードに対応（入口: 右上の「More」ボタン）
* iPhone での利用に対応し、モバイルでの操作性を改善
* 「クイックプレビュー」に対応（入口: サムネイルバー下部のフローティングボタン、または右上の「More」ボタン）
* サムネイルバーの位置をドラッグで変更可能（EHUNTER ヘッダーをドラッグ）
* サムネイルバーの幅・高さを調整可能
* 画像の読み込みに失敗した場合、別ソースで自動再試行

### iPhone / iPad 対応
* iOS 15 / iPadOS 15 では userscript が動作するため、eHunter を iPhone / iPad でも利用できます
* ガイド: [リンク](https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_jp.md)
`,
}

function normalizeLang(inputLang: string): SupportedLang {
    if (inputLang === 'cn' || inputLang === 'jp' || inputLang === 'en') {
        return inputLang
    }
    return 'en'
}

export function getVersionNotesText(inputLang: string): string {
    const lang = normalizeLang(inputLang)
    return versionNotesTemplate[lang]
}
