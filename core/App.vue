<template>
    <div class="ehunter-app normalize">
        <div v-if="isInited" style="display:flex; flex-direction: row;width: 100%;height: 100%;">
            <ReaderView />
            <StatusNotificationStack />
        </div>
        <!-- <LoadingView style="width: 100%; height: 500px;"/>
        <AwesomeScrollView>
            <div>aaa</div>
            <div>aaa</div>
            <div>aaa</div>
            <div>aaa</div>
            <div>aaa</div>
            <div>aaa</div>
            <div>bbb</div>
            <div>bbb</div>
            <div>bbb</div>
            <div>ccc</div>
        </AwesomeScrollView>
        <div style="margin-top: 100px;">
            <CircleIconButton icon-type="close" :rotate="store.rotate" @click="store.rotate = !store.rotate" />
            <CircleIconButton icon-type="expand" :rotate="store.rotate" @click="store.rotate = !store.rotate" />
            <CircleIconButton icon-type="menu" :rotate="store.rotate" @click="store.rotate = !store.rotate" />
            <DropOption :list="settingConf.readingModeList" :cur-val="store.readingMode" :format-cur-val-by-list="true"
                @change="(val) => storeAction.setReadingMode(val)" />
            <FlatButton label="test" @click="lang = 'jp'" />
            <Pagination :page-sum="store.pageSum" :cur-index="store.pageCurIndex" @change="(n) => store.pageCurIndex = n" />
            <NumDropOption 
                    :quick-options="settingConf.widthScale.list"
                    :cur-val="store.widthScale"
                    suffix="%"
                    :min="30"
                    :max="100"
                    :is-float="true"
                    @change="(val) => storeAction.setWidthScale(val)" />
            <SimpleSwitch :active="store.switchActive" @change="val => store.switchActive = val" />
            <NumDropOption 
                    :quick-options="settingConf.loadNum.list"
                    :cur-val="store.loadNum"
                    :suffix="settingConf.loadNum.suffix"
                    :min="1"
                    :max="100"
                    @change="(val) => storeAction.setLoadNum(val)" />
            <SimpleSwitch
                :active="store.showThumbView"
                @change="() => storeAction.toggleShowThumbView()" />
            <NumDropOption 
                :quick-options="settingConf.pagesPerScreen.list"
                :cur-val="store.pagesPerScreen"
                :suffix="settingConf.pagesPerScreen.suffix"
                :min="1"
                :max="10"
                @change="(val) => storeAction.setPagesPerScreen(val)" />
            <DropOption 
                :list="settingConf.bookDirection.list"
                :cur-val="store.bookDirection"
                :format-cur-val-by-list="true"
                :use-abbr-name="true"
                @change="(val) => storeAction.setBookDirection(val)" />
        </div> -->
    </div>
</template>

<script setup lang="ts">
/// <reference types="vite-svg-loader" />
import { store, settingConf, storeAction, init } from './store/app'
import { lang } from './store/i18n'
import CircleIconButton from './components/widget/CircleIconButton.vue'
import DropOption from './components/widget/DropOption.vue'
import FlatButton from './components/widget/FlatButton.vue'
import Pagination from './components/widget/Pagination.vue'
import NumDropOption from './components/widget/NumDropOption.vue'
import SimpleSwitch from './components/widget/SimpleSwitch.vue'
import TopBar from './components/TopBar.vue'
import ThumbScrollView from './components/ThumbScrollView.vue'
import LoadingView from './components/LoadingView.vue'
import AwesomeScrollView from './components/widget/AwesomeScrollView.vue'
import AlbumScrollView from './components/AlbumScrollView.vue'
import AlbumBookView from './components/AlbumBookView.vue'
import ReaderView from './components/ReaderView.vue'
import StatusNotificationStack from './components/status/StatusNotificationStack.vue'
import PageView from './components/PageView.vue'
import { inject, onMounted, ref } from 'vue'
import { NameAlbumService } from './service/AlbumService'
import type { AlbumService } from './service/AlbumService'

const isInited = ref(false)
const albumService = <AlbumService>inject(NameAlbumService)
onMounted(() => {
    init(albumService)
    isInited.value = true
})

</script>

<style lang="scss">
// global common css
@import './style/_responsive';
@import './style/_variables';
@import './style/_markdown';
@import './style/_normalize';

.ehunter-app {
    font-family: PingFang SC, Microsoft YaHei, 微软雅黑, Arial, Hiragino Sans GB, Heiti SC, Droid Sans,
        WenQuanYi Micro Hei, sans-serif !important;
    display: flex;
    height: 100%;
    text-align: initial; // overlay original style

    section,
    header,
    nav {
        display: flex;
    }

    p {
        padding: 0;
        margin: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin: 0;
    }

    .clickable {
        cursor: pointer;
    }

    .no-select {
        user-select: none;
    }

    div {
        display: flex;
    }

    // float tips
    .tips {
        position: relative;
        &:hover {
            &:after {
                content: attr(title-content);
                position: absolute;
                top: -110%;
                left: 50%;
                transform: translate(-50%, 0);
                font-size: 12px;
                white-space: nowrap;
                padding: 4px 6px 5px 6px;
                border-radius: 2px;
                min-width: 50px;
                text-align: center;
                background: rgba(0, 0, 0, 0.8);
                box-shadow: 0 1px 6px rgba(0, 0, 0, 0.117647), 0 1px 4px rgba(0, 0, 0, 0.117647);
                color: white;
            }
        }
        &.tips-down {
            &:hover {
                &:after {
                    top: 130%;
                }
            }
        }
        &.tips-right {
            &:hover {
                &:after {
                    left: -10%;
                    transform: initial;
                }
            }
        }
        &.tips-left {
            &:hover {
                &:after {
                    right: -20%;
                    left: initial;
                    transform: initial;
                }
            }
        }
    }

    // global transition style
    $change_mode_time: 0.8s;
    $fast_change_mode_time: 0.4s;
    $general_animtation_time: 0.2s;

    .slide-fade-enter-active,
    .slide-fade-leave-active {
        transition: all $general_animtation_time ease;
    }

    .slide-fade-enter-from,
    .slide-fade-leave-to {
        transform: translateX(10px);
        opacity: 0;
    }

    .center-horizontal-fade-enter-active,
    .center-horizontal-fade-leave-active {
        transition: all $change_mode_time ease;
    }

    .center-horizontal-fade-enter-from,
    .center-horizontal-fade-leave-to {
        transform: translateX(-40%) !important;
        opacity: 0 !important;
    }

    .slow-horizontal-fade-enter-active,
    .slow-horizontal-fade-leave-active {
        transition: all $change_mode_time ease;
    }

    .slow-horizontal-fade-enter-from,
    .slow-horizontal-fade-leave-to {
        transform: translateX(20%);
        opacity: 0;
    }

    .loading-horizontal-fade-enter-active,
    .loading-horizontal-fade-leave-active {
        transition: all 0.5s ease;
    }

    .loading-horizontal-fade-enter-from,
    .loading-horizontal-fade-leave-to {
        transform: translateX(20%);
        opacity: 0;
    }

    .fast-horizontal-fade-enter-active,
    .fast-horizontal-fade-leave-active {
        transition: all $fast_change_mode_time ease;
    }

    .fast-horizontal-fade-enter-from,
    .fast-horizontal-fade-leave-to {
        transform: translateX(20%);
        opacity: 0;
    }

    .slow-vertical-fade-enter-active,
    .slow-vertical-fade-leave-active {
        transition: all $change_mode_time ease;
    }

    .slow-vertical-fade-enter-from,
    .slow-vertical-fade-leave-to {
        transform: translate(-20%, 20%);
        opacity: 0;
    }

    .slow-opacity-fade-enter-active,
    .slow-opacity-fade-leave-active {
        transition: all 0.3s ease;
    }

    .slow-opacity-fade-enter-from,
    .slow-opacity-fade-leave-to {
        opacity: 0;
    }

    .vertical-list-enter-active,
    .vertical-list-leave-active {
        transition: all 0.5s;
    }

    .vertical-list-enter-from,
    .vertical-list-leave-to {
        opacity: 0;
        transform: translateY(10%);
    }
}
</style>
