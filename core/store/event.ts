import { store, storeAction } from './app'
import { i18n, lang } from './i18n'
import config from '../../src/config'
import { getWelcomeInstructionText, getBookInstructionText } from '../assets/instructions'
import { getVersionNotesText } from '../assets/versionNotes'
import { TextReq } from '../../src/platform/base/request/TextReq'
import pkgJson from '../../package.json'

interface UpdateDialogOperation {
    name: string
    url: string
}

interface UpdateMessage {
    title: string
    version: string
    text: string
    operations: UpdateDialogOperation[]
    time: number
    duration: number
}

function getEhunterElem() : HTMLDivElement|null {
    return document.querySelector('.ehunter-container')
}

let resizeTimeoutId: number = 0
function updateViewportSize() {
    let elem = getEhunterElem()
    if (elem) {
        storeAction.setViewportWidth(elem.offsetWidth)
        storeAction.setViewportHeight(elem.offsetHeight)
    }
}

export function initViewportSizeUpdater() {
    updateViewportSize()
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimeoutId)
        resizeTimeoutId = window.setTimeout(() => {
            updateViewportSize()
        }, 50)
    });
}

function handleKeyboardEvent(e: any) {
    const keyboardUpdater = 'keyboard'
    if (e.metaKey || e.ctrlKey) {
        return
    }
    switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'a':
            if (store.readingMode == 0) {
                storeAction.setCurViewIndex(store.curViewIndex - 1, keyboardUpdater)
            } else if (store.readingMode == 1) {
                storeAction.setCurViewIndex(store.curViewIndex - store.pagesPerScreen, keyboardUpdater)
            }
            break
        case 'ArrowRight':
        case 'ArrowDown':
        case 'd':
            if (store.readingMode == 0) {
                storeAction.setCurViewIndex(store.curViewIndex + 1, keyboardUpdater)
            } else if (store.readingMode == 1 && store.curViewIndex + store.pagesPerScreen < store.pageCount) {
                storeAction.setCurViewIndex(store.curViewIndex + store.pagesPerScreen, keyboardUpdater)
            }
            break
        case 'Shift':
            storeAction.toggleShowMoreSettingsDialog()
            break
        case 'Escape':
            storeAction.toggleShowTopBar()
            break
    }
}

export function initKeyboardListener() {
    document.addEventListener('keydown', handleKeyboardEvent)
}


let autoFlipTimerID: number = 0
function handleAutoFlipEvent() {
    if (store.curViewIndex < store.pageCount - 1) {
        let step = store.readingMode == 1 ? store.pagesPerScreen : 1
        storeAction.setCurViewIndex(store.curViewIndex + step, 'autoflip')
    }
}

export function resetAutoFlipTimer() {
    if (autoFlipTimerID) {
        window.clearTimeout(autoFlipTimerID)
    }
    if (store.readingMode == 1 && store.isAutoFlip && store.autoFlipFrequency > 0) {
        autoFlipTimerID = window.setTimeout(handleAutoFlipEvent, store.autoFlipFrequency * 1000)
    }
}

let wheelDelta = 0
let wheelDeltaTimer = 0
export function handleWheelFlipEvent(e: any) {
    if (typeof e.deltaY === 'undefined') {
        e.deltaY = e.wheelDeltaY;
    }
    if (e.metaKey || e.ctrlKey || e.deltaY === 0) {
        return;
    }
    wheelDelta += e.deltaY
    if (wheelDeltaTimer > 0) {
        window.clearTimeout(wheelDeltaTimer)
    }
    wheelDeltaTimer = window.setTimeout(() => {
        wheelDelta = 0
    }, 100)
    if (Math.abs(wheelDelta) < store.wheelSensitivity) {
        return
    }
    // action
    let isToNext = false
    if ((wheelDelta > 0 && !store.IsReverseBookWheeFliplDirection) || wheelDelta < 0 && store.IsReverseBookWheeFliplDirection) {
        isToNext = true
    }
    if (isToNext && store.curViewIndex + store.pagesPerScreen < store.pageCount) {
        storeAction.setCurViewIndex(store.curViewIndex + store.pagesPerScreen, 'wheel')
    }
    if (!isToNext) {
        storeAction.setCurViewIndex(store.curViewIndex - store.pagesPerScreen, 'wheel')
    }
    wheelDelta = 0
    window.clearTimeout(wheelDeltaTimer)
}

export function checkInstructions() {
    if (store.showInstructionDialog) {
        return
    }
    if (!store.hasShownWelcomeInstruction) {
        let uaLang = navigator.language.toLowerCase()
        if (uaLang.startsWith('zh')) {
            storeAction.setLang('cn')
        } else if (uaLang.startsWith('ja') || uaLang.includes('jp')) {
            storeAction.setLang('jp')
        } else {
            storeAction.setLang('en')
        }
        storeAction.markWelcomeInstructionShown()
        openWelcomeInstructionDialog(true)
        return
    }
    if (store.readingMode == 1 && !store.hasShownBookInstruction) {
        storeAction.markBookInstructionShown()
        storeAction.openInstructionDialog({
            title: i18n.value.instructions,
            mdText: getBookInstructionText(lang.value),
            isCompulsive: true,
        })
    }
}

export function openWelcomeInstructionDialog(isCompulsive = false) {
    storeAction.openInstructionDialog({
        title: i18n.value.instructionsAndAbouts,
        mdText: getWelcomeInstructionText(lang.value, config.homePage),
        isCompulsive,
    })
}

function normalizeUpdateMessage(data: any): UpdateMessage | null {
    if (!data || typeof data !== 'object') {
        return null
    }
    const langKey = lang.value === 'cn' || lang.value === 'jp' ? lang.value : 'en'
    const localized = data[langKey]
    if (!localized || typeof localized !== 'object') {
        return null
    }
    const operations = Array.isArray(localized.operations)
        ? localized.operations
            .filter((item: any) => item && typeof item.name === 'string' && typeof item.url === 'string')
            .map((item: any) => ({ name: item.name, url: item.url }))
        : []
    return {
        title: typeof localized.title === 'string' ? localized.title : '',
        version: typeof localized.version === 'string' ? localized.version : '',
        text: typeof localized.text === 'string' ? localized.text : '',
        operations,
        time: Number(localized.time) || 0,
        duration: Number(localized.duration) || 0,
    }
}

async function fetchRemoteUpdateMessage(): Promise<UpdateMessage | null> {
    const requestList = [config.updateServer1, config.updateServer2]
        .filter(url => typeof url === 'string' && url.length > 0)
        .map(url => new TextReq(url, true, true).setCredentials('omit').request())
    if (requestList.length === 0) {
        return null
    }
    try {
        const rawText = await Promise.race(requestList)
        const parsed = JSON.parse(rawText)
        return normalizeUpdateMessage(parsed)
    } catch (e) {
        return null
    }
}

function checkNewVersionNotice() {
    const appVersion = pkgJson.version
    if (store.lastSeenVersionNotice === appVersion) {
        return
    }
    storeAction.openInstructionDialog({
        title: `${i18n.value.versionUpdate} v${appVersion}`,
        mdText: getVersionNotesText(lang.value),
        isCompulsive: true,
        operations: [{
            name: i18n.value.confirm,
            btnType: 'plain',
            isCloseModal: true,
            onClick: () => storeAction.markVersionNoticeSeen(appVersion),
        }],
    })
}

async function checkRemoteUpdateNotice() {
    const message = await fetchRemoteUpdateMessage()
    if (!message) {
        return
    }
    const appVersion = pkgJson.version
    const now = Date.now()
    const isNewVersion = message.version !== appVersion
    const isReleaseTime = now > message.time
    const isOverDuration = (now - store.lastRemoteUpdateNoticeAt) > message.duration
    if (!isNewVersion || !isReleaseTime || !isOverDuration) {
        return
    }
    storeAction.markRemoteUpdateNoticeShown(now)
    const operations = [{
        name: i18n.value.later,
        btnType: 'plain',
        isCloseModal: true,
    }, ...message.operations.map(item => ({
        name: item.name,
        btnType: 'plain',
        isCloseModal: true,
        onClick: () => window.open(item.url, '_blank'),
    }))]
    storeAction.openInstructionDialog({
        title: message.title,
        mdText: message.text,
        isCompulsive: true,
        operations,
    })
}

let hasStartedVersionCheck = false
export function checkVersion() {
    if (hasStartedVersionCheck) {
        return
    }
    hasStartedVersionCheck = true
    window.setTimeout(async () => {
        await checkRemoteUpdateNotice()
        checkNewVersionNotice()
    }, 5000)
}
