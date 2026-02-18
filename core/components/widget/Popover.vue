<template>
    <Transition name="slide-fade">
        <div ref="popoverRef" class="popover" v-if="active" :style="mergedStyle" @click.stop="">
                <slot></slot>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  active: Boolean,
  customStyle: Object,
  isCloseToRight: Boolean,
})

const emit = defineEmits(['close'])

const popoverRef = ref<HTMLElement | null>(null)
const offsetX = ref(0)
const offsetY = ref(0)

const mergedStyle = computed(() => {
    return {
        ...(props.customStyle || {}),
        transform: `translate(${offsetX.value}px, ${offsetY.value}px)`,
    }
})

function adjustToViewport() {
    const elem = popoverRef.value
    if (!elem) {
        return
    }
    const getBoundaryRect = (): DOMRect => {
        let current: HTMLElement | null = elem.parentElement
        while (current && current !== document.body) {
            const style = window.getComputedStyle(current)
            const hasClipX = style.overflowX !== 'visible'
            const hasClipY = style.overflowY !== 'visible'
            const hasClip = style.overflow !== 'visible' || hasClipX || hasClipY
            if (hasClip) {
                return current.getBoundingClientRect()
            }
            current = current.parentElement
        }
        return new DOMRect(0, 0, window.innerWidth, window.innerHeight)
    }

    const rect = elem.getBoundingClientRect()
    const boundary = getBoundaryRect()
    const gap = 8
    let dx = 0
    let dy = 0
    const maxRight = Math.min(window.innerWidth, boundary.right) - gap
    const minLeft = Math.max(0, boundary.left) + gap
    const maxBottom = Math.min(window.innerHeight, boundary.bottom) - gap
    const minTop = Math.max(0, boundary.top) + gap

    if (rect.right > maxRight) {
        dx = maxRight - rect.right
    }
    if (rect.left + dx < minLeft) {
        dx += minLeft - (rect.left + dx)
    }
    if (rect.bottom > maxBottom) {
        dy = maxBottom - rect.bottom
    }
    if (rect.top + dy < minTop) {
        dy += minTop - (rect.top + dy)
    }
    offsetX.value = dx
    offsetY.value = dy
}

function handleOuterClick(e: Event) {
    if (popoverRef.value && e.target instanceof Node && popoverRef.value.contains(e.target)) {
        return
    }
    emit('close')
}

// user a timer, avoiding call 'close' when 'open'
let timer:any;
watch(() => props.active, async (newVal, oldVal) => {
    if (newVal) {
        offsetX.value = 0
        offsetY.value = 0
        await nextTick()
        adjustToViewport()
        timer = setTimeout(() => {
            document.addEventListener('click', handleOuterClick, true);
        }, 100);
    }
    if (oldVal) {
        document.removeEventListener('click', handleOuterClick, true);
        if (timer) {
            clearTimeout(timer);
        }
    }
})
</script>

<style lang="scss" scoped>
.popover {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border-radius: 2px;
    color: black;
    box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    z-index: 1;
}
</style>
