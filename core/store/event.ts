import { store, storeAction } from './app'

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
            storeAction.toggleShowMoreSettings()
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
        storeAction.setCurViewIndex(store.curViewIndex+1, 'timer')
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
    if (store.readingMode == 1) {
        // TODO: show instrcutions
    }
}
