<template>
    <div ref="asv" :class="['awesome-scroll-view', 'scrollbar', `axis-${axis}`, { isHidden: isHidden }]">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
// awesome scroll view for chrome(-webkit)
import BezierEasing from '../../utils/bezier-easing.js'
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['topIn', 'topLeave'])

const props = withDefaults(defineProps<{
    color?: string,
    isHidden?: boolean,
    offsetInterval?: number,
    onScrollStopped?: (pos: number) => void,
    listenScroll?: boolean,
    axis?: 'x' | 'y',
}>(), {
    color: 'rgba(0,0,0,0.4)',
    isHidden: false,
    offsetInterval: 150,
    onScrollStopped: (pos: number) => { },
    listenScroll: false,
    axis: 'y',
})

const asv = ref<HTMLDivElement | null>(null)

let lastPosition: number
let isScrollingV2 = false
let isAtTop = true
let scrollRAFId = 0

function updateTopState(position: number) {
    const nextIsAtTop = position <= 0
    if (nextIsAtTop === isAtTop) {
        return
    }
    isAtTop = nextIsAtTop
    if (nextIsAtTop) {
        emit('topIn')
        return
    }
    emit('topLeave')
}

function watchPosition() {
    if (!asv.value) {
        return
    }
    const position = props.axis === 'y' ? asv.value.scrollTop : asv.value.scrollLeft
    if (props.axis === 'y') {
        updateTopState(position)
    }
    if (!isScrollingV2 && position === lastPosition) {
        return
    }
    if (!isScrollingV2 && position !== lastPosition) {
        lastPosition = position
        isScrollingV2 = true
        return
    }
    if (isScrollingV2 && position !== lastPosition) {
        lastPosition = position
        return
    }
    isScrollingV2 = false
    props.onScrollStopped(position)
}

let timer: number
onMounted(() => {
    if (props.listenScroll && asv.value) {
        lastPosition = props.axis === 'y' ? asv.value.scrollTop : asv.value.scrollLeft
        if (props.axis === 'y') {
            isAtTop = lastPosition <= 0
            if (isAtTop) {
                emit('topIn')
            }
        }
        timer = window.setInterval(watchPosition, 50)
    }
})

onUnmounted(() => {
    if (scrollRAFId) {
        window.cancelAnimationFrame(scrollRAFId)
        scrollRAFId = 0
    }
    if (timer) {
        clearInterval(timer)
    }
})

function scrollTo(offset: number, duration: number, axis: 'y' | 'x' = 'y') {
    const effectiveAxis = axis || props.axis
    if (!asv.value) {
        return
    }
    if (scrollRAFId) {
        window.cancelAnimationFrame(scrollRAFId)
        scrollRAFId = 0
    }
    if (duration <= 0) {
        if (effectiveAxis === 'y') {
            asv.value.scrollTop = offset
        } else {
            asv.value.scrollLeft = offset
        }
        return
    }
    const startValue = effectiveAxis === 'y' ? asv.value.scrollTop : asv.value.scrollLeft
    const diff = offset - startValue
    if (Math.abs(diff) < 0.5) {
        return
    }
    let start = 0
    const easing = BezierEasing(0.61, 0.29, 0.3, 0.97)
    scrollRAFId = window.requestAnimationFrame(function step(timestamp) {
        if (!asv.value) {
            scrollRAFId = 0
            return
        }
        if (!start) start = timestamp
        const time = timestamp - start
        const percent = Math.min(time / duration, 1)
        const next = startValue + diff * easing(percent)
        if (effectiveAxis === 'y') {
            asv.value.scrollTop = next
        } else {
            asv.value.scrollLeft = next
        }
        if (time < duration) {
            scrollRAFId = window.requestAnimationFrame(step)
            return
        }
        scrollRAFId = 0
    })
}

defineExpose({
    scrollTo
})
</script>

<style lang="scss" scoped>
.awesome-scroll-view {
    position: relative;
    overflow-y: overlay;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;

    &.axis-x {
        overflow-y: hidden;
        overflow-x: overlay;
        flex-direction: row;
    }

    &.scrollbar {
        transition: all 0.3s ease;

        &::-webkit-scrollbar {
            width: 8px;
            height: 8px;
            background: transparent;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 999px;
            border: 2px solid transparent;
            background-clip: padding-box;
            background-color: rgba(255, 255, 255, 0);
            transition: background-color 0.2s ease;
        }

        &:hover::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.46);
        }
    }

    &.axis-y {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0) transparent;
    }

    &.axis-y:hover {
        scrollbar-color: rgba(255, 255, 255, 0.46) transparent;
    }

    &.axis-x {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0) transparent;
    }

    &.axis-x:hover {
        scrollbar-color: rgba(255, 255, 255, 0.46) transparent;
    }
}
</style>
