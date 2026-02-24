import { i18n } from './i18n'
import { store, storeAction, settingConf, settingFieldMap, dialogSettingFieldIds } from './app'

export function getFieldValue(id: string): any {
    switch (id) {
        case 'readingMode': return store.readingMode
        case 'widthScale': return store.widthScale
        case 'loadNum': return store.loadNum
        case 'downloadChunkSize': return store.downloadChunkSize
        case 'volumeSize': return store.volumeSize
        case 'showThumbView': return store.showThumbView
        case 'scrollPageMargin': return store.scrollPageMargin
        case 'pagesPerScreen': return store.pagesPerScreen
        case 'bookDirection': return store.bookDirection
        case 'pageTurnAnimationMode': return store.pageTurnAnimationMode
        case 'showBookPagination': return store.showBookPagination
        case 'isChangeOddEven': return store.isChangeOddEven
        case 'isReverseFlip': return store.isReverseFlip
        case 'isAutoFlip': return store.isAutoFlip
        case 'autoFlipFrequency': return store.autoFlipFrequency
        case 'showBookThumbView': return store.showBookThumbView
        case 'IsReverseBookWheeFliplDirection': return store.IsReverseBookWheeFliplDirection
        case 'wheelSensitivity': return store.wheelSensitivity
        case 'magnifierZoom': return store.magnifierZoom
        case 'magnifierAreaSize': return store.magnifierAreaSize
        case 'lang': return i18n.value.lang
        case 'autoRetryByOtherSource': return store.autoRetryByOtherSource
        default: return null
    }
}

export function setFieldValue(id: string, val: any): void {
    switch (id) {
        case 'readingMode': storeAction.setReadingMode(val); break
        case 'widthScale': storeAction.setWidthScale(val); break
        case 'loadNum': storeAction.setLoadNum(val); break
        case 'downloadChunkSize': storeAction.setDownloadChunkSize(val); break
        case 'volumeSize': storeAction.setVolumeSize(val); break
        case 'showThumbView': if (store.showThumbView !== val) storeAction.toggleShowThumbView(); break
        case 'scrollPageMargin': storeAction.setScrollPageMargin(val); break
        case 'pagesPerScreen': storeAction.setPagesPerScreen(val); break
        case 'bookDirection': storeAction.setBookDirection(val); break
        case 'pageTurnAnimationMode': storeAction.setPageTurnAnimationMode(val); break
        case 'showBookPagination': if (store.showBookPagination !== val) storeAction.toggleShowBookPagination(); break
        case 'isChangeOddEven': if (store.isChangeOddEven !== val) storeAction.toggleIsChangeOddEven(); break
        case 'isReverseFlip': if (store.isReverseFlip !== val) storeAction.toggleIsReverseFlip(); break
        case 'isAutoFlip': if (store.isAutoFlip !== val) storeAction.toggleIsAutoFlip(); break
        case 'autoFlipFrequency': storeAction.setAutoFlipFrequency(val); break
        case 'showBookThumbView': if (store.showBookThumbView !== val) storeAction.toggleShowBookThumbView(); break
        case 'IsReverseBookWheeFliplDirection': if (store.IsReverseBookWheeFliplDirection !== val) storeAction.toggleIsReverseBookWheeFliplDirection(); break
        case 'wheelSensitivity': storeAction.setWheelSensitivity(val); break
        case 'magnifierZoom': storeAction.setMagnifierZoom(val); break
        case 'magnifierAreaSize': storeAction.setMagnifierAreaSize(val); break
        case 'lang': storeAction.setLang(val); break
        case 'autoRetryByOtherSource': storeAction.setAutoRetryByOtherSource(val); break
    }
}

export function getDropList(id: string): any[] {
    const field = settingFieldMap[id]
    if (!field || !field.dropKey) {
        return []
    }
    const conf = (settingConf as any)[field.dropKey]
    if (Array.isArray(conf)) {
        return conf
    }
    return conf?.list || []
}

export function getNumList(id: string): number[] {
    const field = settingFieldMap[id]
    if (!field || !field.numKey) {
        return []
    }
    return (settingConf as any)[field.numKey].list
}

export function getNumSuffix(id: string): string {
    const field = settingFieldMap[id]
    if (!field || !field.numKey) {
        return ''
    }
    return (settingConf as any)[field.numKey].suffix || ''
}

export function getDialogFieldIds(category: 'general' | 'scroll' | 'book'): string[] {
    return dialogSettingFieldIds[category]
}
