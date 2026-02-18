<template>
<div class="reader-view">
    <div class="sidebar">
        <ThumbScrollView />
    </div>
    <div class="main-content">
        <!-- top bar view -->
        <TopBar class="top-bar" @closeEHunter="closeReader"/>
        <!-- panel view -->
        <transition name="slow-horizontal-fade">
            <AlbumScrollView class="content scroll-mode" v-if="store.readingMode === 0" />
        </transition>
        <transition name="slow-vertical-fade">
            <AlbumBookView class="content book-mode" v-if="store.readingMode === 1" />
        </transition>
    </div>
    <div class="status-pannel">
        <div class="progress">{{ `${store.curViewIndex + 1} / ${store.pageCount}` }}</div>
    </div>
</div>
</template>

<script lang="ts" setup>
import AlbumScrollView from './AlbumScrollView.vue';
import ThumbScrollView from './ThumbScrollView.vue';
import TopBar from './TopBar.vue';
import AlbumBookView from './AlbumBookView.vue';
import { i18n } from '../store/i18n'
import { store, storeAction } from '../store/app'

function closeReader() {
    const elem = document.querySelector('.ehunter-container') as HTMLElement | null
    if (elem) {
        elem.style.display = 'none'
    }
}
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

div {
    display: flex;
}

.reader-view {
    position: relative;
    flex-direction: row;
    align-items: center;
    height: 100%;
    width: 100%;
    > .sidebar {
        height: 100%;
    }
    > .main-content {
        height: 100%;
        flex-grow: 1;
        position: relative;
        flex-direction: column;
        // transition: all 0.2s ease;
        > .top-bar {
            position: absolute;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
        }
    }
    > .panel {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        bottom: 2vh;
        right: 2vh;
        z-index: 10000;
        opacity: 0.5;
        transition: all 0.2s ease;
        &:hover {
            opacity: 1;
        }
        > .location {
            color: $reader_view_location_color;
            display: inline-block;
            font-size: 16px;
            line-height: 16px;
            margin-top: 2px;
        }
        .icon-container {
            position: relative;
            display: inline-block;
        }
        > .full-screen {
            cursor: pointer;
            margin-left: 5px;
            > svg {
                fill: $reader_view_full_screen_color;
                width: 26px;
                height: 26px;
            }
        }
    }
    
    > .status-pannel {
        z-index: 10000;
        position: absolute;
        bottom: 0;
        right: 0;
        opacity: 0.5;
        background-color: black;
        padding: 4px 6px;
        > .progress {
            font-size: 12px;
            line-height: 12px;
            color: white
        }
    }
}
</style>
