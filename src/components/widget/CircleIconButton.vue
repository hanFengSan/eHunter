<template>
<div class="circle-icon-button" @click="handleClick">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" :class="{ rotate: showRotation }">
        <template v-if="icon === 'menu'">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </template>
        <template v-if="icon === 'close'">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </template>
    </svg>
</div>
</template>

<script>
export default {
    name: 'CircleIconButton',

    props: {
        icon: {  // [menu, close]
            type: String
        },
        rotate: {
            type: Boolean,
            default: false
        },
        initRotation: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            showRotation: false
        };
    },

    created() {
        if (this.rotate) {
            this.showRotation = this.initRotation;
        }
    },

    methods: {
        handleClick(e) {
            if (this.rotate) {
                this.showRotation = !this.showRotation;
            }
            this.$emit('click', e);
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~style/_responsive";
@import "~style/_variables";

.circle-icon-button {
    height: 26px;
    width: 26px;
    background: $top_bar_float_btn_bg;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    margin-right: 13px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;
    > svg {
        fill: $top_bar_float_btn_icon_color;
        height: 18px;
        width: 18px;
        transition: all 0.2s;
        &.rotate {
            transform: rotate(90deg);
        }
    }
    &:hover {
        background: $top_bar_float_btn_hover_bg;
        > svg {
            fill: $top_bar_float_btn_hover_icon_color;
        }
    }
    &:active {
        background: $top_bar_float_btn_active_bg;
        > svg {
            fill: $top_bar_float_btn_active_icon_color;
        }
    }
}
</style>