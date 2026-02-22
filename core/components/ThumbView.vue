<template>
    <div ref="root" class="thumb-view">
        <div v-if="thumbInfo" class="thumb-stage" :style="stageStyle">
            <div
                v-if="thumbInfo.mode === ThumbMode.SPIRIT"
                class="thumb-sprite"
                :style="spriteStyle"></div>
            <img v-else class="thumb-image" :src="thumbInfo.src" alt="" draggable="false" />
        </div>
        <div v-else-if="fallbackText" class="thumb-fallback">{{ fallbackText }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ThumbMode, type ThumbInfo } from '../model/model'

const defaultThumbWidth = 100
const defaultThumbHeight = 144

const props = defineProps<{
    thumbInfo: ThumbInfo | null | undefined
    fallbackText?: string
}>()

const root = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const containerHeight = ref(0)
let resizeObserver: ResizeObserver | null = null

const thumbWidth = computed(() => {
    const width = props.thumbInfo?.width || 0
    return width > 0 ? width : defaultThumbWidth
})

const thumbHeight = computed(() => {
    const height = props.thumbInfo?.height || 0
    return height > 0 ? height : defaultThumbHeight
})

const stageScale = computed(() => {
    if (containerWidth.value <= 0 || containerHeight.value <= 0) {
        return 1
    }
    const widthScale = containerWidth.value / thumbWidth.value
    const heightScale = containerHeight.value / thumbHeight.value
    const scale = Math.min(widthScale, heightScale)
    return Number.isFinite(scale) && scale > 0 ? scale : 1
})

const stageStyle = computed(() => {
    return {
        width: `${thumbWidth.value}px`,
        height: `${thumbHeight.value}px`,
        transform: `scale(${stageScale.value})`,
    }
})

const spriteStyle = computed(() => {
    const offset = props.thumbInfo?.offset || 0
    const src = props.thumbInfo?.src || ''
    return {
        background: `transparent url(${src}) -${offset}px 0 no-repeat`,
    }
})

function updateContainerSize() {
    if (!root.value) {
        return
    }
    containerWidth.value = root.value.clientWidth
    containerHeight.value = root.value.clientHeight
}

onMounted(() => {
    updateContainerSize()
    if (!root.value || typeof ResizeObserver === 'undefined') {
        return
    }
    resizeObserver = new ResizeObserver(() => {
        updateContainerSize()
    })
    resizeObserver.observe(root.value)
})

onBeforeUnmount(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }
})
</script>

<style lang="scss" scoped>
.thumb-view {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    > .thumb-stage {
        flex-shrink: 0;
        transform-origin: center center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        > .thumb-sprite,
        > .thumb-image {
            width: 100%;
            height: 100%;
            display: block;
        }

        > .thumb-image {
            object-fit: contain;
        }
    }

    > .thumb-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
}
</style>
