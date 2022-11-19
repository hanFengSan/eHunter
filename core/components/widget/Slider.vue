<template>
    <div class="slider" @mousedown="handleMouseDown" @click="handleClick" ref="slider">
        <div class="track"></div>
        <div class="fill" :style="{ 'width': fillScale + '%' }"></div>
        <div class="thumb"
            :style="{ 'left': fillScale + '%', 'width': isHolding ? '15px' : undefined, 'height': isHolding ? '15px' : undefined }">
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
    min: number
    max: number
    step: number
    init: number
}>()

const emit = defineEmits(['change'])

const val = ref(props.init)
const isHolding = ref(false)
const oldMouseX = ref(0)
const oldVal = ref(0)
const widthRatio = ref(0)
const slider = ref<HTMLDivElement | null>(null)

const fillScale = computed(() => {
    return (val.value - props.min) / ((props.max - props.min) / 100)
})

watch(() => props.init, (newVal) => {
    val.value = newVal
})

function getWidthRatio() {
    return slider.value!.offsetWidth / (props.max - props.min)
}

function handleClick(e) {
    const x = props.min + e.offsetX / getWidthRatio()
    onChange(x)
}

function getValByStep(x) {
    for (let i = props.min; i <= props.max; i = i + props.step) {
        if (i > x) {
            if (i === props.min) {
                return Number(i.toFixed(0))
            } else {
                return Number((i - props.step).toFixed(0))
            }
        }
    }
    return props.max
}

function onChange(x) {
    if (x > props.max) {
        val.value = getValByStep(props.max)
    } else {
        val.value = getValByStep(x < props.min ? props.min : x)
    }
    emit('change', val.value)
}

function handleMouseUp(e) {
    isHolding.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    e.preventDefault()
}

function handleMouseMove(e) {
    if (isHolding.value) {
        const x = oldVal.value + (e.clientX - oldMouseX.value) / widthRatio.value
        onChange(x)
    }
    e.preventDefault()
}

function handleMouseDown(e) {
    isHolding.value = true
    handleClick(e)
    oldMouseX.value = e.clientX
    oldVal.value = val.value
    widthRatio.value = getWidthRatio()
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
}
</script>

<style lang="scss" scoped>
@import "../../style/_responsive";
@import "../../style/_variables";

div {
    display: flex;
}

.slider {
    position: relative;
    width: 200px;
    height: 20px;
    cursor: pointer;

    >.track {
        position: absolute;
        left: 0;
        height: 2px;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
        background: $slider_track_bg;
    }

    >.fill {
        position: absolute;
        left: 0;
        height: 2px;
        width: 20%;
        top: 50%;
        transform: translateY(-50%);
        background: $slider_track_fill_color;
    }

    >.thumb {
        position: absolute;
        width: 12px;
        height: 12px;
        top: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: $slider_thumb_color;
        pointer-events: none;
        transition: width 0.1s ease, height 0.1s ease;
    }
}
</style>