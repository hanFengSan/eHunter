<template>
    <section :class="['album-book-view', `mode-${store.pageTurnAnimationMode}`]" @wheel="handleWheelFlipEvent" @click="onClickBg">
        <Transition
            v-for="spread in cachedBookSpreadList"
            :key="spread.startIndex"
            :name="bookTransitionName">
        <div
            v-show="spread.startIndex === store.curViewIndex"
            class="book-spread"
            :style="spreadStyle(spread.startIndex)">
            <div class="book-page-container"
                v-for="i in spread.pageList"
                :key="`${spread.startIndex}-${i.pageIndex}`"
                :style="pageContainerStyle(i)">
                <PageView
                    :index="i.pageIndex"
                    :active="true"/>
            </div>
        </div>
        </Transition>
        <div class="action-panel">
            <div class="next"></div>
            <div class="setting"></div>
            <div class="pre"></div>
        </div>
    </section>
</template>

<script lang="ts" setup>
import PageView from './PageView.vue'
import type { StyleValue } from 'vue'
import { computed } from 'vue'
import { store, storeAction, computedAlbumViewportRatio, computedAlbumViewportHeight, computedAlbumViewportWidth } from '../store/app'
import { handleWheelFlipEvent } from '../store/event'

interface BookPageDisplayParam {
    pageIndex: number,
    height: number,
    width: number,
    top: number,
    right: number,
}

function pageContainerStyle(page: BookPageDisplayParam): StyleValue {
    return {
        width: page.width + 'px',
        height: page.height + 'px',
        top: page.top + 'px',
        right: page.right + 'px',
        zIndex: store.pageCount - page.pageIndex,
    }
}

function spreadStyle(startIndex: number): StyleValue {
    return {
        zIndex: startIndex === store.curViewIndex ? 2 : 1,
        pointerEvents: startIndex === store.curViewIndex ? 'auto' : 'none',
    }
}

function getScreenIndexList(startIndex: number): number[] {
    let indexList: number[] = []
    for (let i = startIndex; i < startIndex + store.pagesPerScreen; i++) {
        if (i >= -1 && i < store.pageCount) {
            indexList.push(i)
        }
    }
    return indexList
}

function getPagePositionRight(pageWidth: number, pageScreenIndex: number): number {
    let rightPadding = (computedAlbumViewportWidth.value - pageWidth * store.pagesPerScreen) / 2
    let nums = pageScreenIndex
    if (store.bookDirection == 1) {
        nums = store.pagesPerScreen - nums - 1
    }
    return rightPadding + nums * pageWidth
}

function calcScreenPageSize(screen: number[]): BookPageDisplayParam[] {
    let result: BookPageDisplayParam[] = []
    if (screen.length === 0) {
        return result
    }
    // calculate page size per screen
    let maxPageRatio = screen.reduce((max, index) => {
        let val = storeAction.getImgPageHeightOfWidth(index)
        if (val > max) {
            return val
        }
        return max
    }, 0)
    let pagesRatio = maxPageRatio / screen.length // assume all the widths of each page are 1
    let width = 0
    if (pagesRatio >= computedAlbumViewportRatio.value) {
        width = computedAlbumViewportHeight.value / maxPageRatio
    } else {
        width = computedAlbumViewportWidth.value / screen.length
    }
    for (let i = 0; i < screen.length; i++) {
        let pageIndex = <number>screen[i]
        let height = width * storeAction.getImgPageHeightOfWidth(pageIndex)
        let top = computedAlbumViewportHeight.value / 2 - height / 2
        if (store.showTopBar) {
            top += store.topBarHeight
        }
            result.push({
                pageIndex: pageIndex,
            height: height,
            width: width,
            top: top,
            right: getPagePositionRight(width, i),
        })
    }
    return result
}

const cachedBookSpreadList = computed(() => {
    const step = Math.max(1, store.pagesPerScreen)
    const preloadSpreadNum = Math.max(1, Math.ceil(store.loadNum / step))
    const minStart = Math.max(0, store.curViewIndex - preloadSpreadNum * step)
    const maxStart = Math.min(
        Math.max(store.pageCount - 1, 0),
        store.curViewIndex + preloadSpreadNum * step,
    )

    const result: Array<{
        startIndex: number,
        pageList: BookPageDisplayParam[],
    }> = []
    for (let startIndex = minStart; startIndex <= maxStart; startIndex += step) {
        result.push({
            startIndex,
            pageList: calcScreenPageSize(getScreenIndexList(startIndex)),
        })
    }
    if (!result.some(item => item.startIndex === store.curViewIndex)) {
        result.push({
            startIndex: store.curViewIndex,
            pageList: calcScreenPageSize(getScreenIndexList(store.curViewIndex)),
        })
    }
    return result
})

const bookTransitionName = computed(() => {
    if (store.pageTurnAnimationMode === 'none') {
        return 'screen-none'
    }
    if (store.pageTurnAnimationMode === 'slide') {
        return store.flipDirection == 0 ? 'screen-slide-next' : 'screen-slide-prev'
    }
    return store.flipDirection == 0 ? 'screen-flip' : 'screen-flip-reverse'
})

function onClickBg(e: any) {
    console.log(e)
    let y = e.clientY
    switch(true) {
        case y >= 0 && y < store.viewportHeight * 0.3:
            storeAction.setCurViewIndex(store.curViewIndex - store.pagesPerScreen, 'click')
            break
        case y >= store.viewportHeight * 0.3 && y <= store.viewportHeight * 0.7:
            console.log('setting')
            break
        case y >= store.viewportHeight * 0.7 && y <= store.viewportHeight:
            storeAction.setCurViewIndex(store.curViewIndex + store.pagesPerScreen, 'click')
            break
    }
}

</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

.album-book-view {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%;
    // transition: all 0.5s ease;
    
    > .book-spread {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;

        > .book-page-container {
            user-select: none;
            position: absolute;
            box-sizing: border-box;
            box-shadow: 0px 19px 10px -8px rgba(0,0,0,0.35);
        }
    }

    > .book-page-container {
        user-select: none;
        position: absolute;
        // transition: all 0.5s ease-in-out;
        box-sizing: border-box;
        box-shadow: 0px 19px 10px -8px rgba(0,0,0,0.35);
    }

    &.mode-realistic {
        perspective: 1800px;
        perspective-origin: 50% 50%;

        > .book-spread {
            backface-visibility: hidden;
            will-change: transform, opacity;
            overflow: visible;
            --curl-before-opacity: 0;
            --curl-after-opacity: 0;
            --curl-before-transform: translateX(0) scaleX(1);
            --curl-after-transform: translateX(0) scaleX(1);

            &::before,
            &::after {
                content: '';
                position: absolute;
                inset: -2% -1%;
                pointer-events: none;
                opacity: var(--curl-before-opacity);
                transition: opacity .42s ease, transform .42s cubic-bezier(0.22, 0.61, 0.36, 1);
            }

            // page curl highlight
            &::before {
                background: radial-gradient(
                    120% 85% at 52% 50%,
                    rgba(255, 255, 255, 0.32) 0%,
                    rgba(255, 255, 255, 0.12) 26%,
                    rgba(255, 255, 255, 0.02) 62%,
                    rgba(255, 255, 255, 0) 100%
                );
                mix-blend-mode: screen;
            }

            // inner fold shadow near spine
            &::after {
                background: linear-gradient(
                    90deg,
                    rgba(0, 0, 0, 0.34) 0%,
                    rgba(0, 0, 0, 0.16) 14%,
                    rgba(0, 0, 0, 0.06) 30%,
                    rgba(0, 0, 0, 0) 55%
                );
                opacity: var(--curl-after-opacity);
                transform: var(--curl-after-transform);
            }

            &::before {
                transform: var(--curl-before-transform);
            }

            > .book-page-container {
                overflow: hidden;

                &::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background: linear-gradient(
                        90deg,
                        rgba(0, 0, 0, 0.16) 0%,
                        rgba(0, 0, 0, 0.04) 18%,
                        rgba(255, 255, 255, 0) 60%
                    );
                    opacity: 0.35;
                }
            }
        }
    }

    &.mode-slide {
        > .book-spread {
            will-change: transform, opacity;
            backface-visibility: hidden;
            box-shadow: 0 16px 26px -14px rgba(0, 0, 0, 0.38);
        }
    }
}

.action-panel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10000;
    opacity: 0.5;
    display: none;
    background-color: black;
    pointer-events: none;

    .next {
        position: absolute;
        left: 0;
        right: 0;
        height: 30%;
        bottom: 0;
        background-color: red;
        pointer-events: none;

    }
    .pre {
        position: absolute;
        left: 0;
        right: 0;
        height: 30%;
        top: 0;
        background-color: green;
        pointer-events: none;

    }
    .setting {
        position: absolute;
        left: 0;
        right: 0;
        height: 40%;
        top: 50%;
        transform: translateY(-50%);
        background-color: purple;
        pointer-events: none;
    }
}

// transition styles
.screen-flip-enter-active,
.screen-flip-leave-active {
  transition: transform .46s cubic-bezier(0.22, 0.61, 0.36, 1), opacity .46s ease;
}
.screen-flip-enter-from {
    transform-origin: right center;
    transform: translate3d(10%, 0, 0) rotateY(66deg) rotateX(3.2deg) skewY(-2.4deg) scale(0.95, 0.98);
    opacity: 0.64;
    --curl-before-opacity: 0.62;
    --curl-after-opacity: 0.72;
    --curl-before-transform: translateX(-3.2%) scaleX(0.9);
    --curl-after-transform: translateX(-2.2%) scaleX(1.12);
}

.screen-flip-leave-to {
  transform-origin: left center;
  transform: translate3d(-16%, 0, 0) rotateY(-80deg) rotateX(-2.8deg) skewY(2.6deg) scale(0.91, 0.97);
  opacity: 0;
    --curl-before-opacity: 0.78;
    --curl-after-opacity: 0.82;
    --curl-before-transform: translateX(5.2%) scaleX(1.16);
    --curl-after-transform: translateX(3.8%) scaleX(1.24);
}

.screen-flip-reverse-enter-active,
.screen-flip-reverse-leave-active {
  transition: transform .46s cubic-bezier(0.22, 0.61, 0.36, 1), opacity .46s ease;
}
.screen-flip-reverse-enter-from {
    transform-origin: left center;
    transform: translate3d(-10%, 0, 0) rotateY(-66deg) rotateX(-3.2deg) skewY(2.4deg) scale(0.95, 0.98);
    opacity: 0.64;
    --curl-before-opacity: 0.62;
    --curl-after-opacity: 0.72;
    --curl-before-transform: translateX(3.2%) scaleX(-0.9);
    --curl-after-transform: translateX(2.2%) scaleX(-1.12);
}

.screen-flip-reverse-leave-to {
  transform-origin: right center;
  transform: translate3d(16%, 0, 0) rotateY(80deg) rotateX(2.8deg) skewY(-2.6deg) scale(0.91, 0.97);
  opacity: 0;
    --curl-before-opacity: 0.78;
    --curl-after-opacity: 0.82;
    --curl-before-transform: translateX(-5.2%) scaleX(-1.16);
    --curl-after-transform: translateX(-3.8%) scaleX(-1.24);
}

.screen-slide-next-enter-active,
.screen-slide-next-leave-active,
.screen-slide-prev-enter-active,
.screen-slide-prev-leave-active {
    transition: transform .44s cubic-bezier(0.22, 0.74, 0.2, 1), opacity .44s ease;
}

.screen-slide-next-enter-from {
    transform: translate3d(0, 102%, 0);
    opacity: 0.95;
}

.screen-slide-next-leave-to {
    transform: translate3d(0, -102%, 0);
    opacity: 0;
}

.screen-slide-prev-enter-from {
    transform: translate3d(0, -102%, 0);
    opacity: 0.95;
}

.screen-slide-prev-leave-to {
    transform: translate3d(0, 102%, 0);
    opacity: 0;
}

.screen-none-enter-active,
.screen-none-leave-active {
    transition-duration: 0s;
}

.screen-none-enter-from,
.screen-none-leave-to {
    opacity: 1;
    transform: none;
}

</style>
