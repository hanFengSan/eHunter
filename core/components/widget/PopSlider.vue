<template>
    <popover class="PopSlider" :active="active" :close="close">
        <div class="content" @keydown="stopArrowEvent">
            <input ref="inputElem" class="value" type="number" @keydown="watchKeyboard" v-model="value">
            <slider class="slider" :min="min" :max="max" :step="step" :init="init" @change="change"></slider>
            <flat-button class="button" :label="string.confirm" type="positive" @click="handleClick"></flat-button>
        </div>
    </popover>
</template>

<script>
import { mapGetters } from 'vuex';
import Popover from './Popover.vue';
import Slider from './Slider.vue';
import FlatButton from './FlatButton.vue';
import * as tags from '../../assets/value/tags.js';
import DialogBean from '../../bean/DialogBean.ts';
import { DialogOperation, DOClick } from '../../bean/DialogOperation';
import { mapActions } from 'vuex';

export default {
    name: 'PopSlider',

    props: ['active', 'min', 'max', 'step', 'init', 'isFloat', 'close'],

    components: { Popover, Slider, FlatButton },


    data() {
        return {
          value: 0
        };
    },

    created() {
      this.value = this.init;
    },

    watch: {
      init() {
        this.value = this.init;
      }
    },

    computed: {
        ...mapGetters(['string'])
    },

    methods: {
        ...mapActions([
          'addDialog'
        ]),
        handleClick() {
            this.handleInput();
            this.close();
        },

        change(val) {
            this.$emit('change', val);
        },

        handleInput() {
          this.$refs.inputElem.blur();
          if (!this.isFloat) {
            this.value = Math.floor(this.value);
          }
          if (this.value < this.min || this.value > this.max) {
              this.value = this.init;
              let dialog = new DialogBean(
                  tags.DIALOG_COMPULSIVE,
                  this.string.tips,
                  this.string.numberInputTip.replace('{{min}}', this.min).replace('{{max}}', this.max),
                  new DialogOperation(this.string.confirm, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
                      return true;
                  })
              );
              this.addDialog(dialog);
          } else {
              this.$emit('change', this.value);
          }
        },

        watchKeyboard(e) {
          if (e.key === 'Enter') {
            this.handleInput();
          }
        },

        stopArrowEvent(e) {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.stopPropagation();
          }
        }
    }
}
</script>

<style lang="scss" scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
    -moz-appearance:textfield; /* Firefox */
}

div {
    display: flex;
}

.PopSlider {
    > .content {
        padding: 7px 10px 7px 15px;
        align-items: center;
        > .button {
            margin-left: 8px;
        }
        > .value {
            background: transparent;
            border: none;
            width: 30px;
            color: #2ecc70;
            margin-right: 7px;
            font-size: 13px;
            text-align: center;
            &:focus {
              outline-width: 0;
              color: #222222;
            }
        }
    }
}
</style>