import { reactive, ref, computed } from 'vue'
import i18nText from '../assets/i18n'

const langMap: any = {cn: {}, en: {}, jp: {}}
for (let key in i18nText) {
    for (let langKey in i18nText[key]) {
        langMap[langKey][key] = i18nText[key][langKey]
    }
}

export const lang = ref('')
let uaLang = navigator.language.toLowerCase()
switch (true) {
    case uaLang.startsWith('en'):
        lang.value = 'en'
        break
    case uaLang.startsWith('zh'):
        lang.value = 'cn'
        break
    case uaLang.endsWith('jp') || uaLang.startsWith('ja'):
        lang.value = 'jp'
        break
}

export const i18n = computed(() => {
    return langMap[lang.value]
})

export const layoutI18nKeys = {
    dockLeft: 'dockLeft',
    dockRight: 'dockRight',
    dockBottom: 'dockBottom',
    resizePanel: 'resizePanel',
} as const
