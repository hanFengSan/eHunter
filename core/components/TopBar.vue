<template>
    <nav class="top-bar">
        <div class="float-content">
            <transition name="fast-horizontal-fade">
                <CircleIconButton v-if="store.showTopBar" ref="topBarButton" class="button tips tips-left tips-down"
                    icon-type="expand" :title-content="i18n.toggleMoreSettings" :rotate="store.showMoreSettings"
                    @click="storeAction.toggleShowMoreSettings()" />
            </transition>
            <CircleIconButton class="button" icon-type="eject" @click="storeAction.toggleShowQuickAction" size="normal" :rotate="store.showQuickAction"/>
            <CircleIconButton ref="topBarButton" class="button tips tips-left tips-down" icon-type="menu"
                :title-content="i18n.toggleTopBar" :rotate="store.showTopBar" @click="storeAction.toggleShowTopBar()" size="normal"/>
        </div>
        <div class="quick-action-list">
            <QuickActionList></QuickActionList>
        </div>
        <div :class="['inner-content', { hide: !store.showTopBar, 'more-settings': store.showMoreSettings }]">
            <div class="item">
                <span class="label tips tips-down tips-right" :title-content="i18n.readingModeTip">{{ i18n.readingMode }}:</span>
                <DropOption 
                    :list="settingConf.readingModeList"
                    :cur-val="store.readingMode"
                    :format-cur-val-by-list="true"
                    @change="(val) => storeAction.setReadingMode(val)" />
            </div>
            <div class="item" v-if="store.readingMode == 0">
                <span class="label tips tips-down tips-right" :title-content="i18n.widthScaleTip">{{ i18n.widthScale }}:</span>
                <NumDropOption 
                    :quick-options="settingConf.widthScale.list"
                    :cur-val="store.widthScale"
                    :suffix="settingConf.widthScale.suffix"
                    :min="30"
                    :max="100"
                    :is-float="true"
                    @change="(val) => storeAction.setWidthScale(val)" />
            </div>
            <div class="item">
                <span class="label tips tips-down tips-right" :title-content="i18n.loadNumTip">{{ i18n.loadNum }}:</span>
                <NumDropOption 
                    :quick-options="settingConf.loadNum.list"
                    :cur-val="store.loadNum"
                    :suffix="settingConf.loadNum.suffix"
                    :min="1"
                    :max="100"
                    @change="(val) => storeAction.setLoadNum(val)" />
            </div>
            <div class="item" v-if="store.readingMode == 0">
                <span class="label tips tips-down tips-right" :title-content="i18n.volSizeTip">{{ i18n.volSize }}:</span>
                <NumDropOption 
                    :quick-options="settingConf.volumeSize.list"
                    :cur-val="store.volumeSize"
                    :suffix="settingConf.volumeSize.suffix"
                    :min="1"
                    :max="200"
                    @change="(val) => storeAction.setVolumeSize(val)" />
            </div>
            <div class="item" v-if="store.readingMode == 0 && store.isSupportThumbView">
                <span class="label tips tips-down tips-right" :title-content="i18n.thumbViewTip">{{ i18n.thumbView }}:</span>
                <SimpleSwitch
                    :active="store.showThumbView"
                    @change="() => storeAction.toggleShowThumbView()" />
            </div>
            <div class="item" v-if="store.readingMode == 0">
                <span class="label tips tips-down tips-right" :title-content="i18n.pageMarginTip">{{ i18n.pageMargin }}:</span>
                <NumDropOption 
                    :quick-options="settingConf.scrollPageMargin.list"
                    :cur-val="store.scrollPageMargin"
                    :suffix="settingConf.scrollPageMargin.suffix"
                    :min="0"
                    :max="300"
                    @change="(val) => storeAction.setScrollPageMargin(val)" />
            </div>
            <div class="item" v-if="store.readingMode == 1">
                <span class="label tips tips-down tips-right" :title-content="i18n.screenSizeTip">{{ i18n.screenSize }}:</span>
                <NumDropOption 
                    :quick-options="settingConf.pagesPerScreen.list"
                    :cur-val="store.pagesPerScreen"
                    :suffix="settingConf.pagesPerScreen.suffix"
                    :min="1"
                    :max="10"
                    @change="(val) => storeAction.setPagesPerScreen(val)" />
            </div>
            <div class="item" v-if="store.readingMode == 1">
                <span class="label tips tips-down tips-right" :title-content="i18n.bookDirectionTip">{{ i18n.bookDirection }}:</span>
                <DropOption 
                    :list="settingConf.bookDirection.list"
                    :cur-val="store.bookDirection"
                    :format-cur-val-by-list="true"
                    :use-abbr-name="true"
                    @change="(val) => storeAction.setBookDirection(val)" />
            </div>
            <div class="item" v-if="store.readingMode == 1">
                <span class="label tips tips-down tips-right" :title-content="i18n.pageTurnAnimationTip">{{ i18n.pageTurnAnimation }}:</span>
                <DropOption
                    :list="settingConf.pageTurnAnimation.list"
                    :cur-val="store.pageTurnAnimationMode"
                    :format-cur-val-by-list="true"
                    @change="(val) => storeAction.setPageTurnAnimationMode(val)" />
            </div>
            <div class="item" v-if="store.readingMode == 1">
                <span class="label tips tips-down tips-right" :title-content="i18n.paginationTip">{{ i18n.pagination }}:</span>
                <SimpleSwitch
                    :active="store.showBookPagination"
                    @change="() => storeAction.toggleShowBookPagination()" />
            </div>
            <div class="item" v-if="store.readingMode == 1 && store.showMoreSettings">
                <span class="label tips tips-down tips-right" :title-content="i18n.oddEvenTip">{{ i18n.oddEven }}:</span>
                <SimpleSwitch
                    :active="store.isChangeOddEven"
                    @change="() => storeAction.toggleIsChangeOddEven()" />
            </div>
            <div class="item" v-if="store.readingMode == 1 && store.showMoreSettings">
                <span class="label tips tips-down tips-right" :title-content="i18n.reverseFlipTip">{{ i18n.reverseFlip }}:</span>
                <SimpleSwitch
                    :active="store.isReverseFlip"
                    @change="() => storeAction.toggleIsReverseFlip()" />
            </div>
            <div class="item" v-if="store.readingMode == 1 && store.showMoreSettings">
                <span class="label tips tips-down tips-right" :title-content="i18n.autoFlipTip">{{ i18n.autoFlip }}:</span>
                <SimpleSwitch
                    :active="store.isAutoFlip"
                    @change="() => storeAction.toggleIsAutoFlip()" />
            </div>
            <div class="item" v-if="store.readingMode == 1 && store.showMoreSettings">
                <span class="label tips tips-down tips-right" :title-content="i18n.autoFlipFrequencyTip">{{ i18n.autoFlipFrequency }}:</span>
                <NumDropOption 
                    :quick-options="settingConf.autoFlipFrequency.list"
                    :cur-val="store.autoFlipFrequency"
                    :suffix="settingConf.autoFlipFrequency.suffix"
                    :min="1"
                    :max="240"
                    @change="(val) => storeAction.setAutoFlipFrequency(val)" />
            </div>
            <div class="item" v-if="store.readingMode == 1 && store.showMoreSettings">
                <span class="label tips tips-down tips-right" :title-content="i18n.thumbViewTip">{{ i18n.thumbView }}:</span>
                <SimpleSwitch
                    :active="store.showBookThumbView"
                    @change="() => storeAction.toggleShowBookThumbView()" />
            </div>
            <div class="item" v-if="store.readingMode == 1 && store.showMoreSettings">
                <span class="label tips tips-down tips-right" :title-content="i18n.wheelDirectionTip">{{ i18n.wheelDirection }}:</span>
                <SimpleSwitch
                    :active="store.IsReverseBookWheeFliplDirection"
                    @change="() => storeAction.toggleIsReverseBookWheeFliplDirection()" />
            </div>
            <div class="item" v-if="store.readingMode == 1 && store.showMoreSettings">
                <span class="label tips tips-down tips-right" :title-content="i18n.wheelSensitivityTip">{{ i18n.wheelSensitivity }}:</span>
                <NumDropOption 
                    :quick-options="settingConf.wheelSensitivity.list"
                    :cur-val="store.wheelSensitivity"
                    :min="1"
                    :max="250"
                    @change="(val) => storeAction.setWheelSensitivity(val)" />
            </div>
            <div class="item less-margin">
                <span class="label icon tips tips-down" title-content="Change language/切换语言/言語を変更">
                    <GlobeIcon />:
                </span>
                <DropOption
                    :list="settingConf.langList"
                    @change="(val) => storeAction.setLang(val)"
                    :cur-val="i18n.lang"
                    :format-cur-val-by-list="true"
                    :use-abbr-name="true" />
            </div>
            <div class="item icon-margin">
                <a class="label icon tips tips-down clickable" :title-content="i18n.resetTip" @click="emit('resetCache')">
                    <RefreshIcon />
                </a>
            </div>
            <div class="item icon-margin">
                <a class="label icon tips tips-down clickable" :title-content="i18n.infoTip" @click="showInfoDialog">
                    <InfoIcon class="info" />
                </a>
            </div>
            <div class="item">
                <a class="label icon tips tips-down clickable" :title-content="i18n.githubTip" target="_blank" href="https://github.com/hanFengSan/eHunter">
                    <GithubIcon class="github" />
                </a>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
/// <reference types="vite-svg-loader" />
import DropOption from './widget/DropOption.vue'
import NumDropOption from './widget/NumDropOption.vue'
import SimpleSwitch from './widget/SimpleSwitch.vue'
import CircleIconButton from './widget/CircleIconButton.vue'
import { i18n } from '../store/i18n'
import { store, storeAction, settingConf } from '../store/app'
import GlobeIcon from '../assets/svg/globe.svg?component'
import RefreshIcon from '../assets/svg/refresh.svg?component'
import InfoIcon from '../assets/svg/info.svg?component'
import GithubIcon from '../assets/svg/github.svg?component'
import QuickActionList from './QuickActionList.vue'
import { ref, watch, computed, onMounted } from 'vue'

const emit = defineEmits(['closeEHunter', 'resetCache'])

function showInfoDialog() {

}
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

div {
    display: flex;
}

.top-bar {
    width: 100%;
    padding: 0;
    margin: 0;
    background: transparent;
    position: relative;

    >.float-content {
        position: absolute;
        top: 0;
        right: 0;
        align-items: center;
        z-index: 20000;
        height: v-bind('store.topBarHeight+"px"');

        >.button {
            margin-right: 13px;
        }
    }

    >.inner-content {
        color: white;
        flex-grow: 1;
        background: $accent_color;
        font-size: 14px;
        transition: all 0.4s cubic-bezier(0.62, -0.62, 0.28, 1.55);
        height: v-bind('store.showMoreSettings ? store.topBarHeight * 2 + "px" : store.topBarHeight + "px"');

        >.item {
            margin-left: 18px;
            position: relative;
            height: 40px;

            &.less-margin {
                margin-left: 10px;
            }

            &.icon-margin {
                margin-left: 15px;
            }

            >.label {
                display: flex;
                align-items: center;
                font-size: 14px;
                margin: auto;
                white-space: nowrap;
                cursor: default;

                &.icon {
                    >svg {
                        fill: white;
                        height: 18px;
                        width: 18px;

                        &.reset {
                            height: 18px;
                            width: 18px;
                        }

                        &.info {
                            height: 20px;
                            width: 20px;
                        }

                        &.github {
                            height: 17px;
                            height: 17px;
                        }
                    }
                }

                &.clickable {
                    cursor: pointer;
                }
            }
        }

        &.hide {
            transform: translateY(-100%);
        }

        &.more-settings {
            flex-wrap: wrap;
            align-content: flex-start;
            padding-right: 120px;
        }
    }
    .quick-action-list {
        position: absolute;
        top: 24px;
        right: 5px;
        align-items: center;
        z-index: 20000;
    }
}
</style>
