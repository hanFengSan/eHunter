<template>
  <div
    class="split-handle"
    :class="[orientation, { active }]"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @mouseenter="emit('hover-change', true)"
    @mouseleave="emit('hover-change', false)"
  >
    <div class="grip"></div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { createGestureActivator, type GestureStartPayload } from '../../utils/layoutGesture'

const props = withDefaults(defineProps<{
    orientation: 'vertical' | 'horizontal'
    longPressMs?: number
}>(), {
    longPressMs: 500,
})

const emit = defineEmits<{
    (e: 'resize-start', payload: GestureStartPayload): void
    (e: 'hover-change', val: boolean): void
}>()

const active = ref(false)

function resetActiveState() {
    active.value = false
}

const activator = createGestureActivator({
    longPressMs: props.longPressMs,
    onActivate: (payload) => {
        active.value = true
        emit('resize-start', payload)
    },
})

function onPointerDown(event: PointerEvent) {
    active.value = false
    const target = event.currentTarget as HTMLElement | null
    if (target && typeof target.setPointerCapture === 'function') {
        target.setPointerCapture(event.pointerId)
    }
    activator.onPointerDown(event)
}

function onPointerMove(event: PointerEvent) {
    activator.onPointerMove(event)
}

function onPointerUp() {
    resetActiveState()
    activator.onPointerUp()
}

function onPointerCancel() {
    resetActiveState()
    activator.onPointerCancel()
}

window.addEventListener('pointerup', resetActiveState)
window.addEventListener('pointercancel', resetActiveState)
window.addEventListener('blur', resetActiveState)

onUnmounted(() => {
    window.removeEventListener('pointerup', resetActiveState)
    window.removeEventListener('pointercancel', resetActiveState)
    window.removeEventListener('blur', resetActiveState)
})
</script>

<style lang="scss" scoped>
@import '../../style/_variables';

.split-handle {
  position: relative;
  z-index: 13000;
  background: transparent;
  transition: background-color 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  &.vertical {
    width: 0;
  }
  &.horizontal {
    height: 0;
  }
  .grip {
    position: absolute;
    border-radius: 2px;
    background: transparent;
    transition: background-color 0.2s ease;
  }
  &.vertical .grip {
    top: 0;
    bottom: 0;
    left: -5px;
    width: 10px;
    cursor: col-resize;
  }
  &.horizontal .grip {
    left: 0;
    right: 0;
    top: -5px;
    height: 10px;
    cursor: row-resize;
  }
  &.active .grip,
  &:hover .grip {
    background: rgba(46, 204, 113, 0.16);
  }
}
</style>
