<template>
    <div>
        <div class="container">
            <div class="float-content">
                <div class="button menu">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                </div>
                <div class="button close">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        <path d="M0 0h24v24H0z" fill="none"/>
                    </svg>
                </div>
            </div>
            <div class="inner-content">
                <div class="item">
                    <drop-option :list="scaleList" :change="scaleChange" :cur-val="scale + '%'"></drop-option>
                    <pop-slider 
                        :active="showScaleSlider" 
                        :min="10" 
                        :max="100" 
                        :step="1" 
                        :init="this.scale" 
                        :close="closePopSlider" 
                        :change="scaleSliderChange">
                    </pop-slider>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DropOption from './widget/DropOption.vue';
import PopSlider from './widget/PopSlider.vue';

export default {
    name: 'TopBar',

    data() {
        return {
            scale: 80,
            scaleList: [
                { name: '40%', val: 40 },
                { name: '70%', val: 70 },
                { name: '80%', val: 80 },
                { name: '90%', val: 90 },
                { name: '100%', val: 100 },
                { name: '自定义', val: -1 }
            ],
            showScaleSlider: false
        };
    },

    components: { DropOption, PopSlider },

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
            }
        },

        scaleSliderChange(val) {
            this.scale = val;
        },

        closePopSlider() {
            this.showScaleSlider = false;
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
    > .button {
      height: 26px;
      width: 26px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      justify-content: center;
      align-items: center;
      margin-right: 13px;
      > svg {
        fill: rgba(255, 255, 255, 0.9);
        height: 18px;
        width: 18px;
      }
    }
  }

  > .inner-content {
    height: 40px;
    color: white;
    flex-grow: 1;
    background: $accent_color;
    font-size: 14px;
    > .item {
      margin-left: 22px;
      position: relative;
    }
  }
}
</style>