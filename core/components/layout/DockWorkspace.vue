<template>
  <div ref="rootRef" class="dock-workspace" :class="`slot-${thumbSlot}`">
    <div v-if="showThumb && (thumbSlot === 'left' || thumbSlot === 'right')" class="thumb-panel side" :style="thumbStyle">
      <slot name="thumb"></slot>
    </div>

    <SplitHandle
      v-if="showThumb && (thumbSlot === 'left' || thumbSlot === 'right')"
      orientation="vertical"
      :long-press-ms="longPressMs"
      @resize-start="startResize"
      @hover-change="(val) => (isResizeHover = val)"
    />

    <div class="main-panel" :class="{ resizing: isResizeHover || isResizing }">
      <slot name="main"></slot>
    </div>

    <SplitHandle
      v-if="showThumb && thumbSlot === 'bottom'"
      orientation="horizontal"
      :long-press-ms="longPressMs"
      @resize-start="startResize"
      @hover-change="(val) => (isResizeHover = val)"
    />

    <div v-if="showThumb && thumbSlot === 'bottom'" class="thumb-panel bottom" :style="thumbStyle">
      <slot name="thumb"></slot>
    </div>

    <div v-if="isDragging" class="drop-overlay">
      <div class="drop-zone left" :class="{ active: previewSlot === 'left' }">{{ i18n.dockLeft }}</div>
      <div class="drop-zone right" :class="{ active: previewSlot === 'right' }">{{ i18n.dockRight }}</div>
      <div class="drop-zone bottom" :class="{ active: previewSlot === 'bottom' }">{{ i18n.dockBottom }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import SplitHandle from './SplitHandle.vue'
import { i18n } from '../../store/i18n'
import type { DockSlotId } from '../../model/layout'
import type { GestureStartPayload } from '../../utils/layoutGesture'

const props = withDefaults(defineProps<{
    thumbSlot: DockSlotId
    thumbSizePx: number
    showThumb: boolean
    longPressMs?: number
}>(), {
    longPressMs: 500,
})

const emit = defineEmits<{
    (e: 'request-dock', slot: DockSlotId): void
    (e: 'request-resize', size: number): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const isResizeHover = ref(false)
const previewSlot = ref<DockSlotId>('left')

const thumbStyle = computed(() => {
    if (props.thumbSlot === 'bottom') {
        return { height: `${props.thumbSizePx}px` }
    }
    return { width: `${props.thumbSizePx}px` }
})

let dragPointerId = -1
let resizePointerId = -1
let dragStartX = 0
let dragStartY = 0
let hasDragMoved = false
const dragCommitThreshold = 8

function detectPreviewSlot(clientX: number, clientY: number): DockSlotId {
    if (!rootRef.value) {
        return props.thumbSlot
    }
    const rect = rootRef.value.getBoundingClientRect()
    const leftDistance = clientX - rect.left
    const rightDistance = rect.right - clientX
    const bottomDistance = rect.bottom - clientY
    const horizontalThreshold = Math.max(120, rect.width * 0.24)
    const bottomThreshold = Math.max(120, rect.height * 0.24)
    const candidates: Array<{ slot: DockSlotId; score: number }> = []
    if (leftDistance <= horizontalThreshold) {
        candidates.push({ slot: 'left', score: leftDistance / horizontalThreshold })
    }
    if (rightDistance <= horizontalThreshold) {
        candidates.push({ slot: 'right', score: rightDistance / horizontalThreshold })
    }
    if (bottomDistance <= bottomThreshold) {
        candidates.push({ slot: 'bottom', score: bottomDistance / bottomThreshold })
    }
    if (candidates.length > 0) {
        const deltaX = Math.abs(clientX - dragStartX)
        const deltaY = Math.abs(clientY - dragStartY)
        const hasBottom = candidates.some(item => item.slot === 'bottom')
        const hasSide = candidates.some(item => item.slot === 'left' || item.slot === 'right')
        if (hasBottom && hasSide) {
            if (deltaX > deltaY * 1.15) {
                return leftDistance <= rightDistance ? 'left' : 'right'
            }
            if (deltaY > deltaX * 1.15) {
                return 'bottom'
            }
        }
        candidates.sort((a, b) => a.score - b.score)
        return candidates[0].slot
    }
    return props.thumbSlot
}

function startDockDrag(payload: GestureStartPayload) {
    isDragging.value = true
    hasDragMoved = false
    dragStartX = payload.clientX
    dragStartY = payload.clientY
    previewSlot.value = detectPreviewSlot(payload.clientX, payload.clientY)
    const source = payload.sourceEvent as PointerEvent
    dragPointerId = Number.isFinite(source.pointerId) ? source.pointerId : -1
    window.addEventListener('pointermove', onDragMove)
    window.addEventListener('pointerup', onDragEnd)
    window.addEventListener('pointercancel', onDragCancel)
}

function onDragMove(event: PointerEvent) {
    if (!isDragging.value) {
        return
    }
    const movedX = Math.abs(event.clientX - dragStartX)
    const movedY = Math.abs(event.clientY - dragStartY)
    if (movedX >= dragCommitThreshold || movedY >= dragCommitThreshold) {
        hasDragMoved = true
    }
    previewSlot.value = detectPreviewSlot(event.clientX, event.clientY)
}

function cleanupDrag() {
    isDragging.value = false
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', onDragEnd)
    window.removeEventListener('pointercancel', onDragCancel)
    dragPointerId = -1
}

function onDragEnd(event: PointerEvent) {
    if (!isDragging.value) {
        return
    }
    if (!hasDragMoved) {
        cleanupDrag()
        return
    }
    const nextSlot = detectPreviewSlot(event.clientX, event.clientY)
    emit('request-dock', nextSlot)
    cleanupDrag()
}

function onDragCancel() {
    cleanupDrag()
}

function forceStopDrag() {
    cleanupDrag()
}

function startResize(payload: GestureStartPayload) {
    isResizing.value = true
    document.body.style.userSelect = 'none'
    const source = payload.sourceEvent as PointerEvent
    resizePointerId = Number.isFinite(source.pointerId) ? source.pointerId : -1
    window.addEventListener('pointermove', onResizeMove)
    window.addEventListener('pointerup', onResizeEnd)
    window.addEventListener('pointercancel', onResizeEnd)
}

function onResizeMove(event: PointerEvent) {
    if (!isResizing.value || !rootRef.value) {
        return
    }
    const rect = rootRef.value.getBoundingClientRect()
    let next = props.thumbSizePx
    if (props.thumbSlot === 'left') {
        next = event.clientX - rect.left
    } else if (props.thumbSlot === 'right') {
        next = rect.right - event.clientX
    } else {
        next = rect.bottom - event.clientY
    }
    emit('request-resize', next)
}

function onResizeEnd() {
    isResizing.value = false
    document.body.style.userSelect = ''
    resizePointerId = -1
    window.removeEventListener('pointermove', onResizeMove)
    window.removeEventListener('pointerup', onResizeEnd)
    window.removeEventListener('pointercancel', onResizeEnd)
}

function onWindowBlur() {
    forceStopDrag()
    onResizeEnd()
}

window.addEventListener('blur', onWindowBlur)
onUnmounted(() => {
    document.body.style.userSelect = ''
    window.removeEventListener('blur', onWindowBlur)
    forceStopDrag()
    onResizeEnd()
})

defineExpose({
    startDockDrag,
})
</script>

<style lang="scss" scoped>
@import '../../style/_variables';

.dock-workspace {
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
  &.slot-right {
    flex-direction: row-reverse;
  }
  &.slot-bottom {
    flex-direction: column;
  }
}

.thumb-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  &.side {
    height: 100%;
  }
  &.bottom {
    width: 100%;
  }
}

.main-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  &.resizing {
    user-select: none;
  }
}

.drop-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 12000;
  .drop-zone {
    position: absolute;
    border: 1px dashed rgba(255, 255, 255, 0.45);
    background: $dock_overlay_bg;
    color: white;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    align-items: center;
    justify-content: center;
    display: flex;
    transition: all 0.16s ease;
    &.left {
      top: 8px;
      left: 8px;
      bottom: 8px;
      width: 22%;
    }
    &.right {
      top: 8px;
      right: 8px;
      bottom: 8px;
      width: 22%;
    }
    &.bottom {
      left: 8px;
      right: 8px;
      bottom: 8px;
      height: 24%;
    }
    &.active {
      background: $dock_preview_bg;
      border-color: $dock_preview_border;
    }
  }
}
</style>
