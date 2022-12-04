<template>
    <section class="album-book-view" @wheel="handleWheelFlipEvent">
        <TransitionGroup :name="store.flipDirection == 0 ? 'screen-flip' : 'screen-flip-reverse'">
        <div class="book-page-container"
            v-for="i in pageList"
            :key="i.pageIndex"
            v-show="curScreenIndexList.includes(i.pageIndex)"
            :style="pageContainerStyle(i)">
            <PageView
                :index="i.pageIndex"
                :active="true"/>
        </div>
        </TransitionGroup>
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

const curScreenIndexList = computed(() => {
    let indexList: number[] = []
    for (let i = store.curViewIndex; i < store.curViewIndex + store.pagesPerScreen; i++) {
        if (i >= -1 && i < store.pageCount) {
            indexList.push(i)
        }
    }
    return indexList
})

const nextScreenIndexList = computed(() => {
    let indexList: number[] = []
    for (let i = store.curViewIndex + store.pagesPerScreen; i < store.curViewIndex + 2 * store.pagesPerScreen; i++) {
        if (i >= -1 && i < store.pageCount) {
            indexList.push(i)
        }
    }
    return indexList
})

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
        let pageIndex = screen[i]
        let height = width * storeAction.getImgPageHeightOfWidth(pageIndex)
        result.push({
            pageIndex: pageIndex,
            height: height,
            width: width,
            top: computedAlbumViewportHeight.value / 2 - height / 2,
            right: getPagePositionRight(width, i),
        })
    }
    return result
}

const pageList = computed(() => {
    return [...calcScreenPageSize(curScreenIndexList.value), ...calcScreenPageSize(nextScreenIndexList.value)]
})

</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

div {
    display: flex;
}

.album-book-view {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%;
    // transition: all 0.5s ease;
    
    > .book-page-container {
        position: absolute;
        // transition: all 0.5s ease-in-out;
        box-sizing: border-box;
        // box-shadow: 1px 1px 5px 5px rgba(0, 0, 0, 0.1);
        box-shadow: 0px 19px 10px -8px rgba(0,0,0,0.35);
    -webkit-box-shadow: 0px 19px 10px -8px rgba(0,0,0,0.35);
    -moz-box-shadow: 0px 19px 10px -8px rgba(0,0,0,0.35);
    }
}

// transition styles
.screen-flip-enter-active,
.screen-flip-leave-active {
  transition: all .6s ease;
}
.screen-flip-enter-from {
}

.screen-flip-leave-to {
  transform: translateY(-100vh);
}

.screen-flip-reverse-enter-active,
.screen-flip-reverse-leave-active {
  transition: all .6s ease;
}
.screen-flip-reverse-enter-from {
    transform: translateY(-100vh);
}

.screen-flip-reverse-leave-to {
  opacity: 0;
}

</style>