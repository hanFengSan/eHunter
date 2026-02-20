<template>
    <div ref="asv" :class="['awesome-scroll-view', 'scrollbar', { isHidden: isHidden }]">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
// awesome scroll view for chrome(-webkit)
import BezierEasing from '../../utils/bezier-easing.js'
import { ref, watch, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['topIn', 'topLeave'])

const props = withDefaults(defineProps<{
    color?: string,
    isHidden?: boolean,
    offsetInterval?: number,
    onScrollStopped?: (pos: number) => void,
    listenScroll?: boolean,
}>(), {
    color: 'rgba(0,0,0,0.4)',
    isHidden: false,
    offsetInterval: 150,
    onScrollStopped: (pos: number) => { },
    listenScroll: false,
})

// let isTicking = false
// let isScrolling = false
// let scrollTimeout: any = null
// const lastKnownScrollPosition = ref(0)
const asv = ref<HTMLDivElement | null>(null)

// watch(lastKnownScrollPosition, (newVal, oldVal) => {
//     if (newVal === 0) {
//         emit('topIn')
//     } else if (oldVal === 0) {
//         emit('topLeave')
//     }
// })

// function detectScrollStop() {
//     window.clearTimeout(scrollTimeout)
//     scrollTimeout = setTimeout(() => {
//         isScrolling = false
//         props.onScrollStopped(lastKnownScrollPosition.value)
//     }, props.offsetInterval)
// }

// function onScroll() {
//     try {
//         lastKnownScrollPosition.value = asv.value!.scrollTop
//         if (!isTicking) {
//             window.requestAnimationFrame(() => {
//                 detectScrollStop()
//                 isTicking = false
//             });
//         }
//         isTicking = true
//         isScrolling = true
//     } catch (e) {

//     }
// }

let lastPosition;
let lastPositionTime;
let isScrollingV2 = false;
let isAtTop = true

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
    let position = asv.value!.scrollTop
    updateTopState(position)
    let time = new Date().getTime()
    if (!isScrollingV2 && position == lastPosition) {
        // console.log('静止', position)
    } else if (!isScrollingV2 && position != lastPosition) {
        lastPosition = position
        lastPositionTime = time
        isScrollingV2 = true
    } else if(isScrollingV2 && position != lastPosition) {
        lastPosition = position
        lastPositionTime = time
        // console.log('滚动', position)
    } else if (isScrollingV2 && position == lastPosition) {
        isScrollingV2 = false
        // console.log('停止', position)
        props.onScrollStopped(position)
    }
}

let timer;
onMounted(() => {
    if (props.listenScroll) {
        lastPosition = asv.value!.scrollTop
        isAtTop = lastPosition <= 0
        if (isAtTop) {
            emit('topIn')
        }
        lastPositionTime = new Date().getTime()
        timer = setInterval(watchPosition, 50)
    }
})

onUnmounted(() => {
    if (timer) {
        clearInterval(timer)
    }
})


function scrollTo(offsetTop, duration) {
    let startingY = asv.value!.scrollTop
    let diff = offsetTop - startingY
    let start = 0
    const easing = BezierEasing(0.61, 0.29, 0.3, 0.97);
    window.requestAnimationFrame(function step(timestamp) {
        if (!start) start = timestamp
        let time = timestamp - start
        let percent = Math.min(time / duration, 1)
        asv.value!.scrollTop = startingY + diff * easing(percent)
        if (time < duration) {
            window.requestAnimationFrame(step)
        }
    })
}

defineExpose({
    scrollTo
})
</script>

<style lang="scss" scoped>
//  .awesome-scroll-view::-webkit-scrollbar {
//         display: none;
//     }

// .awesome-scroll-view:hover::-webkit-scrollbar {
//     display: initial;
// }

// .awesome-scroll-view.isHidden:hover::-webkit-scrollbar {
//     display: none;
// }
    
.awesome-scroll-view {
    position: relative;
    overflow-y: overlay;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;

    // &::-webkit-scrollbar {
    //     display: initial;
    // }

    // &:hover::-webkit-scrollbar {
    //     display: initial;
    // }

    // &.isHidden:hover::-webkit-scrollbar {
    //     display: none;
    // }

    &.scrollbar {
        transition: all 0.3s ease;

        &::-webkit-scrollbar {
            overflow: visible;
            width: 10px;
        }

        // &::-webkit-scrollbar-track {
        //     background-color: transparent;
        //     border-width: 0;
        // }

        // &::-webkit-scrollbar-thumb {
        //     border-radius: 20px;
        //     background-color: rgba(255, 255, 255, 0.4);
        //     border-style: solid;
        //     border-color: transparent;
        //     border-width: 3px;
        //     background-clip: padding-box;
        // }

        // &::-webkit-scrollbar-button,
        // &::-webkit-scrollbar-track-piece,
        // &::-webkit-scrollbar-corner,
        // &::-webkit-resizer {
        //     display: none;
        // }
    }
}
</style>
