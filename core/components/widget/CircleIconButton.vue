<template>
<div class="circle-icon-button" @click="$emit('click')" :class="{'big': size == 'big'}">
    <MenuIcon v-if="iconType == 'menu'" :class="{ rotate }"/>
    <CloseIcon v-if="iconType == 'close'" :class="{ rotate }"/>
    <ExpandIcon v-if="iconType == 'expand'" :class="{ rotate }"/>
    <LeftArrowIcon v-if="iconType == 'up_arrow'" class="rotate90"/>
    <AppsIcon v-if="iconType == 'apps'"/>
    <MoreVertIcon v-if="iconType == 'more_vert'"/>
    <EjectIcon v-if="iconType == 'eject'" :class="{ 'rotate180': !rotate }"/>
</div>
</template>

<script setup lang="ts">
/// <reference types="vite-svg-loader" />
import MenuIcon from '../../assets/svg/menu.svg?component'
import ExpandIcon from '../../assets/svg/expand.svg?component'
import CloseIcon from '../../assets/svg/close.svg?component'
import LeftArrowIcon from '../../assets/svg/left_arrow.svg?component'
import AppsIcon from '../../assets/svg/apps.svg?component'
import MoreVertIcon from '../../assets/svg/more_vert.svg?component'
import EjectIcon from '../../assets/svg/eject.svg?component'

defineProps({
  iconType: String, // menu/close/expand/up_arrow/apps/more_vert/eject
  size: String, // normal, big
  rotate: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
@import "../../style/_responsive";
@import "../../style/_variables";

.circle-icon-button {
    height: 26px;
    width: 26px;
    background: $top_bar_float_btn_bg;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;
    &.big {
        height: 36px;
        width: 36px;
    }
    > svg {
        fill: $top_bar_float_btn_icon_color;
        height: 18px;
        width: 18px;
        transition: all 0.2s;
        &.rotate {
            transform: rotate(90deg);
        }
        &.rotate90 {
            transform: rotate(90deg);
        }
        &.rotate180 {
            transform: rotate(180deg);
        }
        &.rotateMinus90 {
            transform: rotate(-90deg);
        }
        &.rotateMinus180 {
            transform: rotate(-180deg);
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