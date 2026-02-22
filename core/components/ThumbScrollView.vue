<template>
    <aside class="thumb-content" :class="{ 'dock-bottom': store.thumbDockSlot === 'bottom' }">
        <AwesomeScrollView
            ref="scrollView"
            class="thumb-scroll-view"
            :class="{ 'dock-bottom': store.thumbDockSlot === 'bottom' }"
            :axis="store.thumbDockSlot === 'bottom' ? 'x' : 'y'">
            <div class="header">
                <DockHandle class="app-name" label="EHUNTER" :aria-label="'EHUNTER Dock Handle'" @drag-start="onDockDragStart" />
            </div>
            <div class="indicator"></div>
            <div class="thumb-container" @click="select(i)" v-for="(item, i) of volThumbs" :key="item.id" ref="thumbContainers">
                <div class="thumb-stage">
                    <ThumbView class="thumb" :thumb-info="item" />
                    <div class="hover-mask"></div>
                    <div class="index">{{ computedVolFirstIndexNum + Number(i) + 1 }}</div>
                </div>
            </div>
        </AwesomeScrollView>
        <button
            type="button"
            class="thumb-expand-trigger"
            :class="{ 'dock-bottom': store.thumbDockSlot === 'bottom' }"
            :aria-label="i18n.expandThumbs"
            @click="onClickExpand">
            <ExpandIcon class="expand-icon" />
        </button>
    </aside>
</template>

<script setup lang="ts">
import { store, storeAction, computedVolFirstIndex } from '../store/app'
import AwesomeScrollView from './widget/AwesomeScrollView.vue'
import DockHandle from './layout/DockHandle.vue'
import type { GestureStartPayload } from '../utils/layoutGesture'
import {
    baseThumbItemHeight,
    computeBottomHeaderFontSizePx,
    computeBottomHeaderLetterSpacingEm,
    computeSideHeaderFontSizePx,
    computeSideHeaderLetterSpacingEm,
    computeThumbContainerScale,
    computeThumbStageBaseWidth,
    thumbBottomItemPaddingX,
    thumbBottomItemPaddingY,
    thumbVerticalItemGap,
    thumbVerticalItemPaddingX,
} from '../model/layout'
import { ref, computed, watch } from 'vue'
import { i18n } from '../store/i18n'
import ExpandIcon from '../assets/svg/expand.svg?component'
import ThumbView from './ThumbView.vue'

const isDockBottom = computed(() => store.thumbDockSlot === 'bottom')
const computedVolFirstIndexNum = computed(() => Number(computedVolFirstIndex.value))
const activeThumbIndex = computed(() => {
    return Math.max(0, store.curViewIndex - computedVolFirstIndexNum.value)
})

const sideHeaderFontSize = computed(() => {
    return `${computeSideHeaderFontSizePx(store.thumbItemWidth)}px`
})
const sideHeaderLetterSpacing = computed(() => {
    return `${computeSideHeaderLetterSpacingEm(store.thumbItemWidth).toFixed(3)}em`
})
const bottomHeaderFontSize = computed(() => {
    return `${computeBottomHeaderFontSizePx(store.thumbViewHeight)}px`
})
const bottomHeaderLetterSpacing = computed(() => {
    return `${computeBottomHeaderLetterSpacingEm(store.thumbViewHeight).toFixed(3)}em`
})

const emit = defineEmits<{
    (e: 'dock-drag-start', payload: GestureStartPayload): void
    (e: 'open-thumb-expand'): void
}>()
const updaterName = 'thumb'
const scrollView = ref<null | { scrollTo: (offset: number, duration: number, axis: 'x' | 'y') => void }>(null)
const thumbContainers = ref<HTMLElement[] | null>(null)

const indicatorOffset = computed(() => {
    if (isDockBottom.value) {
        return thumbContainerWidth.value * activeThumbIndex.value
    }
    return (thumbContainerHeight.value + thumbVerticalItemGap) * activeThumbIndex.value
})

const volThumbs: any = computed(() => {
    return store.thumbInfos.slice(computedVolFirstIndex.value, computedVolFirstIndex.value + store.volumeSize)
})

const thumbContainerScale = computed(() => computeThumbContainerScale(store.thumbDockSlot, store.thumbItemWidth, store.thumbItemHeight))

const thumbStageBaseWidth = computed(() => {
    return computeThumbStageBaseWidth(store.thumbDockSlot)
})

const thumbContainerWidth = computed(() => Math.round(thumbStageBaseWidth.value * thumbContainerScale.value))
const thumbContainerHeight = computed(() => Math.round(baseThumbItemHeight * thumbContainerScale.value))
const indexFontSize = computed(() => {
    const minSide = Math.min(thumbContainerWidth.value, thumbContainerHeight.value)
    return Math.max(14, Math.min(40, Math.round(minSide * 0.4)))
})
const hoverIndexFontSize = computed(() => {
    const minSide = Math.min(thumbContainerWidth.value, thumbContainerHeight.value)
    const hoverSize = Math.max(20, Math.min(60, Math.round(minSide * 0.6)))
    return Math.max(hoverSize, indexFontSize.value + 4)
})

function select(index: number | string) {
    const normalizedIndex = Number(index)
    storeAction.setCurViewIndex(computedVolFirstIndexNum.value + normalizedIndex, updaterName)
}

function onDockDragStart(payload: GestureStartPayload) {
    emit('dock-drag-start', payload)
}

function onClickExpand() {
    emit('open-thumb-expand')
}

function scrollToActiveThumb(targetIndex: number) {
    if (!scrollView.value || !thumbContainers.value || targetIndex < 0) {
        return
    }
    const scrollDuration = store.readingMode === 1 ? 260 : 1000
    if (isDockBottom.value) {
        const sorted = [...thumbContainers.value].sort((a, b) => a.offsetLeft - b.offsetLeft)
        const target = sorted[targetIndex]
        if (target) {
            scrollView.value.scrollTo(target.offsetLeft, scrollDuration, 'x')
            return
        }
        scrollView.value.scrollTo(0, scrollDuration, 'x')
        return
    }
    const sorted = [...thumbContainers.value].sort((a, b) => a.offsetTop - b.offsetTop)
    const target = sorted[targetIndex]
    if (target) {
        scrollView.value.scrollTo(target.offsetTop, scrollDuration, 'y')
        return
    }
    scrollView.value.scrollTo(0, scrollDuration, 'y')
}

watch(() => store.curViewIndex, (newVal) => {
    if (store.curViewIndexUpdater !== updaterName) {
        if (newVal === computedVolFirstIndex.value) {
            scrollToActiveThumb(0)
            return
        }
        scrollToActiveThumb(newVal - computedVolFirstIndex.value)
    }
})
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

.thumb-content {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;

    .thumb-scroll-view {
        position: relative;
        background: $thumb_scroll_view_bg;
        height: 100%;
        flex: 1;
        min-height: 0;
        min-width: 0;
        width: 100%;
        &:not(.dock-bottom) {
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }
            > .header {
                position: relative;
                height: 40px;
                background: $header-bg;
                flex-shrink: 0;
                > .app-name {
                    color: white;
                    font-weight: bolder;
                    font-size: v-bind('sideHeaderFontSize');
                    letter-spacing: v-bind('sideHeaderLetterSpacing');
                    display: block;
                    position: absolute;
                    white-space: nowrap;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
            }
        }
        .thumb-container {
            position: relative;
            width: 100%;
            padding: 3px 0;
            margin: 0;
            height: v-bind('thumbContainerHeight+"px"');
            flex-shrink: 0;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            overflow: hidden;
            transition: all 0.1s ease;

                > .thumb-stage {
                    position: relative;
                    width: v-bind('thumbContainerWidth+"px"');
                    height: v-bind('thumbContainerHeight+"px"');
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;

                    > .thumb {
                        width: 100%;
                        height: 100%;
                        transition: all 0.5s ease;
                    }

                    > .index {
                        position: absolute;
                        display: block;
                        font-weight: bolder;
                        font-size: v-bind('indexFontSize+"px"');
                        color: rgba($body_bg, 0.8);
                        -webkit-text-stroke:1px rgba(white, 0.8);
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 20;
                        user-select: none;
                        cursor: default;
                        transition: all 0.2s ease;
                    }
                }

            &:hover {
                // > .hover-mask {
                //     position: absolute;
                //     top: 0;
                //     right: 0;
                //     left: 0;
                //     bottom: 0;
                //     // background: rgba($indicator_color, 0.2);
                //     background: rgba(black, 0.3);
                //     z-index: 0;
                // }
                background: rgba(black, 0.4);
            //     border-left: 3px solid rgba(white, 0.7);
            // border-right: 3px solid rgba(white, 0.7);
                // .thumb {
                //     background: rgba(black, 0.4);
                // }
                > .thumb-stage > .index {
                    font-size: v-bind('hoverIndexFontSize+"px"');
                    color: $body_bg;
                    -webkit-text-stroke:1px white;
                }
            }
        }

        &:not(.dock-bottom) {
            .thumb-container {
                padding: 3px v-bind('thumbVerticalItemPaddingX + "px"');

                > .thumb-stage {
                    width: 100%;
                }
            }

            .thumb-container + .thumb-container {
                margin-top: v-bind('thumbVerticalItemGap + "px"');
            }
        }

        .indicator {
            position: absolute;
            box-sizing: border-box;
            margin-top: $header-height;
            height: v-bind('thumbContainerHeight+"px"');
            left: 0;
            right: 0;
            // background: rgba($indicator_color, 0.3);
            border-left: 3px solid rgba(white, 0.4);
            border-right: 3px solid rgba(white, 0.4);
            background: rgba(black, 0.4);
            transition: all 0.5s ease;
            // z-index: 10;
            pointer-events: none;
            top: v-bind('indicatorOffset+"px"');
        }
    }

    .thumb-expand-trigger {
        position: absolute;
        left: 50%;
        bottom: 8px;
        transform: translateX(-50%);
        z-index: 25;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.45);
        color: rgba(255, 255, 255, 0.92);
        width: 32px;
        height: 32px;
        cursor: pointer;
        opacity: 0.78;
        transition: all 0.2s ease;

        > .expand-icon {
            width: 16px;
            height: 16px;
            fill: currentColor;
            transform: rotate(0deg);
        }

        &:hover {
            opacity: 1;
            background: rgba(0, 0, 0, 0.65);
        }

        &.dock-bottom {
            right: 8px;
            left: auto;
            top: 50%;
            bottom: auto;
            transform: translateY(-50%);

            > .expand-icon {
                transform: rotate(90deg);
            }
        }
    }

    &.dock-bottom {
        .thumb-scroll-view {
            width: 100%;
            height: 100%;
            flex-direction: row;
            overflow-x: overlay;
            overflow-y: hidden;

            > .header {
                width: $header-height;
                height: 100%;

                > .app-name {
                    writing-mode: vertical-rl;
                    text-orientation: upright;
                    white-space: normal;
                    letter-spacing: v-bind('bottomHeaderLetterSpacing');
                    top: 0;
                    left: 0;
                    transform: none;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: v-bind('bottomHeaderFontSize');
                    line-height: 1;
                }
            }

            .indicator {
                display: block;
                margin-top: 0;
                margin-left: $header-height;
                top: 0;
                left: v-bind('indicatorOffset+"px"');
                width: v-bind('thumbContainerWidth+"px"');
                height: 100%;
                border-left: 0;
                border-right: 0;
                border-top: 3px solid rgba(white, 0.4);
                border-bottom: 3px solid rgba(white, 0.4);
            }

            .thumb-container {
                width: v-bind('thumbContainerWidth+"px"');
                min-width: v-bind('thumbContainerWidth+"px"');
                height: 100%;
                padding: v-bind('thumbBottomItemPaddingY + "px"') v-bind('thumbBottomItemPaddingX + "px"');
                flex-direction: column;

                > .thumb-stage {
                    width: 100%;
                    height: 100%;
                    transform-origin: center center;
                }
            }
        }
    }
}
</style>
