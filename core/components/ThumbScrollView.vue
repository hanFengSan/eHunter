<template>
    <aside class="thumb-content">
        <AwesomeScrollView ref="scrollView" class="thumb-scroll-view">
            <div class="header">
                <span class="app-name">EHUNTER</span>
            </div>
            <div class="indicator"></div>
            <div class="thumb-container" @click="select(computedVolFirstIndex + i)" v-for="(item, i) of volThumbs" :key="item.id" ref="thumbContainers">
                <div class="thumb spirit-mode" v-if="item.mode === 0" :style="{background: `transparent url(${item.src}) -${item.offset}px 0 no-repeat`}"></div>
                <div class="thumb img-mode" v-if="item.mode === 1" :style="{background: `transparent url(${item.src}) no-repeat`, 'background-size': 'contain'}"></div>
                <div class="hover-mask"></div>
                <div class="index">{{ computedVolFirstIndex + i + 1 }}</div>
            </div>
        </AwesomeScrollView>
    </aside>
</template>

<script setup lang="ts">
import { store, storeAction, computedVolFirstIndex } from '../store/app'
import AwesomeScrollView from './widget/AwesomeScrollView.vue'
import { ref, computed, watch } from 'vue'

const thumbItemHeight = ref(160)

const emit = defineEmits(['update_index'])
const updaterName = 'thumb'
const scrollView: any = ref(null)
const thumbContainers: any = ref(null)

const indicatorTop = computed(() => {
    if (store.readingMode == 0) {
        return thumbItemHeight.value * (store.curViewIndex - computedVolFirstIndex.value)
    }
    // book mode
    return thumbItemHeight.value * store.curViewIndex
})

const volThumbs: any = computed(() => {
    if (store.readingMode === 0) {
        return store.thumbInfos.slice(computedVolFirstIndex.value, computedVolFirstIndex.value + store.volumeSize)
    }
    // let book mode compatible with volume, using one volume
    return store.thumbInfos
})

function select(index: number) {
    storeAction.setCurViewIndex(index, updaterName)
}

watch(() => store.curViewIndex, (newVal, oldVal) => {
    // sync pagination
    if (store.curViewIndexUpdater !== updaterName) {
        if (newVal !== computedVolFirstIndex.value && thumbContainers.value) {
            // sort again, because if changing volume size, it may be out-of-order
            let cons = thumbContainers.value.sort((a, b) => a.offsetTop - b.offsetTop);
            let t = newVal - computedVolFirstIndex.value
            if (cons[t]) {
                scrollView.value.scrollTo(cons[t].offsetTop, 1000);
            }
        } else {
            scrollView.value.scrollTo(0, 1000) // if is page 1, scroll to top, cuz of having a header
        }
    }
})
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

$indicator_color: white;
$thumb_scroll_view_bg: #444444;
$header-bg: #2ecc71;

.thumb-content {
    position: relative;
    .thumb-scroll-view {
        position: relative;
        background: $thumb_scroll_view_bg;
        height: 100%;
        display: inline-block;
        width: v-bind('store.thumbItemWidth+"px"');
        > .header {
            position: relative;
            height: 40px;
            background: $header-bg;
            > .app-name {
                color: white;
                font-weight: bolder;
                font-size: 18px;
                display: block;
                position: absolute;
                white-space: nowrap;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .more-vertical-solid.icon {
                display: block;
                margin-top: 18px;
                color: white;
                position: absolute;
                margin-left: 9px;
                width: 2px;
                height: 2px;
                border-radius: 50%;
                border: solid 1px currentColor;
                background-color: currentColor;
                &:before {
                    content: '';
                    position: absolute;
                    left: -1px;
                    top: -8px;
                    width: 2px;
                    height: 2px;
                    border-radius: 50%;
                    border: solid 1px currentColor;
                    background-color: currentColor;
                }
                &:after {
                    content: '';
                    position: absolute;
                    left: -1px;
                    top: 6px;
                    width: 2px;
                    height: 2px;
                    border-radius: 50%;
                    border: solid 1px currentColor;
                    background-color: currentColor;
                }
            }
        }
        .thumb-container {
            position: relative;
            width: 100%;
            padding: 4px 0;
            margin: 0;
            height: v-bind('store.thumbItemHeight+"px"');
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            > .thumb {
                display: block;
                width: v-bind('store.thumbImgWidth+"px"');
                // 1/1.44 is the default scale of ehentai's thumb. 100px width per one thumb in img.
                height: v-bind('store.thumbImgWidth * 144 / 100 + "px"');
                transition: all 0.5s ease;
            }
            > .loc {
                display: block;
                color: rgba(white, 0.5);
                font-size: 12px;
            }
            > .index {
                display: none;
            }
            &:hover {
                > .hover-mask {
                    position: absolute;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    background: rgba($indicator_color, 0.2);
                }
                > .index {
                    position: absolute;
                    display: block;
                    font-weight: bolder;
                    font-size: 40px;
                    color: rgba($body_bg, 0.8);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 20;
                    user-select: none;
                    cursor: default;
                }
            }
        }
        .indicator {
            position: absolute;
            box-sizing: border-box;
            margin-top: $header-height;
            height: v-bind('store.thumbItemHeight+"px"');
            left: 0;
            right: 0;
            background: rgba($indicator_color, 0.3);
            border-left: 3px solid rgba($indicator_color, 0.5);
            border-right: 3px solid rgba($indicator_color, 0.5);
            transition: all 0.5s ease;
            z-index: 10;
            pointer-events: none;
            top: v-bind('indicatorTop+"px"');
        }
    }
}
</style>
