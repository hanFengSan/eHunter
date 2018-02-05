<template>
    <popover class="PopSlider" :active="active" :close="close">
        <div class="content">
            <slider class="slider" :min="min" :max="max" :step="step" :init="init" @change="change"></slider>
            <flat-button class="button" label="确定" @click="handleClick"></flat-button>
        </div>
    </popover>
</template>

<script>
import Popover from './Popover.vue';
import Slider from './Slider.vue';
import FlatButton from './FlatButton.vue';

export default {
    name: 'PopSlider',

    props: ['active', 'min', 'max', 'step', 'init', 'close'],

    components: { Popover, Slider, FlatButton },

    data() {
        return {

        };
    },

    methods: {
        handleClick() {
            this.close();
        },

        change(val) {
            this.$emit('change', val);
        }
    }
}
</script>

<style lang="scss" scoped>
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
    }
}
</style>