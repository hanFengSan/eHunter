import { computed, reactive, watch } from 'vue'
import { i18n, lang } from './i18n'
import type { AlbumService } from '../service/AlbumService'
import { NameAlbumService } from '../service/AlbumService'
import type { ImgPageInfo, ThumbInfo } from 'core/model/model'
import { initViewportSizeUpdater, initKeyboardListener, resetAutoFlipTimer, checkInstructions, openWelcomeInstructionDialog, checkVersion } from './event'
import PlatformService from '../../src/platform/base/service/PlatformService.js'
import {
    clampThumbSize,
    createDefaultLayoutPreference,
    normalizeDockSlot,
    type DockSlotId,
    type ReaderModeLayoutKey,
} from '../model/layout'
import { getAdjacentBookPageIndex } from '../model/bookSpread'
import {
    clampThumbExpandSegmentIndex,
    getThumbExpandSegmentByPage,
} from '../model/thumbExpand'
import { readLayoutPreference, writeLayoutPreference } from './layoutPreference'
import { GalleryDownloadService } from '../service/GalleryDownloadService'
import type { DownloadStatusEvent, DownloadTaskPhase, DownloadSeverity } from '../service/GalleryDownloadService'

type PageTurnAnimationMode = 'realistic' | 'slide' | 'none'

type ModeScope = 'both' | 'scroll-only' | 'book-only'
type SettingsPanelCategory = 'general' | 'scroll' | 'book'
type SettingControlType = 'drop' | 'num' | 'switch'

export type ShortcutActionId =
    | 'goPrev'
    | 'goNext'
    | 'toggleMoreSettings'
    | 'toggleTopBar'
    | 'toggleThumbView'
    | 'toggleQuickPreview'
    | 'increaseWidthScale'
    | 'decreaseWidthScale'
    | 'togglePagination'
    | 'toggleAutoFlip'
    | 'toggleOddEven'

export type ShortcutBindingMap = Record<ShortcutActionId, string>

export interface ShortcutActionDefinition {
    id: ShortcutActionId
    labelI18nKey: string
    tipI18nKey?: string
}

export interface DownloadStatusNotification {
    notificationId: string
    taskId: string
    title: string
    phase: DownloadTaskPhase
    severity: DownloadSeverity
    message: string
    progressCurrent?: number
    progressTotal?: number
    actions?: DownloadStatusAction[]
    createdAt: string
    updatedAt: string
}

export interface DownloadStatusAction {
    id: string
    label: string
    variant?: 'plain' | 'danger'
    onClick?: (notification: DownloadStatusNotification) => void
}

export interface DownloadTaskRecord {
    taskId: string
    albumTitle: string
    totalPages: number
    processedPages: number
    failedPages: number
    status: DownloadTaskPhase
    actions: DownloadStatusAction[]
    createdAt: string
    updatedAt: string
}

export interface InstructionDialogPayload {
    title: string
    mdText: string
    isCompulsive?: boolean
    operations?: InstructionDialogOperation[]
}

export interface InstructionDialogEntry extends InstructionDialogPayload {
    id: string
}

export interface InstructionDialogOperation {
    name: string
    btnType: string
    isCloseModal: boolean
    onClick?: () => void
}

function cloneInstructionDialogPayload(payload: InstructionDialogPayload): InstructionDialogPayload {
    return {
        title: payload.title,
        mdText: payload.mdText,
        isCompulsive: payload.isCompulsive,
        operations: payload.operations ? [...payload.operations] : [],
    }
}

let instructionDialogSeq = 0
function createInstructionDialogEntry(payload: InstructionDialogPayload): InstructionDialogEntry {
    instructionDialogSeq += 1
    const cloned = cloneInstructionDialogPayload(payload)
    return {
        ...cloned,
        id: `dialog-${Date.now()}-${instructionDialogSeq}`,
    }
}

function syncInstructionDialogState() {
    const dialogs = store.instructionDialogStack
    const topDialog = dialogs.length > 0 ? dialogs[dialogs.length - 1] : null
    if (!topDialog) {
        store.showInstructionDialog = false
        store.instructionDialogTitle = ''
        store.instructionDialogMdText = ''
        store.instructionDialogCompulsive = false
        store.instructionDialogOperations = []
        return
    }
    store.showInstructionDialog = true
    store.instructionDialogTitle = topDialog.title
    store.instructionDialogMdText = topDialog.mdText
    store.instructionDialogCompulsive = topDialog.isCompulsive !== false
    store.instructionDialogOperations = topDialog.operations ? [...topDialog.operations] : []
}

export interface QuickSettingOption {
    id: string
    i18nKey: string
    modeScope: ModeScope
    fixed?: boolean
}

export interface SettingsCategory {
    id: 'general' | 'scroll' | 'book' | 'quick' | 'shortcuts' | 'other'
    i18nKey: string
}

export interface SettingFieldDefinition {
    id: string
    control: SettingControlType
    labelI18nKey: string
    tipI18nKey?: string
    modeScope: ModeScope
    showInTopBar: boolean
    showInDialog: boolean
    dialogCategory?: SettingsPanelCategory
    dropKey?: 'readingModeList' | 'bookDirection' | 'pageTurnAnimation' | 'langList'
    numKey?: 'widthScale' | 'loadNum' | 'downloadChunkSize' | 'volumeSize' | 'pagesPerScreen' | 'autoFlipFrequency' | 'wheelSensitivity' | 'scrollPageMargin' | 'magnifierZoom' | 'magnifierAreaSize'
    min?: number
    max?: number
    useAbbrName?: boolean
    isFloat?: boolean
    requireThumbSupportInTopBar?: boolean
}

interface PageTurnAnimationPreference {
    schemaVersion: number
    updatedAt: string
    scope: 'global'
    animationMode: PageTurnAnimationMode
}

const pageTurnAnimationPreferenceKey = 'ehunter:reader:prefs:page-turn-animation'
const pageTurnAnimationPreferenceSchemaVersion = 1
const defaultPageTurnAnimationMode: PageTurnAnimationMode = 'realistic'
const unifiedSettingsPreferenceKey = 'ehunter:reader:prefs:unified-settings'
const unifiedSettingsPreferenceSchemaVersion = 3
let bookTurnSettleTimerID: number = 0
let isBookTurning = false
let pendingBookTurn: null | { val: number, updater: string } = null
let readerLayoutPreference = createDefaultLayoutPreference()
let runtimeAlbumService: AlbumService | null = null
const downloadRunnerMap: Record<string, GalleryDownloadService> = {}

export const quickSettingOptions: QuickSettingOption[] = [
    { id: 'readingMode', i18nKey: 'readingMode', modeScope: 'both', fixed: true },
    { id: 'widthScale', i18nKey: 'widthScale', modeScope: 'scroll-only' },
    { id: 'loadNum', i18nKey: 'loadNum', modeScope: 'both' },
    { id: 'volumeSize', i18nKey: 'volSize', modeScope: 'scroll-only' },
    { id: 'showThumbView', i18nKey: 'thumbView', modeScope: 'scroll-only' },
    { id: 'scrollPageMargin', i18nKey: 'pageMargin', modeScope: 'scroll-only' },
    { id: 'pagesPerScreen', i18nKey: 'screenSize', modeScope: 'book-only' },
    { id: 'bookDirection', i18nKey: 'bookDirection', modeScope: 'book-only' },
    { id: 'pageTurnAnimationMode', i18nKey: 'pageTurnAnimation', modeScope: 'book-only' },
    { id: 'showBookPagination', i18nKey: 'pagination', modeScope: 'book-only' },
    { id: 'isChangeOddEven', i18nKey: 'oddEven', modeScope: 'book-only' },
    { id: 'isAutoFlip', i18nKey: 'autoFlip', modeScope: 'book-only' },
    { id: 'autoFlipFrequency', i18nKey: 'autoFlipFrequency', modeScope: 'book-only' },
    { id: 'showBookThumbView', i18nKey: 'thumbView', modeScope: 'book-only' },
    { id: 'IsReverseBookWheeFliplDirection', i18nKey: 'wheelDirection', modeScope: 'book-only' },
    { id: 'wheelSensitivity', i18nKey: 'wheelSensitivity', modeScope: 'book-only' },
    { id: 'lang', i18nKey: 'languageSetting', modeScope: 'both' },
    { id: 'autoRetryByOtherSource', i18nKey: 'autoSourceRetry', modeScope: 'both' },
]

export const settingsCategories: SettingsCategory[] = [
    { id: 'general', i18nKey: 'settingsGeneral' },
    { id: 'scroll', i18nKey: 'settingsScrollMode' },
    { id: 'book', i18nKey: 'settingsBookMode' },
    { id: 'quick', i18nKey: 'settingsQuick' },
    { id: 'shortcuts', i18nKey: 'settingsShortcuts' },
    { id: 'other', i18nKey: 'settingsOther' },
]

export const shortcutActionDefinitions: ShortcutActionDefinition[] = [
    { id: 'goPrev', labelI18nKey: 'shortcutGoPrev', tipI18nKey: 'shortcutGoPrevTip' },
    { id: 'goNext', labelI18nKey: 'shortcutGoNext', tipI18nKey: 'shortcutGoNextTip' },
    { id: 'toggleMoreSettings', labelI18nKey: 'shortcutToggleMoreSettings', tipI18nKey: 'shortcutToggleMoreSettingsTip' },
    { id: 'toggleTopBar', labelI18nKey: 'shortcutToggleTopBar', tipI18nKey: 'shortcutToggleTopBarTip' },
    { id: 'toggleThumbView', labelI18nKey: 'shortcutToggleThumbView', tipI18nKey: 'shortcutToggleThumbViewTip' },
    { id: 'toggleQuickPreview', labelI18nKey: 'shortcutToggleQuickPreview', tipI18nKey: 'shortcutToggleQuickPreviewTip' },
    { id: 'increaseWidthScale', labelI18nKey: 'shortcutIncreaseWidthScale', tipI18nKey: 'shortcutIncreaseWidthScaleTip' },
    { id: 'decreaseWidthScale', labelI18nKey: 'shortcutDecreaseWidthScale', tipI18nKey: 'shortcutDecreaseWidthScaleTip' },
    { id: 'togglePagination', labelI18nKey: 'shortcutTogglePagination', tipI18nKey: 'shortcutTogglePaginationTip' },
    { id: 'toggleAutoFlip', labelI18nKey: 'shortcutToggleAutoFlip', tipI18nKey: 'shortcutToggleAutoFlipTip' },
    { id: 'toggleOddEven', labelI18nKey: 'shortcutToggleOddEven', tipI18nKey: 'shortcutToggleOddEvenTip' },
]

export const defaultShortcutBindings: ShortcutBindingMap = {
    goPrev: 'ArrowLeft,ArrowUp,a',
    goNext: 'ArrowRight,ArrowDown,d',
    toggleMoreSettings: 'Shift',
    toggleTopBar: 'q',
    toggleThumbView: 't',
    toggleQuickPreview: 'f',
    increaseWidthScale: ']',
    decreaseWidthScale: '[',
    togglePagination: '',
    toggleAutoFlip: '',
    toggleOddEven: '',
}

export interface ShortcutKeyCandidate {
    key: string
    label: string
}

export const shortcutKeyCandidates: ShortcutKeyCandidate[] = [
    { key: 'ArrowUp', label: '↑' },
    { key: 'ArrowDown', label: '↓' },
    { key: 'ArrowLeft', label: '←' },
    { key: 'ArrowRight', label: '→' },
    { key: 'Escape', label: 'Esc' },
    { key: 'Tab', label: 'Tab' },
    { key: 'CapsLock', label: 'Caps' },
    { key: 'Control', label: 'Ctrl' },
    { key: 'Shift', label: 'Shift' },
    { key: 'F1', label: 'F1' },
    { key: 'F2', label: 'F2' },
    { key: 'F3', label: 'F3' },
    { key: 'F4', label: 'F4' },
    { key: 'F5', label: 'F5' },
    { key: 'F6', label: 'F6' },
    { key: 'F7', label: 'F7' },
    { key: 'F8', label: 'F8' },
    { key: 'F9', label: 'F9' },
    { key: 'F10', label: 'F10' },
    { key: 'F11', label: 'F11' },
    { key: 'F12', label: 'F12' },
    { key: '1', label: '1' },
    { key: '2', label: '2' },
    { key: '3', label: '3' },
    { key: '4', label: '4' },
    { key: '5', label: '5' },
    { key: '6', label: '6' },
    { key: '7', label: '7' },
    { key: '8', label: '8' },
    { key: '9', label: '9' },
    { key: '-', label: '-' },
    { key: '=', label: '=' },
    { key: '[', label: '[' },
    { key: ']', label: ']' },
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
    { key: 'c', label: 'C' },
    { key: 'd', label: 'D' },
    { key: 'e', label: 'E' },
    { key: 'f', label: 'F' },
    { key: 'g', label: 'G' },
    { key: 'h', label: 'H' },
    { key: 'i', label: 'I' },
    { key: 'j', label: 'J' },
    { key: 'k', label: 'K' },
    { key: 'l', label: 'L' },
    { key: 'm', label: 'M' },
    { key: 'n', label: 'N' },
    { key: 'o', label: 'O' },
    { key: 'p', label: 'P' },
    { key: 'q', label: 'Q' },
    { key: 'r', label: 'R' },
    { key: 's', label: 'S' },
    { key: 't', label: 'T' },
    { key: 'u', label: 'U' },
    { key: 'v', label: 'V' },
    { key: 'w', label: 'W' },
    { key: 'x', label: 'X' },
    { key: 'y', label: 'Y' },
    { key: 'z', label: 'Z' },
]

export const settingFieldDefinitions: SettingFieldDefinition[] = [
    {
        id: 'readingMode',
        control: 'drop',
        labelI18nKey: 'readingMode',
        tipI18nKey: 'readingModeTip',
        modeScope: 'both',
        showInTopBar: true,
        showInDialog: false,
        dropKey: 'readingModeList',
    },
    {
        id: 'lang',
        control: 'drop',
        labelI18nKey: 'languageSetting',
        tipI18nKey: 'languageSettingTip',
        modeScope: 'both',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'general',
        dropKey: 'langList',
        useAbbrName: true,
    },
    {
        id: 'loadNum',
        control: 'num',
        labelI18nKey: 'loadNum',
        tipI18nKey: 'loadNumTip',
        modeScope: 'both',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'general',
        numKey: 'loadNum',
        min: 1,
        max: 100,
    },
    {
        id: 'downloadChunkSize',
        control: 'num',
        labelI18nKey: 'downloadChunkSize',
        tipI18nKey: 'downloadChunkSizeTip',
        modeScope: 'both',
        showInTopBar: false,
        showInDialog: true,
        dialogCategory: 'general',
        numKey: 'downloadChunkSize',
        min: 1,
        max: 1000,
    },
    {
        id: 'autoRetryByOtherSource',
        control: 'switch',
        labelI18nKey: 'autoSourceRetry',
        tipI18nKey: 'autoSourceRetryTip',
        modeScope: 'both',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'general',
    },
    {
        id: 'magnifierZoom',
        control: 'num',
        labelI18nKey: 'magnifierZoom',
        tipI18nKey: 'magnifierZoomTip',
        modeScope: 'both',
        showInTopBar: false,
        showInDialog: true,
        dialogCategory: 'general',
        numKey: 'magnifierZoom',
        min: 2,
        max: 5,
    },
    {
        id: 'magnifierAreaSize',
        control: 'num',
        labelI18nKey: 'magnifierAreaSize',
        tipI18nKey: 'magnifierAreaSizeTip',
        modeScope: 'both',
        showInTopBar: false,
        showInDialog: true,
        dialogCategory: 'general',
        numKey: 'magnifierAreaSize',
        min: 20,
        max: 300,
    },
    {
        id: 'widthScale',
        control: 'num',
        labelI18nKey: 'widthScale',
        tipI18nKey: 'widthScaleTip',
        modeScope: 'scroll-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'scroll',
        numKey: 'widthScale',
        min: 30,
        max: 100,
        isFloat: true,
    },
    {
        id: 'volumeSize',
        control: 'num',
        labelI18nKey: 'volSize',
        tipI18nKey: 'volSizeTip',
        modeScope: 'scroll-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'scroll',
        numKey: 'volumeSize',
        min: 1,
        max: 200,
    },
    {
        id: 'showThumbView',
        control: 'switch',
        labelI18nKey: 'thumbView',
        tipI18nKey: 'thumbViewTip',
        modeScope: 'scroll-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'scroll',
        requireThumbSupportInTopBar: true,
    },
    {
        id: 'scrollPageMargin',
        control: 'num',
        labelI18nKey: 'pageMargin',
        tipI18nKey: 'pageMarginTip',
        modeScope: 'scroll-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'scroll',
        numKey: 'scrollPageMargin',
        min: 0,
        max: 300,
    },
    {
        id: 'pagesPerScreen',
        control: 'num',
        labelI18nKey: 'screenSize',
        tipI18nKey: 'screenSizeTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
        numKey: 'pagesPerScreen',
        min: 1,
        max: 10,
    },
    {
        id: 'bookDirection',
        control: 'drop',
        labelI18nKey: 'bookDirection',
        tipI18nKey: 'bookDirectionTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
        dropKey: 'bookDirection',
        useAbbrName: true,
    },
    {
        id: 'pageTurnAnimationMode',
        control: 'drop',
        labelI18nKey: 'pageTurnAnimation',
        tipI18nKey: 'pageTurnAnimationTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
        dropKey: 'pageTurnAnimation',
    },
    {
        id: 'showBookPagination',
        control: 'switch',
        labelI18nKey: 'pagination',
        tipI18nKey: 'paginationTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
    },
    {
        id: 'isChangeOddEven',
        control: 'switch',
        labelI18nKey: 'oddEven',
        tipI18nKey: 'oddEvenTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
    },
    {
        id: 'isAutoFlip',
        control: 'switch',
        labelI18nKey: 'autoFlip',
        tipI18nKey: 'autoFlipTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
    },
    {
        id: 'autoFlipFrequency',
        control: 'num',
        labelI18nKey: 'autoFlipFrequency',
        tipI18nKey: 'autoFlipFrequencyTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
        numKey: 'autoFlipFrequency',
        min: 1,
        max: 240,
    },
    {
        id: 'showBookThumbView',
        control: 'switch',
        labelI18nKey: 'thumbView',
        tipI18nKey: 'thumbViewTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
    },
    {
        id: 'IsReverseBookWheeFliplDirection',
        control: 'switch',
        labelI18nKey: 'wheelDirection',
        tipI18nKey: 'wheelDirectionTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
    },
    {
        id: 'wheelSensitivity',
        control: 'num',
        labelI18nKey: 'wheelSensitivity',
        tipI18nKey: 'wheelSensitivityTip',
        modeScope: 'book-only',
        showInTopBar: true,
        showInDialog: true,
        dialogCategory: 'book',
        numKey: 'wheelSensitivity',
        min: 1,
        max: 250,
    },
]

export const settingFieldMap: Record<string, SettingFieldDefinition> = settingFieldDefinitions
    .reduce((map, item) => {
        map[item.id] = item
        return map
    }, {} as Record<string, SettingFieldDefinition>)

export const dialogSettingFieldIds: Record<SettingsPanelCategory, string[]> = {
    general: settingFieldDefinitions.filter(item => item.showInDialog && item.dialogCategory === 'general').map(item => item.id),
    scroll: settingFieldDefinitions.filter(item => item.showInDialog && item.dialogCategory === 'scroll').map(item => item.id),
    book: settingFieldDefinitions.filter(item => item.showInDialog && item.dialogCategory === 'book').map(item => item.id),
}

const pinnedQuickSettingId = 'readingMode'
const defaultQuickSettingOrder = quickSettingOptions.map(item => item.id)
const defaultQuickSettingSelected = [
    'readingMode',
    'widthScale',
    'loadNum',
    'volumeSize',
    'showThumbView',
    'pagesPerScreen',
    'bookDirection',
    'isChangeOddEven',
    'showBookPagination',
    'showBookThumbView',
    'lang',
]

interface UnifiedSettingsPreference {
    schemaVersion: number
    updatedAt: string
    settings: Record<string, any>
    quickSelection: string[]
    quickOrder: string[]
    shortcuts?: Partial<ShortcutBindingMap>
}

function normalizeShortcutToken(raw: any): string {
    if (typeof raw !== 'string') {
        return ''
    }
    return raw.trim()
}

function normalizeShortcutBindings(raw: any): ShortcutBindingMap {
    const result: ShortcutBindingMap = {
        ...defaultShortcutBindings,
    }
    if (!raw || typeof raw !== 'object') {
        return result
    }
    for (const definition of shortcutActionDefinitions) {
        const key = definition.id
        if (!Object.prototype.hasOwnProperty.call(raw, key)) {
            continue
        }
        const val = normalizeShortcutToken((raw as Record<string, any>)[key])
        if (typeof val === 'string') {
            result[key] = val
        }
    }
    return result
}

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

function readUnifiedSettingsRaw(): any {
    const gmGetValue = (<any>globalThis).GM_getValue
    if (typeof gmGetValue === 'function') {
        return gmGetValue(unifiedSettingsPreferenceKey, null)
    }
    try {
        return PlatformService.storageGet(unifiedSettingsPreferenceKey, null)
    } catch (e) {
        return null
    }
}

function writeUnifiedSettingsRaw(data: UnifiedSettingsPreference): void {
    const gmSetValue = (<any>globalThis).GM_setValue
    if (typeof gmSetValue === 'function') {
        gmSetValue(unifiedSettingsPreferenceKey, data)
        return
    }
    try {
        PlatformService.storageSet(unifiedSettingsPreferenceKey, data)
    } catch (e) {
    }
}

function sanitizeQuickSettingSelection(rawSelection: any, rawOrder: any): { selected: string[], order: string[] } {
    const validIds = new Set(quickSettingOptions.map(item => item.id))
    const orderInput = Array.isArray(rawOrder) ? rawOrder : defaultQuickSettingOrder
    const selectedInput = Array.isArray(rawSelection) ? rawSelection : defaultQuickSettingSelected

    const order: string[] = []
    for (const id of orderInput) {
        if (typeof id === 'string' && validIds.has(id) && !order.includes(id)) {
            order.push(id)
        }
    }
    for (const id of defaultQuickSettingOrder) {
        if (!order.includes(id)) {
            order.push(id)
        }
    }

    const selected: string[] = []
    for (const id of selectedInput) {
        if (typeof id === 'string' && validIds.has(id) && !selected.includes(id)) {
            selected.push(id)
        }
    }
    if (!selected.includes(pinnedQuickSettingId)) {
        selected.unshift(pinnedQuickSettingId)
    }

    const orderWithoutPinned = order.filter(id => id !== pinnedQuickSettingId)
    return {
        selected,
        order: [pinnedQuickSettingId, ...orderWithoutPinned],
    }
}

function parseUnifiedSettingsPreference(rawData: any): UnifiedSettingsPreference | null {
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
    const quick = sanitizeQuickSettingSelection(rawData.quickSelection, rawData.quickOrder)
    const schemaVersion = Number(rawData.schemaVersion) || unifiedSettingsPreferenceSchemaVersion
    const shortcuts = normalizeShortcutBindings(rawData.shortcuts)
    if (schemaVersion < 2 && (!shortcuts.toggleQuickPreview || !shortcuts.toggleQuickPreview.trim())) {
        shortcuts.toggleQuickPreview = defaultShortcutBindings.toggleQuickPreview
    }
    if (schemaVersion < 3) {
        if (!shortcuts.toggleTopBar || shortcuts.toggleTopBar.trim() === '' || shortcuts.toggleTopBar === 'Escape') {
            shortcuts.toggleTopBar = defaultShortcutBindings.toggleTopBar
        }
        if (!shortcuts.toggleThumbView || shortcuts.toggleThumbView.trim() === '' || shortcuts.toggleThumbView === '~') {
            shortcuts.toggleThumbView = defaultShortcutBindings.toggleThumbView
        }
    }
    return {
        schemaVersion,
        updatedAt: typeof rawData.updatedAt === 'string' ? rawData.updatedAt : new Date().toISOString(),
        settings: typeof rawData.settings === 'object' && rawData.settings ? rawData.settings : {},
        quickSelection: quick.selected,
        quickOrder: quick.order,
        shortcuts,
    }
}

function persistUnifiedSettingsState() {
    const payload: UnifiedSettingsPreference = {
        schemaVersion: unifiedSettingsPreferenceSchemaVersion,
        updatedAt: new Date().toISOString(),
        settings: {
            readingMode: store.readingMode,
            widthScale: store.widthScale,
            loadNum: store.loadNum,
            downloadChunkSize: store.downloadChunkSize,
            volumeSize: store.volumeSize,
            showThumbView: store.showThumbView,
            scrollPageMargin: store.scrollPageMargin,
            pagesPerScreen: store.pagesPerScreen,
            bookDirection: store.bookDirection,
            pageTurnAnimationMode: store.pageTurnAnimationMode,
            showBookPagination: store.showBookPagination,
            isChangeOddEven: store.isChangeOddEven,
            isReverseFlip: store.isReverseFlip,
            isAutoFlip: store.isAutoFlip,
            autoFlipFrequency: store.autoFlipFrequency,
            showBookThumbView: store.showBookThumbView,
            IsReverseBookWheeFliplDirection: store.IsReverseBookWheeFliplDirection,
            wheelSensitivity: store.wheelSensitivity,
            magnifierZoom: store.magnifierZoom,
            magnifierAreaSize: store.magnifierAreaSize,
            lang: lang.value,
            autoRetryByOtherSource: store.autoRetryByOtherSource,
            hasShownWelcomeInstruction: store.hasShownWelcomeInstruction,
            hasShownBookInstruction: store.hasShownBookInstruction,
            lastSeenVersionNotice: store.lastSeenVersionNotice,
            lastRemoteUpdateNoticeAt: store.lastRemoteUpdateNoticeAt,
        },
        quickSelection: [...store.quickSettingSelected],
        quickOrder: [...store.quickSettingOrder],
        shortcuts: {
            ...store.shortcutBindings,
        },
    }
    writeUnifiedSettingsRaw(payload)
}

function applyUnifiedSettingsPreference() {
    const preference = parseUnifiedSettingsPreference(readUnifiedSettingsRaw())
    if (!preference) {
        store.quickSettingSelected = [...defaultQuickSettingSelected]
        store.quickSettingOrder = [...defaultQuickSettingOrder]
        return
    }

    const setting = preference.settings || {}
    const numberFields: Array<[string, string]> = [
        ['readingMode', 'readingMode'],
        ['widthScale', 'widthScale'],
        ['loadNum', 'loadNum'],
        ['downloadChunkSize', 'downloadChunkSize'],
        ['volumeSize', 'volumeSize'],
        ['scrollPageMargin', 'scrollPageMargin'],
        ['pagesPerScreen', 'pagesPerScreen'],
        ['bookDirection', 'bookDirection'],
        ['autoFlipFrequency', 'autoFlipFrequency'],
        ['wheelSensitivity', 'wheelSensitivity'],
        ['magnifierZoom', 'magnifierZoom'],
        ['magnifierAreaSize', 'magnifierAreaSize'],
    ]
    for (const [sourceKey, targetKey] of numberFields) {
        if (typeof setting[sourceKey] === 'number' && Number.isFinite(setting[sourceKey])) {
            ;(<any>store)[targetKey] = setting[sourceKey]
        }
    }

    const boolFields: Array<[string, string]> = [
        ['showThumbView', 'showThumbView'],
        ['showBookPagination', 'showBookPagination'],
        ['isChangeOddEven', 'isChangeOddEven'],
        ['isReverseFlip', 'isReverseFlip'],
        ['isAutoFlip', 'isAutoFlip'],
        ['showBookThumbView', 'showBookThumbView'],
        ['IsReverseBookWheeFliplDirection', 'IsReverseBookWheeFliplDirection'],
        ['autoRetryByOtherSource', 'autoRetryByOtherSource'],
        ['hasShownWelcomeInstruction', 'hasShownWelcomeInstruction'],
        ['hasShownBookInstruction', 'hasShownBookInstruction'],
    ]
    for (const [sourceKey, targetKey] of boolFields) {
        if (typeof setting[sourceKey] === 'boolean') {
            ;(<any>store)[targetKey] = setting[sourceKey]
        }
    }

    store.pageTurnAnimationMode = normalizePageTurnAnimationMode(setting.pageTurnAnimationMode)
    if (typeof setting.lang === 'string' && ['cn', 'en', 'jp'].includes(setting.lang)) {
        lang.value = setting.lang
    }
    if (typeof setting.hasShownWelcomeInstruction === 'boolean') {
        store.hasShownWelcomeInstruction = setting.hasShownWelcomeInstruction
    } else {
        store.hasShownWelcomeInstruction = false
    }
    if (typeof setting.hasShownBookInstruction === 'boolean') {
        store.hasShownBookInstruction = setting.hasShownBookInstruction
    } else {
        store.hasShownBookInstruction = false
    }
    if (typeof setting.lastSeenVersionNotice === 'string') {
        store.lastSeenVersionNotice = setting.lastSeenVersionNotice
    } else {
        store.lastSeenVersionNotice = ''
    }
    if (typeof setting.lastRemoteUpdateNoticeAt === 'number' && Number.isFinite(setting.lastRemoteUpdateNoticeAt)) {
        store.lastRemoteUpdateNoticeAt = setting.lastRemoteUpdateNoticeAt
    } else {
        store.lastRemoteUpdateNoticeAt = 0
    }

    const quick = sanitizeQuickSettingSelection(preference.quickSelection, preference.quickOrder)
    store.quickSettingSelected = quick.selected
    store.quickSettingOrder = quick.order
    store.shortcutBindings = normalizeShortcutBindings(preference.shortcuts)
    persistUnifiedSettingsState()
}

function getLayoutModeKey(readingMode: number): ReaderModeLayoutKey {
    return readingMode === 0 ? 'scroll' : 'book'
}

function syncThumbVisualMetrics(sizePx: number) {
    store.thumbItemWidth = Math.max(60, Math.round(sizePx))
    store.thumbImgWidth = Math.max(40, Math.round(store.thumbItemWidth * (100 / 150)))
    store.thumbItemHeight = Math.max(64, Math.round(store.thumbItemWidth * (160 / 150)))
}

function applyCurrentModeLayoutPreference() {
    const key = getLayoutModeKey(store.readingMode)
    const modeLayout = readerLayoutPreference.layouts[key]
    const slot = normalizeDockSlot(modeLayout.thumbSlot)
    store.thumbDockSlot = slot
    const clampedSize = clampThumbSize(slot, modeLayout.thumbSizePx)
    store.thumbViewWidth = clampedSize
    store.thumbViewHeight = clampThumbSize('bottom', modeLayout.thumbSizePx)
    syncThumbVisualMetrics(clampedSize)
}

function persistCurrentModeLayoutPreference() {
    const key = getLayoutModeKey(store.readingMode)
    const slot = normalizeDockSlot(store.thumbDockSlot)
    const size = slot === 'bottom' ? store.thumbViewHeight : store.thumbViewWidth
    readerLayoutPreference.layouts[key] = {
        thumbSlot: slot,
        thumbSizePx: clampThumbSize(slot, size),
        updatedAt: new Date().toISOString(),
    }
    readerLayoutPreference.updatedAt = new Date().toISOString()
    readerLayoutPreference = writeLayoutPreference(readerLayoutPreference)
}

export const computedVisibleQuickSettingIds = computed(() => {
    const selected = new Set(store.quickSettingSelected)
    return store.quickSettingOrder.filter(id => {
        if (!selected.has(id)) {
            return false
        }
        const item = quickSettingOptions.find(option => option.id === id)
        if (!item) {
            return false
        }
        if (item.modeScope === 'both') {
            return true
        }
        if (item.modeScope === 'scroll-only') {
            return store.readingMode === 0
        }
        return store.readingMode === 1
    })
})

// Helper function to get responsive default values based on viewport width
function getResponsiveDefaults() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024
    const isMobile = width < 767
    return {
        showThumbView: !isMobile,
        showBookThumbView: !isMobile,
        pagesPerScreen: isMobile ? 1 : 2,
    }
}

const responsiveDefaults = getResponsiveDefaults()

export const store = reactive({
    // common
    viewportWidth: 0,
    viewportHeight: 0,

    // env variables
    isSupportThumbView: true,

    // top bar
    showTopBar: false,
    showMoreSettings: false,
    showMoreSettingsDialog: false,
    showThumbExpandDialog: false,
    showDownloadConfirmDialog: false,
    showInstructionDialog: false,
    instructionDialogTitle: '',
    instructionDialogMdText: '',
    instructionDialogCompulsive: false,
    instructionDialogOperations: <InstructionDialogOperation[]>[],
    instructionDialogStack: <InstructionDialogEntry[]>[],
    activeSettingsCategory: <SettingsCategory['id']>'general',
    topBarHeight: 40, // px, for calc
    readingMode: 0, // 0: scroll, 1: book
    widthScale: 80, // percent, the scale of img
    loadNum: 3, // the sum of pages per loading
    downloadChunkSize: 200,
    volumeSize: 100, // default 10, the page quantity per volume
    showThumbView: responsiveDefaults.showThumbView,
    bookDirection: 0, // 0: RTL, 1: LTR
    showBookPagination: true, // show/hide bottom floating pagination bar
    isChangeOddEven: false,
    isReverseFlip: false, // reverse the page flipping direction
    isAutoFlip: false,
    autoFlipFrequency: 10, // sec
    showBookThumbView: responsiveDefaults.showBookThumbView,
    IsReverseBookWheeFliplDirection: false,
    wheelSensitivity: 100,
    scrollPageMargin: 70,
    autoRetryByOtherSource: true,
    magnifierZoom: 3,
    magnifierAreaSize: 80,
    hasShownWelcomeInstruction: false,
    hasShownBookInstruction: false,
    lastSeenVersionNotice: '',
    lastRemoteUpdateNoticeAt: 0,
    quickSettingSelected: [...defaultQuickSettingSelected],
    quickSettingOrder: [...defaultQuickSettingOrder],
    shortcutBindings: <ShortcutBindingMap>{
        ...defaultShortcutBindings,
    },
    isFactoryResetDialogVisible: false,
    factoryResetStatus: 'idle',
    factoryResetErrorMessage: '',
    downloadNotifications: <DownloadStatusNotification[]>[],
    downloadTaskMap: <Record<string, DownloadTaskRecord>>{},

    // thumbView
    thumbDockSlot: <DockSlotId>'left',
    thumbViewWidth: 150, // px
    thumbViewHeight: 200, // px
    thumbItemWidth: 150, // px
    thumbItemHeight: 160, // px
    thumbImgWidth: 100, // px
    thumbExpandSegmentIndex: 0,

    // scroll view
    // volumePreloadCount: 2,

    // book view
    pagesPerScreen: responsiveDefaults.pagesPerScreen, // the page quantity per screen
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
    const volLastExclusive = computedVolFirstIndex.value + store.volumeSize
    for (let i = computedVolFirstIndex.value; i < volLastExclusive && i < store.pageCount; i++) {
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
    const showThumb = (store.readingMode == 0 && store.showThumbView) || (store.readingMode == 1 && store.showBookThumbView)
    if (showThumb && store.thumbDockSlot !== 'bottom') {
        return store.viewportWidth - store.thumbViewWidth
    }
    return store.viewportWidth
})

export const computedAlbumViewportHeight = computed(() => {
    const showThumb = (store.readingMode == 0 && store.showThumbView) || (store.readingMode == 1 && store.showBookThumbView)
    let height = store.viewportHeight
    if (store.showTopBar) {
        height -= store.topBarHeight
    }
    if (showThumb && store.thumbDockSlot === 'bottom') {
        height -= store.thumbViewHeight
    }
    return height
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
    downloadChunkSize: {
        list: [50, 100, 150, 200, 300, 500],
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
    magnifierZoom: {
        list: [2, 3, 4, 5],
        suffix: 'x'
    },
    magnifierAreaSize: {
        list: [50, 80, 120, 150],
        suffix: 'px'
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
        storeAction.toggleShowMoreSettingsDialog()
    },
    toggleShowMoreSettingsDialog: () => {
        store.showMoreSettingsDialog = !store.showMoreSettingsDialog
        if (store.showMoreSettingsDialog) {
            store.activeSettingsCategory = 'general'
        }
    },
    openMoreSettingsDialog: () => {
        store.showMoreSettingsDialog = true
        store.activeSettingsCategory = 'general'
    },
    closeMoreSettingsDialog: () => {
        store.showMoreSettingsDialog = false
    },
    openThumbExpandDialog: () => {
        store.thumbExpandSegmentIndex = getThumbExpandSegmentByPage(store.curViewIndex)
        store.showThumbExpandDialog = true
    },
    closeThumbExpandDialog: () => {
        store.showThumbExpandDialog = false
    },
    openDownloadConfirmDialog: () => {
        store.showDownloadConfirmDialog = true
    },
    closeDownloadConfirmDialog: () => {
        store.showDownloadConfirmDialog = false
    },
    openInstructionDialog: (payload: InstructionDialogPayload) => {
        store.instructionDialogStack.push(createInstructionDialogEntry(payload))
        syncInstructionDialogState()
    },
    closeInstructionDialog: (dialogId?: string) => {
        if (dialogId) {
            const index = store.instructionDialogStack.findIndex(dialog => dialog.id === dialogId)
            if (index >= 0) {
                store.instructionDialogStack.splice(index, 1)
            }
        } else {
            store.instructionDialogStack.pop()
        }
        syncInstructionDialogState()
        if (!store.showInstructionDialog) {
            checkInstructions()
        }
    },
    openWelcomeInstructionDialog: () => {
        openWelcomeInstructionDialog(false)
    },
    markWelcomeInstructionShown: () => {
        store.hasShownWelcomeInstruction = true
        persistUnifiedSettingsState()
    },
    markBookInstructionShown: () => {
        store.hasShownBookInstruction = true
        persistUnifiedSettingsState()
    },
    markVersionNoticeSeen: (version: string) => {
        store.lastSeenVersionNotice = version
        persistUnifiedSettingsState()
    },
    markRemoteUpdateNoticeShown: (timestamp: number) => {
        store.lastRemoteUpdateNoticeAt = timestamp
        persistUnifiedSettingsState()
    },
    setThumbExpandSegmentIndex: (segmentIndex: number) => {
        store.thumbExpandSegmentIndex = clampThumbExpandSegmentIndex(segmentIndex, store.pageCount)
    },
    setActiveSettingsCategory: (val: SettingsCategory['id']) => {
        store.activeSettingsCategory = val
    },
    toggleShowTopBar: () => {
        store.showTopBar = !store.showTopBar
    },
    setTopBar: (val: boolean) => {
        store.showTopBar = val
    },
    setReadingMode: (val: number) => {
        store.readingMode = val
        applyCurrentModeLayoutPreference()
        resetAutoFlipTimer()
        checkInstructions()
        persistUnifiedSettingsState()
    },
    setThumbDockSlot: (slot: DockSlotId) => {
        const normalized = normalizeDockSlot(slot)
        const previous = store.thumbDockSlot
        store.thumbDockSlot = normalized
        if (normalized === 'bottom') {
            store.thumbViewHeight = clampThumbSize('bottom', previous === 'bottom' ? store.thumbViewHeight : store.thumbViewWidth)
            syncThumbVisualMetrics(store.thumbViewHeight)
        } else {
            store.thumbViewWidth = clampThumbSize(normalized, previous === 'bottom' ? store.thumbViewHeight : store.thumbViewWidth)
            syncThumbVisualMetrics(store.thumbViewWidth)
        }
        persistCurrentModeLayoutPreference()
    },
    setThumbPanelSize: (val: number) => {
        if (store.thumbDockSlot === 'bottom') {
            store.thumbViewHeight = clampThumbSize('bottom', val)
            syncThumbVisualMetrics(store.thumbViewHeight)
        } else {
            store.thumbViewWidth = clampThumbSize(store.thumbDockSlot, val)
            syncThumbVisualMetrics(store.thumbViewWidth)
        }
        persistCurrentModeLayoutPreference()
    },
    setWidthScale: (val: number) => {
        store.widthScale = val
        persistUnifiedSettingsState()
    },
    setLoadNum: (val: number) => {
        store.loadNum = val
        persistUnifiedSettingsState()
    },
    setDownloadChunkSize: (val: number) => {
        if (!Number.isFinite(val) || val <= 0) {
            store.downloadChunkSize = 200
        } else {
            store.downloadChunkSize = Math.floor(val)
        }
        persistUnifiedSettingsState()
    },
    setVolumeSize: (val: number) => {
        store.volumeSize = val
        persistUnifiedSettingsState()
    },
    toggleShowThumbView: () => {
        store.showThumbView = !store.showThumbView
        persistUnifiedSettingsState()
    },
    setPagesPerScreen: (val: number) => {
        store.pagesPerScreen = val
        persistUnifiedSettingsState()
    },
    setBookDirection: (val: number) => {
        store.bookDirection = val
        persistUnifiedSettingsState()
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
        persistUnifiedSettingsState()
    },
    toggleShowBookPagination: () => {
        store.showBookPagination = !store.showBookPagination
        persistUnifiedSettingsState()
    },
    toggleIsChangeOddEven: () => {
        store.isChangeOddEven = !store.isChangeOddEven
        persistUnifiedSettingsState()
    },
    toggleOddEvenFromPageMenu: () => {
        store.isChangeOddEven = !store.isChangeOddEven
        persistUnifiedSettingsState()
    },
    toggleIsReverseFlip: () => {
        store.isReverseFlip = !store.isReverseFlip
        persistUnifiedSettingsState()
    },
    toggleIsAutoFlip: () => {
        store.isAutoFlip = !store.isAutoFlip
        resetAutoFlipTimer()
        persistUnifiedSettingsState()
    },
    setAutoFlipFrequency: (val: number) => {
        store.autoFlipFrequency = val
        persistUnifiedSettingsState()
    },
    toggleShowBookThumbView: () => {
        store.showBookThumbView = !store.showBookThumbView
        persistUnifiedSettingsState()
    },
    toggleIsReverseBookWheeFliplDirection: () => {
        store.IsReverseBookWheeFliplDirection = !store.IsReverseBookWheeFliplDirection
        persistUnifiedSettingsState()
    },
    setWheelSensitivity: (val: number) => {
        store.wheelSensitivity = val
        persistUnifiedSettingsState()
    },
    setScrollPageMargin: (val: number) => {
        store.scrollPageMargin = val
        persistUnifiedSettingsState()
    },
    setMagnifierZoom: (val: number) => {
        store.magnifierZoom = Math.max(2, Math.min(5, Math.round(val)))
        persistUnifiedSettingsState()
    },
    setMagnifierAreaSize: (val: number) => {
        store.magnifierAreaSize = Math.max(20, Math.min(300, Math.round(val)))
        persistUnifiedSettingsState()
    },
    setLang: (val: string) => {
        lang.value = val
        persistUnifiedSettingsState()
    },
    setAutoRetryByOtherSource: (val: boolean) => {
        store.autoRetryByOtherSource = val
        persistUnifiedSettingsState()
    },
    setShortcutBinding: (id: ShortcutActionId, val: string) => {
        store.shortcutBindings[id] = normalizeShortcutToken(val)
        persistUnifiedSettingsState()
    },
    resetShortcutBindings: () => {
        store.shortcutBindings = {
            ...defaultShortcutBindings,
        }
        persistUnifiedSettingsState()
    },
    isQuickSettingSelected: (id: string) => {
        return store.quickSettingSelected.includes(id)
    },
    toggleQuickSettingSelection: (id: string) => {
        if (id === pinnedQuickSettingId) {
            return
        }
        let index = store.quickSettingSelected.indexOf(id)
        if (index >= 0) {
            store.quickSettingSelected.splice(index, 1)
        } else {
            store.quickSettingSelected.push(id)
        }
        if (!store.quickSettingSelected.includes(pinnedQuickSettingId)) {
            store.quickSettingSelected.unshift(pinnedQuickSettingId)
        }
        persistUnifiedSettingsState()
    },
    moveQuickSettingItem: (id: string, targetIndex: number) => {
        if (id === pinnedQuickSettingId) {
            return
        }
        let from = store.quickSettingOrder.indexOf(id)
        if (from < 0) {
            return
        }
        const withoutPinned = store.quickSettingOrder.filter(item => item !== pinnedQuickSettingId)
        const currentIndex = withoutPinned.indexOf(id)
        if (currentIndex < 0) {
            return
        }
        const boundedTarget = Math.max(0, Math.min(targetIndex, withoutPinned.length - 1))
        if (boundedTarget === currentIndex) {
            return
        }
        withoutPinned.splice(currentIndex, 1)
        withoutPinned.splice(boundedTarget, 0, id)
        store.quickSettingOrder = [pinnedQuickSettingId, ...withoutPinned]
        persistUnifiedSettingsState()
    },
    showFactoryResetDialog: () => {
        store.isFactoryResetDialogVisible = true
        store.factoryResetStatus = 'confirming'
        store.factoryResetErrorMessage = ''
    },
    hideFactoryResetDialog: () => {
        store.isFactoryResetDialogVisible = false
        if (store.factoryResetStatus === 'confirming') {
            store.factoryResetStatus = 'idle'
        }
    },
    runFactoryReset: () => {
        try {
            store.factoryResetStatus = 'running'
            store.factoryResetErrorMessage = ''
            localStorage.clear()
            window.location.reload()
        } catch (e) {
            store.factoryResetStatus = 'failed'
            store.factoryResetErrorMessage = 'Factory reset failed'
        }
    },
    setCurViewIndex: (val: number, updater: string) => {
        const resolveBookTarget = (target: number): number => {
            if (store.readingMode !== 1) {
                return target
            }
            const step = Math.max(1, store.pagesPerScreen)
            const delta = target - store.curViewIndex
            if (Math.abs(delta) !== step) {
                return target
            }
            return getAdjacentBookPageIndex({
                pageCount: store.pageCount,
                pagesPerScreen: store.pagesPerScreen,
                isChangeOddEven: store.isChangeOddEven,
            }, store.curViewIndex, delta > 0 ? 1 : -1)
        }

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
                pendingBookTurn = { val: resolveBookTarget(val), updater }
                return
            }
            isBookTurning = true
            applyCurViewIndex(resolveBookTarget(val), updater)
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

        applyCurViewIndex(resolveBookTarget(val), updater)
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
    getAlbumService: (): AlbumService | null => {
        return runtimeAlbumService
    },
    startDownloadTask: (taskId: string, albumTitle: string, totalPages: number) => {
        const now = new Date().toISOString()
        const terminateAction: DownloadStatusAction = {
            id: `terminate-${taskId}`,
            label: i18n.value.terminate,
            variant: 'danger',
            onClick: () => {
                const runner = downloadRunnerMap[taskId]
                if (runner) {
                    runner.abort(taskId)
                }
            },
        }
        store.downloadTaskMap[taskId] = {
            taskId,
            albumTitle,
            totalPages,
            processedPages: 0,
            failedPages: 0,
            status: 'queued',
            actions: [terminateAction],
            createdAt: now,
            updatedAt: now,
        }
    },
    registerDownloadRunner: (taskId: string, runner: GalleryDownloadService) => {
        downloadRunnerMap[taskId] = runner
    },
    clearDownloadRunner: (taskId: string) => {
        delete downloadRunnerMap[taskId]
    },
    applyDownloadStatusEvent: (taskId: string, albumTitle: string, event: DownloadStatusEvent) => {
        const now = new Date().toISOString()
        if (!store.downloadTaskMap[taskId]) {
            storeAction.startDownloadTask(taskId, albumTitle, event.totalPages)
        }
        const task = store.downloadTaskMap[taskId]
        task.status = event.phase
        task.processedPages = event.processedPages
        task.failedPages = event.failedPages
        task.totalPages = event.totalPages
        task.updatedAt = now

        const notificationId = `download:${taskId}`
        const index = store.downloadNotifications.findIndex(item => item.notificationId === notificationId)
        const payload: DownloadStatusNotification = {
            notificationId,
            taskId,
            title: albumTitle,
            phase: event.phase,
            severity: event.severity,
            message: event.message,
            progressCurrent: event.processedPages,
            progressTotal: event.totalPages,
            actions: ['completed', 'failed', 'partial'].includes(event.phase) ? [] : task.actions,
            createdAt: index >= 0 ? store.downloadNotifications[index].createdAt : now,
            updatedAt: now,
        }
        if (index >= 0) {
            store.downloadNotifications[index] = payload
            return
        }
        store.downloadNotifications.unshift(payload)
    },
    dismissDownloadNotification: (notificationId: string) => {
        const index = store.downloadNotifications.findIndex(item => item.notificationId === notificationId)
        if (index >= 0) {
            store.downloadNotifications.splice(index, 1)
        }
    },
    triggerDownloadNotificationAction: (notificationId: string, actionId: string) => {
        const notification = store.downloadNotifications.find(item => item.notificationId === notificationId)
        if (!notification || !notification.actions) {
            return
        }
        const action = notification.actions.find(item => item.id === actionId)
        if (action && action.onClick) {
            action.onClick(notification)
        }
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
}

let isInited = false
export function init(albumService: AlbumService) {
    if (isInited) {
        return
    }
    store.pageCount = albumService.getPageCount()
    runtimeAlbumService = albumService

    let thumbInfos = albumService.getThumbInfos(false)
    // console.log('[init] thumbInfos:', JSON.parse(JSON.stringify(thumbInfos)))
    store.thumbInfos = JSON.parse(JSON.stringify(thumbInfos))

    let imgPageInfos = albumService.getImgPageInfos()
    // console.log('[init] imgPageInfos:', JSON.parse(JSON.stringify(imgPageInfos)))
    store.imgPageInfos = JSON.parse(JSON.stringify(imgPageInfos))
    
    store.albumTitle = albumService.getTitle()
    store.curViewIndex = albumService.getCurPageIndex()
    store.pageTurnAnimationMode = readPageTurnAnimationMode()
    applyUnifiedSettingsPreference()
    readerLayoutPreference = readLayoutPreference()
    applyCurrentModeLayoutPreference()
    initViewportSizeUpdater()
    initKeyboardListener()
    resetAutoFlipTimer()
    checkInstructions()
    checkVersion()
    isInited = true
}

watch(() => lang.value, () => {
    persistUnifiedSettingsState()
})
