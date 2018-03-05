<template>
<div class="switch" @click="handleClick">
    <div :class="{ 'track': true, active }"></div>
    <div :class="{ 'thumb': true, active }"></div>
</div>
</template>

<script>
export default {
    name: 'SimpleSwitch',

    props: {
        active: {
            type: Boolean
        },
        change: {
            type: Function,
            default: () => {}
        }
    },

    data() {
        return {
        };
    },

    methods: {
        handleClick() {
            this.$emit('change', !this.active);
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~style/_responsive";
@import "~style/_variables";

* div {
    display: flex;
}
.switch {
    width: 28px;
    // align-items: center;
    margin: auto 15px;
    position: relative;
    cursor: pointer;
    > .track {
        height: 14px;
        width: 100%;
        border-radius: 30px;
        background: $switch_track_disabled_color;
        transition: all .45s cubic-bezier(.23,1,.32,1);
        &.active {
           background: $switch_track_enabled_color;
        }
    }
    > .thumb {
        position: absolute;
        width: 20px;
        height: 20px;
        background: $switch_thumb_disabled_color;
        border-radius: 50%;
        transition: all 0.45s cubic-bezier(.23,1,.32,1);
        left: 0;
        top: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647);
        &.active {
            background: $switch_thumb_enabled_color;
            left: 100%;
        }
    }
}
</style>