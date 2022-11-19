import { computed, reactive } from 'vue'
import { i18n, lang } from './i18n'
import type {AlbumService} from '../service/AlbumService'
import {NameAlbumService} from '../service/AlbumService'
import type { ImgPageInfo, ThumbInfo } from 'core/model/model'

export const store = reactive({
    // env variables
    isSupportThumbView: true,

    // top bar
    showTopBar: true,
    showMoreSettings: false,
    topBarHeight: 40, // px, for calc
    readingMode: 0, // 0: scroll, 1: book
    widthScale: 80, // percent, the scale of img
    loadNum: 3, // the sum of pages per loading
    volumeSize: 100, // default 10, the page quantity per volume
    showThumbView: true,
    bookDirection: 0, // 0: RTL, 1: LTR
    showBookPagination: true, // show/hide bottom floating pagination bar
    isChangeOddEven: false,
    isReverseFlip: false, // reverse the page flipping direction
    isAutoFlip: false,
    autoFlipFrequency: 10, // sec
    showBookThumbView: false,
    IsReverseBookWheeFliplDirection: false,
    wheelSensitivity: 100,
    scrollPageMargin: 70,

    // thumbView
    thumbItemWidth: 150, // px
    thumbItemHeight: 160, // px
    thumbImgWidth: 100, // px

    // scroll view
    // volumePreloadCount: 2,

    // book view
    pagesPerScreen: 2, // the page quantity per screen

    // gallery info
    thumbInfos: <ThumbInfo[]>[],
    imgPageInfos: <ImgPageInfo[]>[],
    pageCount: 0,
    curViewIndex: 0,
    curViewIndexUpdater: '',
    albumTitle: '',
})

export const computedCurVolNo = computed(() => {
    return Math.ceil((store.curViewIndex + 1) / store.volumeSize)
})

export const computedVolFirstIndex = computed(() => {
    return (computedCurVolNo.value - 1) * store.volumeSize
})

export const computedVolIndex = computed(() => {
    return store.curViewIndex - computedVolFirstIndex.value
})

export const computedVolumeSum = computed(() => {
    return Math.ceil(store.pageCount / store.volumeSize)
})

export const computedVolPageIndexList = computed(() => {
    let result: number[] = []
    for (let i = computedVolFirstIndex.value; i < store.volumeSize && i < store.pageCount; i++) {
        result.push(i)
    }
    return result
})

export const computedVolPreloadPageIndexList = computed(() => {
    let result: number[] = []
    if (computedCurVolNo.value >= computedVolumeSum.value) {
        return result
    }
    let preloadNum = (store.curViewIndex + store.loadNum) - (computedVolFirstIndex.value + store.volumeSize)
    if (preloadNum <= 0) {
        return result
    }
    for (let i = 0; i < preloadNum; i++) {
        let index = computedVolFirstIndex.value + store.volumeSize + i
        if (index <= store.pageCount - 1) {
            result.push(index)
        }
    }
    return result
})

export const settingConf = {
    readingModeList: [
        { i18nKey: 'scrollMode', val: 0 },
        { i18nKey: 'bookMode', val: 1 },
    ],
    widthScale: {
        list: [40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
        suffix: '%'
    },
    loadNum: {
        list: [1, 2, 3, 5, 10, 20, 30, 40, 50, 100],
        suffix: 'P'
    },
    volumeSize: {
        list: [10, 20, 30, 50, 100],
        suffix: 'P'
    },
    pagesPerScreen: {
        list: [1, 2, 3, 4, 5],
        suffix: 'P',
    },
    bookDirection: {
        list: [
            { i18nKey: 'rtl', abbrI18nKey: 'rtlAbbr', val: 0 },
            { i18nKey: 'ltr', abbrI18nKey: 'ltrAbbr', val: 1 },
        ]
    },
    autoFlipFrequency: {
        list: [3, 5, 8, 10, 15, 20, 30, 45, 60],
        suffix: ' sec'
    },
    wheelSensitivity: {
        list: [10, 30, 50, 80, 100, 120, 150, 170, 200, 220, 250],
    },
    scrollPageMargin: {
        list: [0, 30, 70, 100, 150],
        suffix: 'px'
    },
    langList: [
        { name: 'English', abbrName: 'EN', val: 'en' },
        { name: '简体中文', abbrName: 'CN', val: 'cn' },
        { name: '日本語', abbrName: 'JP', val: 'jp' }
    ]
}

export const storeAction = {
    toggleShowMoreSettings: () => {
        store.showMoreSettings = !store.showMoreSettings
    },
    toggleShowTopBar: () => {
        store.showTopBar = !store.showTopBar
    },
    setTopBar: (val: boolean) => {
        store.showTopBar =val
    },
    setReadingMode: (val: number) => {
        store.readingMode = val
    },
    setWidthScale: (val: number) => {
        store.widthScale = val
    },
    setLoadNum: (val: number) => {
        store.loadNum = val
    },
    setVolumeSize: (val: number) => {
        store.volumeSize = val
    },
    toggleShowThumbView: () => {
        store.showThumbView = !store.showThumbView
    },
    setPagesPerScreen: (val: number) => {
        store.pagesPerScreen = val
    },
    setBookDirection: (val: number) => {
        store.bookDirection = val
    },
    toggleShowBookPagination: () => {
        store.showBookPagination = !store.showBookPagination
    },
    toggleIsChangeOddEven: () => {
        store.isChangeOddEven = !store.isChangeOddEven
    },
    toggleIsReverseFlip: () => {
        store.isReverseFlip = !store.isReverseFlip
    },
    toggleIsAutoFlip: () => {
        store.isAutoFlip = !store.isAutoFlip
    },
    setAutoFlipFrequency: (val: number) => {
        store.autoFlipFrequency = val
    },
    toggleShowBookThumbView: () => {
        store.showBookThumbView = !store.showBookThumbView
    },
    toggleIsReverseBookWheeFliplDirection: () => {
        store.IsReverseBookWheeFliplDirection = !store.IsReverseBookWheeFliplDirection
    },
    setWheelSensitivity: (val: number) => {
        store.wheelSensitivity = val
    },
    setScrollPageMargin: (val: number) => {
        store.scrollPageMargin = val
    },
    setLang: (val: string) => {
        lang.value = val
    },
    setCurViewIndex: (val: number, updater: string) => {
        if (val == store.curViewIndex) {
            return
        }
        if (val < 0) {
            store.curViewIndex = 0
        } else if (val <= store.pageCount - 1) {
            store.curViewIndex = val
        } else {
            store.curViewIndex = store.pageCount - 1
        }
        if (updater) {
            store.curViewIndexUpdater = updater
        }
    },
    setThumbInfos: (val: Array<ThumbInfo>) => {
        store.thumbInfos = val
    },
    setImgPageInfos: (val: Array<ImgPageInfo>) => {
        store.imgPageInfos = val
    },
    setImgPageInfoSrc: (index: number, val: string) => {
        if (index < store.imgPageInfos.length) {
            store.imgPageInfos[index].src = val
        }
    },
    setImgPageInfoPreciseHeightOfWidth: (index: number, val: number) => {
        if (index < store.imgPageInfos.length) {
            store.imgPageInfos[index].preciseHeightOfWidth = val
        }
    }
}


let isInited = false
export function init(albumService: AlbumService) {
    if (isInited) {
        return
    }
    store.pageCount = albumService.getPageCount()
    store.curViewIndex = albumService.getCurPageNum()
    store.thumbInfos = JSON.parse(JSON.stringify(albumService.getThumbInfos(false)))
    store.imgPageInfos = JSON.parse(JSON.stringify(albumService.getImgPageInfos()))
    store.albumTitle = albumService.getTitle()
    isInited = true
}
