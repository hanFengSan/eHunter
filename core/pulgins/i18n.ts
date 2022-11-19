import { ref } from 'vue'

export default {
    install: (app: any, options: any) => {
        const lang = ref('')
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
        lang.value = 'cn'
        app.config.globalProperties.$i18n = (key: string) => {
            let text = options[key]
            if (text) {
                return text[lang.value]
            }
        }
    }
}