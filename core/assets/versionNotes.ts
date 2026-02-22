type SupportedLang = 'cn' | 'en' | 'jp'

const versionNotesTemplate: Record<SupportedLang, string> = {
    cn: `
* 修复 exhentai/ehentai 的页数解析问题
* 现已支持大图缩略图

### iPad 支持
* 目前在 iOS 15/iPadOS 15 上可运行油猴脚本，因此 eHunter 也可在 iPad 使用
* 目前未做移动端 UI 适配，暂更适合 iPad；后续按需求评估 iPhone 优化
* 使用指南: [链接](https://github.com/hanFengSan/eHunter/blob/master/ipad_cn.md)

### eHunter-local
eHunter-local 是 eHunter 的本地版本，支持 Windows 和 MacOS。 [项目主页](https://github.com/hanFengSan/eHunter_local)

[Github下载](https://github.com/hanFengSan/eHunter_local/releases) [百度网盘](https://pan.baidu.com/s/1wEnBe9uGoBKzNd4DCfbuAg) 提取码: czft
`,
    en: `
* Fixed the support issue of exhentai/ehentai
* Support for large thumbnail mode

### Use in iPad
* The userscript can run on iOS 15/iPadOS 15, so eHunter can run on iPad now
* Mobile UX is not optimized yet, so iPhone experience may be limited
* Guide: [Link](https://github.com/hanFengSan/eHunter/blob/master/ipad_en.md)

### eHunter-local
The eHunter-local is local version of eHunter, supporting Windows and MacOS. [Home Page](https://github.com/hanFengSan/eHunter_local)

[Github releases](https://github.com/hanFengSan/eHunter_local/releases)
`,
    jp: `
* exhentai/ehentai の問題を修正しました
* Support for large thumbnail mode

### Use in iPad
* The userscript can run on iOS 15/iPadOS 15, so eHunter can run on iPad now
* Mobile UX is not optimized yet, so iPhone experience may be limited
* Guide: [Link](https://github.com/hanFengSan/eHunter/blob/master/ipad_en.md)

### eHunter-local
eHunter-local は eHunter のローカル版で、Windows と MacOS をサポートしています。 [Home Page](https://github.com/hanFengSan/eHunter_local)

[Github releases](https://github.com/hanFengSan/eHunter_local/releases)
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
