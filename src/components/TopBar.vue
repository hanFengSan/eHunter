<template>
    <div>
        <div class="container">
            <div class="float-content">
                <circle-icon-button 
                    ref="topBarButton" 
                    class="button" 
                    icon="menu" 
                    :rotate="true" 
                    :init-rotation="true" 
                    @click="changeTopBar">
                </circle-icon-button>
                <circle-icon-button class="button" icon="close" :rotate="true" @click="closeEHunter"></circle-icon-button>
            </div>
            <div :class="['inner-content', { hide: !showTopBar }]">
                <template v-if="readSettings">
                    <div class="item">
                        <span class="label">画面比例:</span>
                        <drop-option :list="widthList" :change="(val) => dropOptionChange('width', val)" :cur-val="width + '%'"></drop-option>
                        <pop-slider 
                            :active="showWidthSlider" 
                            :min="30" 
                            :max="100" 
                            :step="1" 
                            :init="width" 
                            :close="() => closeDropOptionSlider('width')" 
                            :change="(val) => dropOptionSliderChange('width', val)">
                        </pop-slider>
                    </div>
                    <div class="item">
                        <span class="label">加载页数/次:</span>
                        <drop-option :list="loadNumList" :change="(val) => dropOptionChange('loadNum', val)" :cur-val="loadNum"></drop-option>
                        <pop-slider 
                            :active="showLoadNumSlider" 
                            :min="1" 
                            :max="100" 
                            :step="1" 
                            :init="loadNum" 
                            :close="() => closeDropOptionSlider('loadNum')" 
                            :change="(val) => dropOptionSliderChange('loadNum', val)">
                        </pop-slider>
                    </div>
                    <div class="item">
                        <span class="label">缩略图栏:</span>
                        <div class="bar-switch">
                            <simple-switch :init="showThumbView" :change="changeThumbView"></simple-switch>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
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
            width: 0,
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
            loadNum: 0,
            loadNumList: [
                { name: '1', val: 1 },
                { name: '2', val: 2 },
                { name: '3', val: 3 },
                { name: '5', val: 5 },
                { name: '10', val: 10 },
                { name: '自定义', val: -1 }
            ],
            showLoadNumSlider: false,
            showThumbView: true
        };
    },

    async created() {
        this.width = await SettingService.getAlbumWidth();
        this.loadNum = await SettingService.getLoadNum();
        this.showThumbView = await SettingService.getThumbViewStatus();
        this.readSettings = true;
    },

    computed: {
        ...mapGetters({ showTopBar: 'showTopBar' })
    },

    watch: {
        // sync rotating status of topBarButton
        showTopBar(newVal, oldVal) {
            this.$refs.topBarButton.changeRotation(newVal);
        }
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
                            this.width = this.widthList[index].val;
                            SettingService.setAlbumWidth(this.width);
                    }
                    break;
                case 'loadNum':
                    switch (this.loadNumList[index].val) {
                        case -1:
                            this.showLoadNumSlider = true;
                            break;
                        default:
                            this.loadNum = this.loadNumList[index].val;
                            SettingService.setLoadNum(this.loadNum);
                    }
                    break;
            }
        },

        dropOptionSliderChange(tag, val) {
            switch (tag) {
                case 'width':
                    this.width = val;
                    SettingService.setAlbumWidth(this.width);
                    break;
                case 'loadNum':
                    this.loadNum = val;
                    SettingService.setLoadNum(this.loadNum);
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
            }
        },

        changeThumbView(show) {
            this.showThumbView = show;
            SettingService.toggleThumbView(show);
        },

        changeTopBar() {
            this.toggleTopBar(!this.showTopBar);
        },

        closeEHunter() {
            SettingService.toggleEHunter(false);
            eHunter.toggleEHunterView(false);
        }
    }
};
</script>

<style lang="scss" scoped>
@import "~style/_responsive";
@import "~style/_variables";
div {
  display: flex;
}
.container {
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
    transition: all 0.4s cubic-bezier(.62,-0.62,.28,1.55);
    > .item {
      margin-left: 22px;
      position: relative;
      > .label {
          font-size: 14px;
          margin: auto;
      }
    }
    &.hide {
        transform: translateY(-100%);
    }
  }
}
</style>