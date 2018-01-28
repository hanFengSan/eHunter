<template>
    <div>
        <div class="container">
            <div class="float-content">
                <circle-icon-button class="button" icon="menu" :rotate="true" :init-rotation="true" @click="changeTopBar"></circle-icon-button>
                <circle-icon-button class="button" icon="close" :rotate="true" @click="closeEHunter"></circle-icon-button>
            </div>
            <div :class="['inner-content', { hide: !showTopBar }]">
                <template v-if="readSettings">
                    <div class="item">
                        <span class="label">画面比例:</span>
                        <drop-option :list="scaleList" :change="scaleChange" :cur-val="scale + '%'"></drop-option>
                        <pop-slider 
                            :active="showScaleSlider" 
                            :min="30" 
                            :max="100" 
                            :step="1" 
                            :init="this.scale" 
                            :close="closePopSlider" 
                            :change="scaleSliderChange">
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
            showTopBar: true,
            readSettings: false,
            scale: 80,
            scaleList: [
                { name: '40%', val: 40 },
                { name: '70%', val: 70 },
                { name: '80%', val: 80 },
                { name: '90%', val: 90 },
                { name: '100%', val: 100 },
                { name: '自定义', val: -1 }
            ],
            showScaleSlider: false,
            showThumbView: true
        };
    },

    async created() {
        this.scale = await SettingService.getAlbumWidth();
        this.showThumbView = await SettingService.getThumbViewStatus();
        this.readSettings = true;
    },

    computed: {
        ...mapGetters({})
    },

    methods: {
        ...mapActions([]),

        scaleChange(index) {
            switch (this.scaleList[index].val) {
                case -1:
                    this.showScaleSlider = true;
                    break;
                default:
                    this.scale = this.scaleList[index].val;
                    SettingService.setAlbumWidth(this.scale);
            }
        },

        scaleSliderChange(val) {
            this.scale = val;
            SettingService.setAlbumWidth(this.scale);
        },

        closePopSlider() {
            this.showScaleSlider = false;
        },

        changeThumbView(show) {
            this.showThumbView = show;
            SettingService.toggleThumbView(show);
        },

        changeTopBar() {
            this.showTopBar = !this.showTopBar;
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