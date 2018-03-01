<template>
    <nav class="top-bar">
        <div class="float-content">
            <circle-icon-button 
                ref="topBarButton" 
                class="button" 
                icon="menu" 
                :rotate="showTopBar" 
                @click="changeTopBar">
            </circle-icon-button>
            <circle-icon-button class="button" icon="close" @click="closeEHunter"></circle-icon-button>
        </div>
        <div :class="['inner-content', { hide: !showTopBar }]">
            <template v-if="readSettings">
                <div class="item">
                    <span class="label tips tips-down" title-content="设置阅读模式">阅读模式:</span>
                    <drop-option :list="readingModeList" @change="(val) => dropOptionChange('readingMode', val)" :cur-val="readingModeList[readingMode].name"></drop-option>
                </div>
                <div class="item" v-if="readingMode===0">
                    <span class="label tips tips-down" title-content="设置画面比例">画面比例:</span>
                    <drop-option :list="widthList" @change="(val) => dropOptionChange('width', val)" :cur-val="albumWidth + '%'"></drop-option>
                    <pop-slider 
                        :active="showWidthSlider" 
                        :min="30" 
                        :max="100" 
                        :step="1" 
                        :init="albumWidth" 
                        :close="() => closeDropOptionSlider('width')" 
                        @change="(val) => dropOptionSliderChange('width', val)">
                    </pop-slider>
                </div>
                <div class="item">
                    <span class="label tips tips-down" title-content="设置过大将会对网络速度要求较高">加载页数/次:</span>
                    <drop-option :list="loadNumList" @change="(val) => dropOptionChange('loadNum', val)" :cur-val="loadNum + 'P'"></drop-option>
                    <pop-slider 
                        :active="showLoadNumSlider" 
                        :min="1" 
                        :max="100" 
                        :step="1" 
                        :init="loadNum" 
                        :close="() => closeDropOptionSlider('loadNum')" 
                        @change="(val) => dropOptionSliderChange('loadNum', val)">
                    </pop-slider>
                </div>
                <div class="item" v-if="readingMode===0">
                    <span class="label tips tips-down" title-content="设置过大将会对性能要求较高">分卷页数:</span>
                    <drop-option :list="volSizeList" @change="(val) => dropOptionChange('volSize', val)" :cur-val="volumeSize + 'P'"></drop-option>
                    <pop-slider 
                        :active="showVolSizeSlider" 
                        :min="1" 
                        :max="200" 
                        :step="1" 
                        :init="volumeSize" 
                        :close="() => closeDropOptionSlider('volSize')" 
                        @change="(val) => dropOptionSliderChange('volSize', val)">
                    </pop-slider>
                </div>
                <div class="item" v-if="readingMode===0">
                    <span class="label tips tips-down" title-content="开启/关闭左侧缩略图栏">缩略图栏:</span>
                    <div class="bar-switch">
                        <simple-switch :active="showThumbView" @change="changeThumbView"></simple-switch>
                    </div>
                </div>
                <div class="item" v-if="readingMode===1">
                    <span class="label tips tips-down" title-content="开启/关闭换页时的滑动动画">换页动画:</span>
                    <div class="bar-switch">
                        <simple-switch :active="showBookScreenAnimation" @change="changeBookScreenAnimation"></simple-switch>
                    </div>
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
import SettingService from '../service/SettingService.js';
import eHunter from '../main.inject';

export default {
    name: 'TopBar',

    components: { DropOption, PopSlider, SimpleSwitch, CircleIconButton },

    data() {
        return {
            readSettings: false,
            // width
            widthList: [
                { name: '40%', val: 40 },
                { name: '70%', val: 70 },
                { name: '80%', val: 80 },
                { name: '90%', val: 90 },
                { name: '100%', val: 100 },
                { name: '自定义', val: -1 }
            ],
            showWidthSlider: false,
            // loadNum
            loadNumList: [
                { name: '1P', val: 1 },
                { name: '2P', val: 2 },
                { name: '3P', val: 3 },
                { name: '5P', val: 5 },
                { name: '10P', val: 10 },
                { name: '自定义', val: -1 }
            ],
            showLoadNumSlider: false,
            // volSize
            volSizeList: [
                { name: '10P', val: 10 },
                { name: '20P', val: 20 },
                { name: '30P', val: 30 },
                { name: '50P', val: 50 },
                { name: '100P', val: 100 },
                { name: '自定义', val: -1 }
            ],
            showVolSizeSlider: false,
            // readingMode
            readingModeList: [{ name: '卷轴模式', val: 0 }, { name: '书本模式', val: 1 }]
        };
    },

    async created() {
        this.readSettings = true;
    },

    computed: {
        ...mapGetters([
            'showTopBar',
            'albumWidth',
            'loadNum',
            'showThumbView',
            'volumeSize',
            'readingMode',
            'showBookScreenAnimation'
        ])
    },

    methods: {
        ...mapActions(['toggleTopBar']),

        dropOptionChange(tag, index) {
            switch (tag) {
                case 'width':
                    switch (this.widthList[index].val) {
                        case -1:
                            this.showWidthSlider = true;
                            break;
                        default:
                            SettingService.setAlbumWidth(this.widthList[index].val);
                    }
                    break;
                case 'loadNum':
                    switch (this.loadNumList[index].val) {
                        case -1:
                            this.showLoadNumSlider = true;
                            break;
                        default:
                            SettingService.setLoadNum(this.loadNumList[index].val);
                    }
                    break;
                case 'volSize':
                    switch (this.volSizeList[index].val) {
                        case -1:
                            this.showVolSizeSlider = true;
                            break;
                        default:
                            SettingService.setVolumeSize(this.volSizeList[index].val);
                    }
                    break;
                case 'readingMode':
                    SettingService.setReadingMode(this.readingModeList[index].val);
                    break;
            }
        },

        dropOptionSliderChange(tag, val) {
            switch (tag) {
                case 'width':
                    SettingService.setAlbumWidth(val);
                    break;
                case 'loadNum':
                    SettingService.setLoadNum(val);
                    break;
                case 'volSize':
                    SettingService.setVolumeSize(val);
                    break;
            }
        },

        closeDropOptionSlider(tag) {
            switch (tag) {
                case 'width':
                    this.showWidthSlider = false;
                    break;
                case 'loadNum':
                    this.showLoadNumSlider = false;
                    break;
                case 'volSize':
                    this.showVolSizeSlider = false;
                    break;
            }
        },

        changeThumbView(show) {
            SettingService.toggleThumbView(show);
        },

        changeTopBar() {
            this.toggleTopBar(!this.showTopBar);
        },

        closeEHunter() {
            SettingService.toggleEHunter(false);
            eHunter.toggleEHunterView(false);
        },

        changeBookScreenAnimation(show) {
            SettingService.setBookScreenAnimation(show);
        }
    }
};
</script>

<style lang="scss" scoped>
@import '~style/_responsive';
@import '~style/_variables';
div {
    display: flex;
}
.top-bar {
    width: 100%;
    position: relative;
    > .float-content {
        position: absolute;
        top: 0;
        right: 0;
        height: 40px;
        align-items: center;
        z-index: 10;
        > .button {
            margin-right: 13px;
        }
    }

    > .inner-content {
        height: 40px;
        color: white;
        flex-grow: 1;
        background: $accent_color;
        font-size: 14px;
        transition: all 0.4s cubic-bezier(0.62, -0.62, 0.28, 1.55);
        > .item {
            margin-left: 22px;
            position: relative;
            > .label {
                font-size: 14px;
                margin: auto;
                white-space: nowrap;
                cursor: default;
            }
        }
        &.hide {
            transform: translateY(-100%);
        }
    }
}
</style>