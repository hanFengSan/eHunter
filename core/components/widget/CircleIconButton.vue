<template>
<div class="circle-icon-button" @click="$emit('click')">
    <MenuIcon v-if="iconType == 'menu'" :class="{ rotate }"/>
    <CloseIcon v-if="iconType == 'close'" :class="{ rotate }"/>
    <ExpandIcon v-if="iconType == 'expand'" :class="{ rotate }"/>
</div>
</template>

<script setup lang="ts">
import MenuIcon from '../../assets/svg/menu.svg?component'
import ExpandIcon from '../../assets/svg/expand.svg?component'
import CloseIcon from '../../assets/svg/close.svg?component'

defineProps({
  iconType: String, // menu/close/expand
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