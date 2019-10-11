<template>
    <nav class="top-bar">
        <div class="float-content" :style="floatBtnStyle">
            <transition name="fast-horizontal-fade">
                <circle-icon-button 
                    v-if="showTopBar"
                    ref="topBarButton" 
                    class="button tips tips-left tips-down" 
                    icon="expand"
                    :title-content="string.toggleMoreSettings"
                    :rotate="showMoreSettings"
                    @click="toggleMoreSettings">
                </circle-icon-button>
            </transition>
            <circle-icon-button 
                ref="topBarButton" 
                class="button tips tips-left tips-down" 
                icon="menu" 
                :title-content="string.toggleTopBar"
                :rotate="showTopBar" 
                @click="changeTopBar">
            </circle-icon-button>
            <circle-icon-button class="button tips tips-left tips-down" :title-content="string.closeEHunter" icon="close" @click="closeEHunter"></circle-icon-button>
        </div>
        <div :class="['inner-content', { hide: !showTopBar, 'more-settings': showMoreSettings }]" :style="topBarStyle">
            <template v-if="readSettings">
                <template v-for="item of configuration">
                  <div class="item" v-if="item.show" :key="item.title">
                      <span class="label tips tips-down tips-right" :title-content="item.tip">{{ item.title }}:</span>
                      <drop-option
                        v-if="item.type==='SELECT'||item.type==='SLIDER_SELECT'"
                        :list="item.list"
                        @change="item.select"
                        :cur-val="item.curValTitle">
                      </drop-option>
                      <pop-slider
                          v-if="item.type==='SLIDER_SELECT'"
                          :active="item.slider.active"
                          :min="item.slider.min"
                          :max="item.slider.max"
                          :step="item.slider.step"
                          :init="item.slider.init"
                          :close="item.slider.close"
                          @change="item.slider.change">
                      </pop-slider>
                      <div v-if="item.type==='SWITCH'" class="bar-switch">
                        <simple-switch :active="item.curVal" @change="item.change"></simple-switch>
                      </div>
                  </div>
                </template>
                <div class="item less-margin">
                    <span class="label icon tips tips-down" title-content="Change language/切换语言/言語を変更">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0h24v24H0z" fill="none"/>
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                        </svg>
                    :</span>
                    <drop-option :list="langList" @change="(val) => dropOptionChange('lang', val)" :cur-val="string.lang"></drop-option>
                </div>
                <div class="item icon-margin">
                    <a class="label icon tips tips-down clickable" :title-content="string.resetTip" @click="resetCache">
                        <svg class="reset" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                            <path d="M0 0h24v24H0z" fill="none"/>
                        </svg>
                    </a>
                </div>
                <div class="item icon-margin">
                    <a class="label icon tips tips-down clickable" :title-content="string.infoTip" @click="showInfoDialog">
                        <svg class="info" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                    </a>
                </div>
                <div class="item">
                    <a class="label icon tips tips-down clickable" :title-content="string.githubTip" target="_blank" href="https://github.com/hanFengSan/eHunter">
                        <svg class="github" version="1.1" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                    </a>
                </div>
            </template>
        </div>
    </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DropOption from './widget/DropOption.vue';
import PopSlider from './widget/PopSlider.vue';
import SimpleSwitch from './widget/SimpleSwitch.vue';
import CircleIconButton from './widget/CircleIconButton.vue';
import SettingService from '../service/SettingService.ts';
import * as tags from '../assets/value/tags';
import InfoService from '../service/InfoService.ts';
// import Logger from '../utils/Logger';

export default {
    name: 'TopBar',

    inject: ['config', 'service'],
    
    components: { DropOption, PopSlider, SimpleSwitch, CircleIconButton },

    data() {
        return {
            readSettings: false,
            // language
            langList: [
                { name: 'English', val: tags.LANG_EN },
                { name: '简体中文', val: tags.LANG_CN },
                { name: '日本語', val: tags.LANG_JP }
            ],
            configurationBoard: {},
        };
    },

    async created() {
        this.readSettings = true;
    },

    computed: {
        ...mapGetters([
            'showTopBar',
            'topBarHeight',
            'albumWidth',
            'loadNum',
            'showThumbView',
            'volumeSize',
            'readingMode',
            'showBookScreenAnimation',
            'showBookPagination',
            'bookScreenSize',
            'bookDirection',
            'string',
            'showMoreSettings',
            'reverseFlip',
            'autoFlip',
            'autoFlipFrequency',
            'showThumbViewInBook',
            'wheelSensitivity',
            'wheelDirection'
        ]),
        floatBtnStyle() {
            return { 
                height: this.px(this.topBarHeight)
            };
        },
        topBarStyle() {
            return { 
                height: this.showMoreSettings? this.px(this.topBarHeight * 2) : this.px(this.topBarHeight)
            };
        },
        configuration() {
          const addReactiveVal = (name, val) => {
            if (!this.configurationBoard.hasOwnProperty(name)) {
              this.$set(this.configurationBoard, name, val);
            }
          };
          // select template
          const getSelect = (title, tip, show, curVal, list, change) => {
            const baseConfig = { title, tip, show, type: 'SELECT', list, change};
            const item = baseConfig.list.find(i => i.val === curVal);
            return {
              ...baseConfig,
              curValTitle: item.sname || item.name,
              select: (index) => {
                change(baseConfig.list[index].val);
              }
            }
          }
          // slider + select template
          const getSliderSelect = (id, title, tip, show, curValTitle, list, sliderMin, sliderMax, sliderStep, curVal, change) => {
            const sliderValName = `show${id}Name`;
            addReactiveVal(sliderValName, false);
            const baseConfig = {
              title,
              tip,
              show,
              type: 'SLIDER_SELECT',
              curValTitle,
              list,
              slider: {
                active: this.configurationBoard[sliderValName],
                min: sliderMin,
                max: sliderMax,
                step: sliderStep,
                init: curVal,
                close: () => this.configurationBoard[sliderValName] = false,
                change
              }
            };
            return {
              ...baseConfig,
              select: (index) => {
                const val = baseConfig.list[index].val;
                if (val == -1) {
                  this.configurationBoard[sliderValName] = true;
                } else {
                  change(val);
                }
              }
            }
          }
          // ReadingMode
          const readingModeConfig = getSelect(
            this.string.readingMode,
            this.string.readingModeTip,
            true,
            this.readingMode,
            [{ name: this.string.scrollMode, val: 0 }, { name: this.string.bookMode, val: 1 }],
            (val) => SettingService.setReadingMode(val)
          );
          // loadNum
          const loadNumConfig = getSliderSelect(
            'LoadNum',
            this.string.loadNum,
            this.string.loadNumTip,
            true,
            this.loadNum + 'P',
            [
              { name: '1P', val: 1 },
              { name: '2P', val: 2 },
              { name: '3P', val: 3 },
              { name: '5P', val: 5 },
              { name: '10P', val: 10 },
              { name: '20P', val: 20 },
              { name: '30P', val: 30 },
              { name: '40P', val: 40 },
              { name: '50P', val: 50 },
              { name: '100P', val: 100 },
              { name: this.string.custom, val: -1 }
            ],
            1,
            100,
            1,
            this.loadNum,
            (val) => SettingService.setLoadNum(val)
          );
          // width
          const widthConfig = getSliderSelect(
            'Width',
            this.string.widthScale,
            this.string.widthScaleTip,
            this.readingMode === 0,
            this.albumWidth + '%',
            [
              { name: '40%', val: 40 },
              { name: '50%', val: 50 },
              { name: '55%', val: 55 },
              { name: '60%', val: 60 },
              { name: '65%', val: 65 },
              { name: '70%', val: 70 },
              { name: '75%', val: 75 },
              { name: '80%', val: 80 },
              { name: '85%', val: 85 },
              { name: '90%', val: 90 },
              { name: '95%', val: 95 },
              { name: '100%', val: 100 },
              { name: this.string.custom, val: -1 }
            ],
            30,
            100,
            1,
            this.albumWidth,
            (val) => SettingService.setAlbumWidth(val)
          );
          // volSize
          const volSizeConfig = getSliderSelect(
            'VolSize',
            this.string.volSize,
            this.string.volSizeTip,
            true,
            this.volumeSize + 'P',
            [
              { name: '10P', val: 10 },
              { name: '20P', val: 20 },
              { name: '30P', val: 30 },
              { name: '50P', val: 50 },
              { name: '100P', val: 100 },
              { name: this.string.custom, val: -1 }
            ],
            1,
            200,
            1,
            this.volSize,
            (val) => SettingService.setVolumeSize(val)
          );
          // thumbView
          const thumbViewConfig = {
            title: this.string.thumbView,
            tip: this.string.thumbViewTip,
            show: this.readingMode===0 && this.service.album.supportThumbView(),
            type: 'SWITCH',
            curVal: this.showThumbView,
            change: (val) => SettingService.toggleThumbView(val)
          };
          // screenSize
          const screenSizeConfig = getSliderSelect(
            'ScreenSize',
            this.string.screenSize,
            this.string.screenSizeTip,
            this.readingMode === 1,
            this.bookScreenSize + 'P',
            [
              { name: '1P', val: 1 },
              { name: '2P', val: 2 },
              { name: '3P', val: 3 },
              { name: '4P', val: 4 },
              { name: '5P', val: 5 }
            ],
            1,
            10,
            1,
            this.screenSize,
            (val) => SettingService.setBookScreenSize(val)
          );
          // bookDirection
          const bookDirectionConfig = getSelect(
            this.string.bookDirection,
            this.string.bookDirectionTip,
            this.readingMode === 1,
            this.bookDirection,
            [{ name: this.string.rtl, sname: 'RTL', val: 0 }, { name: this.string.ltr, sname: 'LTR', val: 1 }],
            (val) => SettingService.setBookDirection(val)
          );
          // pagination
          const paginationConfig = {
            title: this.string.pagination,
            tip: this.string.paginationTip,
            show: this.readingMode === 1,
            type: 'SWITCH',
            curVal: this.showBookPagination,
            change: (val) => SettingService.setBookPagination(val)
          };
          // reverseFlip
          const reverseFlipConfig = {
            title: this.string.reverseFlip,
            tip: this.string.reverseFlipTip,
            show: this.readingMode === 1 && this.showMoreSettings,
            type: 'SWITCH',
            curVal: this.reverseFlip,
            change: (val) => SettingService.setReverseFlip(val)
          };
          // autoFlip
          const autoFlipConfig = {
            title: this.string.autoFlip,
            tip: this.string.autoFlipTip,
            show: this.readingMode === 1 && this.showMoreSettings,
            type: 'SWITCH',
            curVal: this.autoFlip,
            change: (val) => this.setAutoFlip(val)
          };
          // autoFlipFrequency
          const autoFlipFrequencyConfig = getSliderSelect(
            'AutoFlipFrequency',
            this.string.autoFlipFrequency,
            this.string.autoFlipFrequencyTip,
            this.readingMode === 1 && this.showMoreSettings,
            this.autoFlipFrequency + 's',
            [
              { name: '3 sec', val: 3 },
              { name: '5 sec', val: 5 },
              { name: '8 sec', val: 8 },
              { name: '10 sec', val: 10 },
              { name: '15 sec', val: 15 },
              { name: '20 sec', val: 20 },
              { name: '30 sec', val: 30 },
              { name: '45 sec', val: 45 },
              { name: '1 min', val: 60 },
              { name: '1 min 30s', val: 90 },
              { name: '2 min', val: 120 },
              { name: '3 min', val: 180 },
              { name: '5 min', val: 300 },
              { name: this.string.custom, val: -1 }
            ],
            1,
            240,
            1,
            this.autoFlipFrequency,
            (val) => SettingService.setAutoFlipFrequency(val)
          );
          // thumbViewInBook
          const thumbViewInBookConfig = {
            title: this.string.thumbView,
            tip: this.string.thumbViewTip,
            show: this.readingMode === 1 && this.showMoreSettings,
            type: 'SWITCH',
            curVal: this.showThumbViewInBook,
            change: (val) => SettingService.setShowThumbViewInBook(val)
          };
          // wheelSensitivity
          const wheelSensitivityConfig = getSliderSelect(
            'WheelSensitivity',
            this.string.wheelSensitivity,
            this.string.wheelSensitivityTip,
            this.readingMode === 1 && this.showMoreSettings,
            this.wheelSensitivity,
            [
              { name: '10', val: 10 },
              { name: '30', val: 30 },
              { name: '50', val: 50 },
              { name: '80', val: 80 },
              { name: '100', val: 100 },
              { name: '120', val: 120 },
              { name: '150', val: 150 },
              { name: '170', val: 170 },
              { name: '200', val: 200 },
              { name: '220', val: 220 },
              { name: '250', val: 250 },
              { name: this.string.custom, val: -1 }
            ],
            1,
            240,
            1,
            this.wheelSensitivity,
            (val) => SettingService.setWheelSensitivity(val)
          );
          // wheelDirection
          const wheelDirectionConfig = {
            title: this.string.wheelDirection,
            tip: this.string.wheelDirectionTip,
            show: this.readingMode === 1 && this.showMoreSettings,
            type: 'SWITCH',
            curVal: this.wheelDirection,
            change: (val) => SettingService.setWheelDirection(val)
          }
          return [
            readingModeConfig,
            widthConfig,
            loadNumConfig,
            volSizeConfig,
            thumbViewConfig,
            screenSizeConfig,
            bookDirectionConfig,
            paginationConfig,
            reverseFlipConfig,
            autoFlipConfig,
            autoFlipFrequencyConfig,
            thumbViewInBookConfig,
            wheelDirectionConfig,
            wheelSensitivityConfig
          ];
        }
    },

    methods: {
        ...mapActions(['toggleTopBar', 'addDialog', 'setAutoFlip']),

        async dropOptionChange(tag, index) {
            switch (tag) {
                case 'lang':
                    await SettingService.setLang(this.langList[index].val);
                    InfoService.showInstruction(this.config);
            }
        },

        changeTopBar() {
            SettingService.setShowTopBar(!this.showTopBar);
        },

        closeEHunter() {
            SettingService.toggleEHunter(false);
            this.service.eHunter.showEHunterView(false);
        },

        showInfoDialog() {
            InfoService.showInstruction(this.config);
        },

        resetCache() {
            localStorage.clear();
            window.location.reload();
        },

        toggleMoreSettings(show) {
            SettingService.setShowMoreSettings(!this.showMoreSettings);
        }
    }
};
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
    > .float-content {
        position: absolute;
        top: 0;
        right: 0;
        align-items: center;
        z-index: 10;
        > .button {
            margin-right: 13px;
        }
    }

    > .inner-content {
        color: white;
        flex-grow: 1;
        background: $accent_color;
        font-size: 14px;
        transition: all 0.4s cubic-bezier(0.62, -0.62, 0.28, 1.55);
        > .item {
            margin-left: 18px;
            position: relative;
            height: 40px;
            &.less-margin {
                margin-left: 10px;
            }
            &.icon-margin {
                margin-left: 15px;
            }
            > .label {
                display: flex;
                align-items: center;
                font-size: 14px;
                margin: auto;
                white-space: nowrap;
                cursor: default;
                &.icon {
                    > svg {
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
}
</style>