<template>
    <div class="book-page-view">
        <PageView
            v-if="index >= 0 && index < store.pageCount"
            :index="index"
            :active="active"
            :active-load="activeLoad"
            @toggle-odd-even="onToggleOddEven"/>
        <div class="page start-page" v-if="index == -1">
            <div :class="['ehunter-tag', { 'left': store.bookDirection === 1 }]">EHUNTER</div>
            <h1>{{ store.albumTitle }}</h1>
        </div>
        <div class="page end-page" v-if="index == store.pageCount">
            <div :class="['ehunter-tag', { 'left': store.bookDirection === 0 }]">EHUNTER</div>
            <h1>END</h1>
        </div>
    </div>
</template>

<script lang="ts" setup>
import PageView from './PageView.vue'
import {store} from '../store/app'
import { storeAction } from '../store/app'
const props = defineProps<{
    index: number,
    active: boolean,
    activeLoad: boolean,
}>()

function onToggleOddEven() {
    storeAction.toggleOddEvenFromPageMenu()
}
</script>

<style lang="scss" scoped>
@import '../style/_variables';

.book-page-view {
    position: relative;
    transition: all 0.3s ease;
    user-select: none;
    width: 100%;
    height: 100%;

    >.page {
        background: $book_view_page_bg;
        flex: 1;
        align-self: stretch;
        overflow: hidden;

        >.ehunter-tag {
            position: absolute;
            right: 8vh;
            bottom: 8vh;
            padding: 1vh 10vh;
            background: $book_view_ehunter_tag_bg;
            color: $book_view_ehunter_tag_text_color;
            font-size: 1.8vh;
            transform-origin: center;
            transform: translate(50%, 50%) rotate(-45deg);

            &.left {
                left: 7vh;
                right: initial;
                transform: translate(-50%, 50%) rotate(45deg);
            }
        }

        &.start-page {
            position: relative;
            justify-content: center;

            >h1 {
                font-size: 4vh;
                font-weight: lighter;
                margin: 40% 20px;
                text-align: left;
                color: $book_view_title_color;
            }
        }

        &.end-page {
            position: relative;
            justify-content: center;
            align-items: center;

            >h1 {
                color: $book_view_end_page_text_color;
                font-size: 6vh;
                padding-bottom: 20%;
            }
        }
    }
}
</style>
