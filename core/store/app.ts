import { computed, reactive } from 'vue'
import { i18n, lang } from './i18n'
import type { AlbumService } from '../service/AlbumService'
import { NameAlbumService } from '../service/AlbumService'
import type { ImgPageInfo, ThumbInfo } from 'core/model/model'
import { initViewportSizeUpdater, initKeyboardListener, resetAutoFlipTimer, checkInstructions } from './event'
import PlatformService from '../../src/platform/base/service/PlatformService.js'

type PageTurnAnimationMode = 'realistic' | 'slide' | 'none'

interface PageTurnAnimationPreference {
    schemaVersion: number
    updatedAt: string
    scope: 'global'
    animationMode: PageTurnAnimationMode
}

const pageTurnAnimationPreferenceKey = 'ehunter:reader:prefs:page-turn-animation'
const pageTurnAnimationPreferenceSchemaVersion = 1
const defaultPageTurnAnimationMode: PageTurnAnimationMode = 'realistic'
let bookTurnSettleTimerID: number = 0
let isBookTurning = false
let pendingBookTurn: null | { val: number, updater: string } = null

function normalizePageTurnAnimationMode(value: any): PageTurnAnimationMode {
    if (value === 'slide' || value === 'none' || value === 'realistic') {
        return value
    }
    return defaultPageTurnAnimationMode
}

function getSystemPreferredPageTurnAnimationMode(): PageTurnAnimationMode {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return 'none'
        }
    } catch (e) {
    }
    return defaultPageTurnAnimationMode
}

function readByUserscriptStorage(): any {
    const gmGetValue = (<any>globalThis).GM_getValue
    if (typeof gmGetValue === 'function') {
        return gmGetValue(pageTurnAnimationPreferenceKey, null)
    }
    return null
}

function writeByUserscriptStorage(data: PageTurnAnimationPreference): boolean {
    const gmSetValue = (<any>globalThis).GM_setValue
    if (typeof gmSetValue === 'function') {
        gmSetValue(pageTurnAnimationPreferenceKey, data)
        return true
    }
    return false
}

function readByStorageService(): any {
    try {
        return PlatformService.storageGet(pageTurnAnimationPreferenceKey, null)
    } catch (e) {
        return null
    }
}

function writeByStorageService(data: PageTurnAnimationPreference): boolean {
    try {
        return PlatformService.storageSet(pageTurnAnimationPreferenceKey, data)
    } catch (e) {
        return false
    }
}

function parsePageTurnPreference(rawData: any): PageTurnAnimationPreference | null {
    if (!rawData) {
        return null
    }
    if (typeof rawData === 'string') {
        try {
            rawData = JSON.parse(rawData)
        } catch (e) {
            return null
        }
    }
    if (typeof rawData !== 'object') {
        return null
    }
    return {
        schemaVersion: Number(rawData.schemaVersion) || pageTurnAnimationPreferenceSchemaVersion,
        updatedAt: typeof rawData.updatedAt === 'string' ? rawData.updatedAt : new Date().toISOString(),
        scope: 'global',
        animationMode: normalizePageTurnAnimationMode(rawData.animationMode),
    }
}

function buildPageTurnPreference(mode: PageTurnAnimationMode): PageTurnAnimationPreference {
    return {
        schemaVersion: pageTurnAnimationPreferenceSchemaVersion,
        updatedAt: new Date().toISOString(),
        scope: 'global',
        animationMode: mode,
    }
}

function persistPageTurnAnimationMode(mode: PageTurnAnimationMode) {
    const preference = buildPageTurnPreference(mode)
    const usedUserscriptStorage = writeByUserscriptStorage(preference)
    if (!usedUserscriptStorage) {
        writeByStorageService(preference)
    }
}

function readPageTurnAnimationMode(): PageTurnAnimationMode {
    const userscriptStored = parsePageTurnPreference(readByUserscriptStorage())
    if (userscriptStored) {
        return userscriptStored.animationMode
    }
    const localStored = parsePageTurnPreference(readByStorageService())
    if (localStored) {
        return localStored.animationMode
    }
    return getSystemPreferredPageTurnAnimationMode()
}

export const store = reactive({
    // common
    viewportWidth: 0,
    viewportHeight: 0,

    // env variables
    isSupportThumbView: true,

    // top bar
    showTopBar: false,
    showMoreSettings: false,
    topBarHeight: 40, // px, for calc
    readingMode: 1, // 0: scroll, 1: book
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
    showBookThumbView: true,
    IsReverseBookWheeFliplDirection: false,
    wheelSensitivity: 100,
    scrollPageMargin: 70,
    showQuickAction: false,

    // thumbView
    thumbViewWidth: 150, // px
    thumbItemWidth: 150, // px
    thumbItemHeight: 160, // px
    thumbImgWidth: 100, // px

    // scroll view
    // volumePreloadCount: 2,

    // book view
    pagesPerScreen: 2, // the page quantity per screen
    flipDirection: 0, // 0: next, 1: pre
    pageTurnAnimationMode: <PageTurnAnimationMode>defaultPageTurnAnimationMode,

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

// the viewport width of AlbumBookView or AlbumScrollView, for calculating the page size of book view
export const computedAlbumViewportWidth = computed(() => {
    if ((store.readingMode == 0 && store.showThumbView) || (store.readingMode == 1 && store.showBookThumbView)) {
        return store.viewportWidth - store.thumbViewWidth
    }
    return store.viewportWidth
})

export const computedAlbumViewportHeight = computed(() => {
    if (store.showTopBar) {
        return store.viewportHeight - store.topBarHeight
    }
    return store.viewportHeight
})

export const computedAlbumViewportRatio = computed(() => {
    return computedAlbumViewportHeight.value / computedAlbumViewportWidth.value
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
    pageTurnAnimation: {
        list: [
            { i18nKey: 'pageTurnAnimationRealistic', val: 'realistic' },
            { i18nKey: 'pageTurnAnimationSlide', val: 'slide' },
            { i18nKey: 'pageTurnAnimationNone', val: 'none' },
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
        store.showTopBar = val
    },
    setReadingMode: (val: number) => {
        store.readingMode = val
        resetAutoFlipTimer()
        checkInstructions()
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
    setPageTurnAnimationMode: (val: string) => {
        let mode = normalizePageTurnAnimationMode(val)
        store.pageTurnAnimationMode = mode
        persistPageTurnAnimationMode(mode)
        if (mode === 'none') {
            if (bookTurnSettleTimerID) {
                window.clearTimeout(bookTurnSettleTimerID)
            }
            bookTurnSettleTimerID = 0
            isBookTurning = false
            pendingBookTurn = null
        }
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
        resetAutoFlipTimer()
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
        const applyCurViewIndex = (target: number, targetUpdater: string) => {
            if (target == store.curViewIndex) {
                return
            }
            let result = store.curViewIndex
            if (target < 0) {
                result = 0
            } else if (target >= store.pageCount) {
                result = store.pageCount - 1
            } else {
                result = target
            }
            if (result > store.curViewIndex) {
                store.flipDirection = 0
            } else if (result < store.curViewIndex) {
                store.flipDirection = 1
            }
            store.curViewIndex = result
            if (targetUpdater) {
                store.curViewIndexUpdater = targetUpdater
            }
            resetAutoFlipTimer()
        }

        const getBookTurnDuration = (): number => {
            switch (store.pageTurnAnimationMode) {
                case 'none':
                    return 0
                case 'slide':
                    return 220
                default:
                    return 280
            }
        }

        const settleBookTurn = () => {
            if (!pendingBookTurn) {
                isBookTurning = false
                bookTurnSettleTimerID = 0
                return
            }
            let nextTurn = pendingBookTurn
            pendingBookTurn = null
            applyCurViewIndex(nextTurn.val, nextTurn.updater)
            let duration = getBookTurnDuration()
            if (duration <= 0) {
                settleBookTurn()
                return
            }
            bookTurnSettleTimerID = window.setTimeout(settleBookTurn, duration)
        }

        if (store.readingMode == 1 && store.pageTurnAnimationMode !== 'none') {
            if (isBookTurning) {
                pendingBookTurn = { val, updater }
                return
            }
            isBookTurning = true
            applyCurViewIndex(val, updater)
            let duration = getBookTurnDuration()
            if (duration <= 0) {
                settleBookTurn()
            } else {
                bookTurnSettleTimerID = window.setTimeout(settleBookTurn, duration)
            }
            return
        }

        if (bookTurnSettleTimerID) {
            window.clearTimeout(bookTurnSettleTimerID)
            bookTurnSettleTimerID = 0
        }
        isBookTurning = false
        pendingBookTurn = null

        applyCurViewIndex(val, updater)
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
    },
    setViewportWidth: (val: number) => {
        store.viewportWidth = val
    },
    setViewportHeight: (val: number) => {
        store.viewportHeight = val
    },
    getImgPageInfo: (val: number) => {
        return store.imgPageInfos[val]
    },
    getImgPageHeightOfWidth: (val: number) => {
        let info = storeAction.getImgPageInfo(val)
        if (info.preciseHeightOfWidth) {
            return info.preciseHeightOfWidth
        }
        return info.heightOfWidth
    },
    toggleShowQuickAction: () => {
        store.showQuickAction = !store.showQuickAction
    },
}

let isInited = false
export function init(albumService: AlbumService) {
    if (isInited) {
        return
    }
    store.pageCount = albumService.getPageCount()
    store.thumbInfos = JSON.parse(JSON.stringify(albumService.getThumbInfos(false)))
    store.imgPageInfos = JSON.parse(JSON.stringify(albumService.getImgPageInfos()))
    store.albumTitle = albumService.getTitle()
    store.curViewIndex = albumService.getCurPageIndex()
    store.pageTurnAnimationMode = readPageTurnAnimationMode()
    initViewportSizeUpdater()
    initKeyboardListener()
    resetAutoFlipTimer()
    checkInstructions()
    isInited = true
}
