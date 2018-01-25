<template>
<div class="switch" @click="handleClick">
    <div :class="{ 'track': true, enabled }"></div>
    <div :class="{ 'thumb': true, enabled }"></div>
</div>
</template>

<script>
export default {
    name: 'SimpleSwitch',

    props: {
        init: {
            type: Boolean
        },
        change: {
            type: Function,
            default: () => {}
        }
    },

    data() {
        return {
            enabled: false
        };
    },

    created() {
        this.enabled = this.init;
    },

    methods: {
        handleClick() {
            this.enabled = !this.enabled;
            this.change(this.enabled);
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
    align-items: center;
    margin: auto 17px;
    position: relative;
    cursor: pointer;
    > .track {
        height: 14px;
        width: 100%;
        border-radius: 30px;
        background: $switch_track_disabled_color;
        transition: all .45s cubic-bezier(.23,1,.32,1);
        &.enabled {
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
        transform: translateX(-50%);
        box-shadow: 0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647);
        &.enabled {
            background: $switch_thumb_enabled_color;
            left: 100%;
        }
    }
}
</style>