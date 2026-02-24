import { onBeforeUnmount, ref } from 'vue'

interface UseTouchLongPressOptions {
    touchLongPressMs: number
    touchMoveTolerance: number
    shouldHandle: () => boolean
    onLongPress: (clientX: number, clientY: number) => void
}

export function useTouchLongPress(options: UseTouchLongPressOptions) {
    const { touchLongPressMs, touchMoveTolerance, shouldHandle, onLongPress } = options

    const touchLongPressTimerId = ref<number | null>(null)
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const touchMoved = ref(false)

    function clearTouchLongPressTimer() {
        if (touchLongPressTimerId.value !== null) {
            window.clearTimeout(touchLongPressTimerId.value)
            touchLongPressTimerId.value = null
        }
    }

    function onTouchStart(e: TouchEvent) {
        if (!shouldHandle()) {
            return
        }
        if (!e.touches || e.touches.length !== 1) {
            clearTouchLongPressTimer()
            return
        }
        const t = e.touches[0]
        touchStartX.value = t.clientX
        touchStartY.value = t.clientY
        touchMoved.value = false
        clearTouchLongPressTimer()
        touchLongPressTimerId.value = window.setTimeout(() => {
            if (!touchMoved.value) {
                onLongPress(t.clientX, t.clientY)
            }
            clearTouchLongPressTimer()
        }, touchLongPressMs)
    }

    function onTouchMove(e: TouchEvent) {
        if (touchLongPressTimerId.value === null || !e.touches || e.touches.length !== 1) {
            return
        }
        const t = e.touches[0]
        const dx = Math.abs(t.clientX - touchStartX.value)
        const dy = Math.abs(t.clientY - touchStartY.value)
        if (dx > touchMoveTolerance || dy > touchMoveTolerance) {
            touchMoved.value = true
            clearTouchLongPressTimer()
        }
    }

    function onTouchEnd() {
        clearTouchLongPressTimer()
    }

    function onTouchCancel() {
        clearTouchLongPressTimer()
    }

    onBeforeUnmount(() => {
        clearTouchLongPressTimer()
    })

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onTouchCancel,
        clearTouchLongPressTimer,
    }
}
