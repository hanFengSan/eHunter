export interface GestureStartPayload {
    clientX: number
    clientY: number
    pointerType: 'mouse' | 'touch' | 'pen'
    sourceEvent: Event
}

interface ActivatorOptions {
    longPressMs: number
    moveTolerance?: number
    onActivate: (payload: GestureStartPayload) => void
}

export function createGestureActivator(options: ActivatorOptions) {
    let timer = 0
    let startX = 0
    let startY = 0
    let active = false
    const moveTolerance = options.moveTolerance ?? 8

    const clearTimer = () => {
        if (timer) {
            window.clearTimeout(timer)
            timer = 0
        }
    }

    const cancel = () => {
        clearTimer()
        active = false
    }

    const activate = (clientX: number, clientY: number, pointerType: 'mouse' | 'touch' | 'pen', sourceEvent: Event) => {
        active = true
        options.onActivate({ clientX, clientY, pointerType, sourceEvent })
    }

    const onPointerDown = (event: PointerEvent) => {
        const pointerType = (event.pointerType as 'mouse' | 'touch' | 'pen') || 'mouse'
        startX = event.clientX
        startY = event.clientY
        if (pointerType === 'mouse') {
            activate(event.clientX, event.clientY, 'mouse', event)
            return
        }
        clearTimer()
        timer = window.setTimeout(() => {
            activate(event.clientX, event.clientY, pointerType, event)
        }, options.longPressMs)
    }

    const onPointerMove = (event: PointerEvent) => {
        if (active || !timer) {
            return
        }
        const moved = Math.abs(event.clientX - startX) > moveTolerance || Math.abs(event.clientY - startY) > moveTolerance
        if (moved) {
            cancel()
        }
    }

    const onPointerEnd = () => {
        if (!active) {
            cancel()
        }
    }

    return {
        onPointerDown,
        onPointerMove,
        onPointerUp: onPointerEnd,
        onPointerCancel: onPointerEnd,
        cancel,
    }
}
