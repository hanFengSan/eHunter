type SupportedLang = 'cn' | 'en' | 'jp'
import pkgJson from '../../package.json'

const welcomeInstructionTemplate: Record<SupportedLang, string> = {
    cn: `
1.Change language/切换语言/言語を変更
![image-language](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/language.jpg)

1.显示/隐藏顶栏和关闭eHunter
![image-topbar_close](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/topbar_close.jpg)

2.在页面右上角点击打开eHunter
![image-open_ehunter](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/open_ehunter.jpg)

3.\`滚动\`模式下, 支持\`A\`. \`D\`, \`Left(左)\`和\`Right(右)\`键翻页.

4.\`书页\`模式下, 支持\`A\`. \`D\`, \`Left(左)\`, \`Right(右)\`和\`Space(空格)\`键翻页. 你也可以用鼠标滚轮翻页.

5.\`分卷页数\`对性能要求较高,请不要设置过高,可能会导致卡顿.

6.有更多想要的功能, 可以反馈给我, 如果该功能可以有的话, 我有空的时候会支持的.

### iPhone和iPad使用指引
说明链接：https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_en.md

### eHunter-local
eHunter-local是eHunter的本地版本, 支持Windows和MacOS. [项目主页](https://github.com/hanFengSan/eHunter_local)

[Github下载](https://github.com/hanFengSan/eHunter_local/releases)

### 反馈和建议
* 可在[Github]({{HOME_PAGE}})上开issue给我.
* 可发邮件到我邮箱: c360785655@gmail.com

### 关于
* 版本: {{VERSION}}
* 作者: Alex Chen (hanFeng)
* 项目开源地址: [Github]({{HOME_PAGE}})

如果你喜欢此插件的话,希望能在应用商店上给个好评 8-)
`,
    en: `
1.Change language/切换语言/言語を変更
![image-language](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/language.jpg)

1.Show/hide top bar and close the eHunter
![image-topbar_close](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/topbar_close.jpg)

2.Click the button at the upper right corner of this page to open the eHunter
![image-open_ehunter](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/open_ehunter.jpg)

3.In \`Scroll\` mode, you can turn pages with \`A\`, \`D\`, \`Left\`, and \`Right\`.

4.In \`Book\` mode, you can turn pages with \`A\`, \`D\`, \`Left\`, \`Right\`, and \`Space\`. You can also use the mouse wheel.

5.\`Volume size\` has relatively high performance requirements. Avoid setting it too high, or the reader may lag.

6.If there are more features you would like, feel free to send feedback. If they are feasible, I will add them when time allows.

### iPhone and iPad Guide
Guide link: https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_en.md

### eHunter-local
The eHunter-local is local version of eHunter, supporting Windows and MacOS. [Home Page](https://github.com/hanFengSan/eHunter_local)

[Github releases](https://github.com/hanFengSan/eHunter_local/releases)

### Feedback & Suggestions
* You can open an issue on [Github]({{HOME_PAGE}}).
* You can also email me at: c360785655@gmail.com

### About
* Version: {{VERSION}}
* Author: Alex Chen (hanFeng)
* Home page of this project: [Github]({{HOME_PAGE}})

If you enjoy this extension, I would really appreciate a five-star rating in the store. 8-)
`,
    jp: `
1.Change language/切换语言/言語を変更
![image-language](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/language.jpg)

1.トップバーを表示/非表示にしてeHunterを閉じる
![image-topbar_close](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/topbar_close.jpg)

2.このページの右上隅にあるボタンをクリックしてeHunterを開きます
![image-open_ehunter](https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/open_ehunter.jpg)

3.\`スクロール\`モードでは、\`A\`、\`D\`、\`Left\`、\`Right\`キーでページをめくれます。

4.\`ブック\`モードでは、\`A\`、\`D\`、\`Left\`、\`Right\`、\`Space\`キーでページをめくれます。マウスホイールでも操作できます。

5.\`分巻ページ数\`はパフォーマンス負荷が高いため、上げすぎると動作が重くなる場合があります。

6.追加してほしい機能があれば、ぜひフィードバックしてください。実現可能であれば、時間のあるときに対応します。

### iPhone と iPad の利用ガイド
案内リンク: https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_jp.md

### eHunter-local
eHunter-localはeHunterのローカル版で、WindowsとMacOSをサポートしています。[Home Page](https://github.com/hanFengSan/eHunter_local)

[Github releases](https://github.com/hanFengSan/eHunter_local/releases)

### フィードバックと提案
* [Github]({{HOME_PAGE}}) で issue を作成できます。
* メール: c360785655@gmail.com

### について
* バージョン: {{VERSION}}
* 著者: Alex Chen (hanFeng)
* このプロジェクトのホームページ: [Github]({{HOME_PAGE}})

この拡張機能を気に入っていただけたら、ストアで5つ星評価をいただけるとうれしいです。 8-)
`,
}

const bookInstructionTemplate: Record<SupportedLang, string> = {
    cn: '支持\`A\`. \`D\`, \`Left(左)\`, \`Right(右)\`和\`Space(空格)\`键或者鼠标滚轮翻页.',
    en: 'You can use the keyboard\'s \`A\`, \`D\`, \`Left\`, \`Right\` and \`Space\` keys or mouse wheel to page.',
    jp: '\`A\`、\`D\`、\`Left\`、\`Right\`、\`Space\`キー、またはマウスホイールでページをめくれます。',
}

function normalizeLang(inputLang: string): SupportedLang {
    if (inputLang === 'cn' || inputLang === 'jp' || inputLang === 'en') {
        return inputLang
    }
    return 'en'
}

function fillTemplate(template: string, values: Record<string, string>): string {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
        const val = values[key]
        return typeof val === 'string' ? val : ''
    })
}

export function getWelcomeInstructionText(inputLang: string, homePage: string): string {
    const lang = normalizeLang(inputLang)
    return fillTemplate(welcomeInstructionTemplate[lang], {
        HOME_PAGE: homePage,
        VERSION: pkgJson.version,
    })
}

export function getBookInstructionText(inputLang: string): string {
    const lang = normalizeLang(inputLang)
    return bookInstructionTemplate[lang]
}
