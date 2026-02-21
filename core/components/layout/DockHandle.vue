<template>
  <button
    type="button"
    class="dock-handle"
    :class="{ armed }"
    :aria-label="ariaLabel"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createGestureActivator, type GestureStartPayload } from '../../utils/layoutGesture'

const props = withDefaults(defineProps<{
    label?: string
    ariaLabel?: string
    longPressMs?: number
}>(), {
    label: 'EHUNTER',
    ariaLabel: 'Dock handle',
    longPressMs: 500,
})

const emit = defineEmits<{
    (e: 'drag-start', payload: GestureStartPayload): void
}>()

const armed = ref(false)

const activator = createGestureActivator({
    longPressMs: props.longPressMs,
    onActivate: (payload) => {
        armed.value = true
        emit('drag-start', payload)
    },
})

function onPointerDown(event: PointerEvent) {
    armed.value = false
    activator.onPointerDown(event)
}

function onPointerMove(event: PointerEvent) {
    activator.onPointerMove(event)
}

function onPointerUp() {
    armed.value = false
    activator.onPointerUp()
}

function onPointerCancel() {
    armed.value = false
    activator.onPointerCancel()
}
</script>

<style lang="scss" scoped>
@import '../../style/_variables';

.dock-handle {
  appearance: none;
  border: 0;
  color: white;
  background: transparent;
  width: 100%;
  height: 100%;
  min-height: 40px;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: grab;
  transition: background-color 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  &.armed {
    background: rgba(0, 0, 0, 0.2);
  }
  &:active {
    cursor: grabbing;
  }
}
</style>
