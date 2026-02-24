import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue'
import Logger from '../../utils/logger'

function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val))
}

interface UseMagnifierOptions {
    pageViewRef: Ref<HTMLElement | null>
    imgRef: Ref<HTMLImageElement | null>
    magnifierCanvasRef: Ref<HTMLCanvasElement | null>
    imgSrc: ComputedRef<string>
    isDesktopPointer: ComputedRef<boolean>
    magnifierZoom: ComputedRef<number>
    magnifierAreaSize: ComputedRef<number>
    pendingRevealDelayMs: number
    lensGap: number
    onSyncEnabled?: (enabled: boolean) => void
}

export function useMagnifier(options: UseMagnifierOptions) {
    const {
        pageViewRef,
        imgRef,
        magnifierCanvasRef,
        imgSrc,
        isDesktopPointer,
        magnifierZoom,
        magnifierAreaSize,
        pendingRevealDelayMs,
        lensGap,
        onSyncEnabled,
    } = options

    const magnifierEnabled = ref(false)
    const pointerX = ref(0)
    const pointerY = ref(0)
    const hasPointerInView = ref(false)
    const lensSide = ref<'left' | 'right'>('right')
    const lensX = ref(0)
    const lensY = ref(0)
    const lensWarmState = ref<'pending' | 'ready'>('pending')
    const magnifierReady = ref(false)
    const showPendingIndicator = ref(false)
    const pendingRevealTimerId = ref<number | null>(null)
    const magnifierWarmToken = ref(0)

    const focusBoxSize = computed(() => magnifierAreaSize.value)
    const lensSize = computed(() => magnifierAreaSize.value * magnifierZoom.value)

    const showFocusIndicator = computed(() => {
        return isDesktopPointer.value && magnifierEnabled.value && hasPointerInView.value && lensWarmState.value === 'ready'
    })

    const showMagnifierLens = computed(() => {
        return isDesktopPointer.value && magnifierEnabled.value && hasPointerInView.value
    })

    const showMagnifierPending = computed(() => {
        return showMagnifierLens.value && lensWarmState.value === 'pending' && showPendingIndicator.value
    })

    function getPageRect() {
        return pageViewRef.value?.getBoundingClientRect() || null
    }

    const focusIndicatorStyle = computed(() => {
        const rect = getPageRect()
        if (!rect) {
            return {}
        }
        const half = focusBoxSize.value / 2
        const x = clamp(pointerX.value - rect.left - half, 0, rect.width - focusBoxSize.value)
        const y = clamp(pointerY.value - rect.top - half, 0, rect.height - focusBoxSize.value)
        return {
            width: `${focusBoxSize.value}px`,
            height: `${focusBoxSize.value}px`,
            transform: `translate(${x}px, ${y}px)`,
        }
    })

    const magnifierLensStyle = computed(() => {
        const rect = getPageRect()
        if (!rect) {
            return {}
        }
        return {
            width: `${lensSize.value}px`,
            height: `${lensSize.value}px`,
            transform: `translate(${lensX.value}px, ${lensY.value}px)`,
        }
    })

    function clearPendingRevealTimer() {
        if (pendingRevealTimerId.value !== null) {
            window.clearTimeout(pendingRevealTimerId.value)
            pendingRevealTimerId.value = null
        }
    }

    function waitForImageLoad(imgEl: HTMLImageElement) {
        if (imgEl.complete && imgEl.naturalWidth > 0) {
            return Promise.resolve()
        }
        return new Promise<void>((resolve, reject) => {
            const onLoad = () => {
                cleanup()
                resolve()
            }
            const onError = () => {
                cleanup()
                reject(new Error('IMG_LOAD_FAILED'))
            }
            const cleanup = () => {
                imgEl.removeEventListener('load', onLoad)
                imgEl.removeEventListener('error', onError)
            }
            imgEl.addEventListener('load', onLoad, { once: true })
            imgEl.addEventListener('error', onError, { once: true })
        })
    }

    async function warmMagnifierSource(expectedSrc: string) {
        const warmToken = ++magnifierWarmToken.value
        magnifierReady.value = false
        lensWarmState.value = 'pending'
        await nextTick()
        const imgEl = imgRef.value
        if (!imgEl || imgSrc.value !== expectedSrc) {
            return
        }
        try {
            await waitForImageLoad(imgEl)
            if (typeof imgEl.decode === 'function') {
                try {
                    await imgEl.decode()
                } catch (decodeError) {
                    Logger.logText('MAGNIFIER', `image decode failed: ${String(decodeError)}`)
                }
            }
            if (warmToken !== magnifierWarmToken.value || imgSrc.value !== expectedSrc) {
                return
            }
            magnifierReady.value = true
            lensWarmState.value = 'ready'
            if (showMagnifierLens.value) {
                renderMagnifierCanvas()
            }
        } catch (warmError) {
            Logger.logText('MAGNIFIER', `warm magnifier source failed: ${String(warmError)}`)
            if (warmToken !== magnifierWarmToken.value) {
                return
            }
            magnifierReady.value = false
            lensWarmState.value = 'pending'
        }
    }

    function renderMagnifierCanvas() {
        const canvas = magnifierCanvasRef.value
        const imgEl = imgRef.value
        const rect = getPageRect()
        if (!canvas || !imgEl || !rect || !magnifierReady.value) {
            return
        }
        const zoom = magnifierZoom.value
        const areaSize = magnifierAreaSize.value
        const outputSize = areaSize * zoom
        const dpr = window.devicePixelRatio || 1
        const targetWidth = Math.max(1, Math.round(outputSize * dpr))
        const targetHeight = Math.max(1, Math.round(outputSize * dpr))
        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth
            canvas.height = targetHeight
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            return
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, outputSize, outputSize)
        ctx.imageSmoothingEnabled = true

        const localX = clamp(pointerX.value - rect.left, 0, rect.width)
        const localY = clamp(pointerY.value - rect.top, 0, rect.height)
        const sourceWidthCss = Math.min(areaSize, rect.width)
        const sourceHeightCss = Math.min(areaSize, rect.height)
        const sourceLeftCss = clamp(localX - sourceWidthCss / 2, 0, Math.max(0, rect.width - sourceWidthCss))
        const sourceTopCss = clamp(localY - sourceHeightCss / 2, 0, Math.max(0, rect.height - sourceHeightCss))

        const scaleX = imgEl.naturalWidth / Math.max(1, rect.width)
        const scaleY = imgEl.naturalHeight / Math.max(1, rect.height)
        const sourceX = sourceLeftCss * scaleX
        const sourceY = sourceTopCss * scaleY
        const sourceWidth = sourceWidthCss * scaleX
        const sourceHeight = sourceHeightCss * scaleY

        ctx.drawImage(imgEl, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputSize, outputSize)
    }

    function updateLensPosition() {
        const rect = getPageRect()
        if (!rect) {
            return
        }
        const localPointerX = clamp(pointerX.value - rect.left, 0, rect.width)
        const localPointerY = clamp(pointerY.value - rect.top, 0, rect.height)
        const focusHalf = focusBoxSize.value / 2
        const rightCandidate = localPointerX + focusHalf + lensGap
        const leftCandidate = localPointerX - focusHalf - lensGap - lensSize.value
        const rightOverflowViewport = rect.left + rightCandidate + lensSize.value > window.innerWidth - 8
        const leftOverflowViewport = rect.left + leftCandidate < 8

        if (rightOverflowViewport && !leftOverflowViewport) {
            lensSide.value = 'left'
        } else {
            lensSide.value = 'right'
        }

        lensX.value = lensSide.value === 'right' ? rightCandidate : leftCandidate
        lensY.value = localPointerY - lensSize.value / 2
        if (lensWarmState.value === 'ready') {
            renderMagnifierCanvas()
        }
    }

    function hideMagnifierPointerArtifacts() {
        hasPointerInView.value = false
    }

    function onMouseMove(e: MouseEvent) {
        if (!isDesktopPointer.value || !magnifierEnabled.value) {
            return
        }
        pointerX.value = e.clientX
        pointerY.value = e.clientY
        hasPointerInView.value = true
        updateLensPosition()
    }

    function onMouseLeave() {
        hideMagnifierPointerArtifacts()
    }

    function applyEnabled(enabled: boolean) {
        magnifierEnabled.value = enabled
        onSyncEnabled?.(enabled)
        if (enabled && imgSrc.value && lensWarmState.value !== 'ready') {
            void warmMagnifierSource(imgSrc.value)
        }
        if (!enabled) {
            hideMagnifierPointerArtifacts()
        }
    }

    function onMagnifierToggleSync(e: CustomEvent<{ enabled?: boolean }>) {
        applyEnabled(!!e.detail?.enabled)
    }

    function broadcastEnabled(enabled: boolean) {
        document.dispatchEvent(new CustomEvent('ehunter:magnifier-toggle', {
            detail: { enabled },
        }))
    }

    function toggleMagnifier() {
        const nextEnabled = !magnifierEnabled.value
        broadcastEnabled(nextEnabled)
        applyEnabled(nextEnabled)
    }

    function setEnabledFromSession(enabled: boolean) {
        applyEnabled(enabled)
    }

    watch([showMagnifierLens, lensWarmState], ([showLens, warmState]) => {
        clearPendingRevealTimer()
        showPendingIndicator.value = false
        if (showLens && warmState === 'pending') {
            pendingRevealTimerId.value = window.setTimeout(() => {
                if (showMagnifierLens.value && lensWarmState.value === 'pending') {
                    showPendingIndicator.value = true
                }
            }, pendingRevealDelayMs)
        }
    })

    watch([magnifierZoom, magnifierAreaSize, showMagnifierLens], () => {
        if (showMagnifierLens.value && lensWarmState.value === 'ready') {
            renderMagnifierCanvas()
        }
    })

    watch(imgSrc, (newSrc, oldSrc) => {
        if (newSrc === oldSrc) {
            return
        }
        magnifierReady.value = false
        lensWarmState.value = 'pending'
        if (!newSrc) {
            return
        }
        void warmMagnifierSource(newSrc)
    })

    onMounted(() => {
        document.addEventListener('ehunter:magnifier-toggle', onMagnifierToggleSync as EventListener)
    })

    onBeforeUnmount(() => {
        clearPendingRevealTimer()
        document.removeEventListener('ehunter:magnifier-toggle', onMagnifierToggleSync as EventListener)
    })

    return {
        magnifierEnabled,
        lensWarmState,
        showFocusIndicator,
        showMagnifierLens,
        showMagnifierPending,
        focusIndicatorStyle,
        magnifierLensStyle,
        warmMagnifierSource,
        updateLensPosition,
        hideMagnifierPointerArtifacts,
        onMouseMove,
        onMouseLeave,
        toggleMagnifier,
        setEnabledFromSession,
    }
}
