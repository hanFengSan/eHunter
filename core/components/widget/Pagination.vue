<template>
    <section class="pagination">
        <div :class="['item', { disable: curIndex === 0 }]" @click="prev()">
            <LeftArrowIcon class="icon" />
        </div>
        <span :class="['item', { active: n === curIndex }]" v-for="n in pages" :key="n" @click="selectPage(n)">{{
                showNum(n)
        }}</span>
        <div :class="['item', { disable: curIndex === pageSum - 1 }]" @click="next()">
            <RightArrowIcon class="icon" />
        </div>
    </section>
</template>

<script setup>
import LeftArrowIcon from '../../assets/svg/left_arrow.svg?component'
import RightArrowIcon from '../../assets/svg/right_arrow.svg?component'
import { ref, computed } from 'vue'

const props = defineProps({
    curIndex: Number,
    pageSum: Number,
})

const emit = defineEmits(['change'])
const pageRange = ref(3)

const pages = computed(() => {
    let list = [];
    for (let i = 1; i <= pageRange.value; i++) {
        if (props.curIndex - i > 0) {
            list.push(props.curIndex - i);
        }
    }
    for (let i = 1; i <= pageRange.value; i++) {
        if (props.curIndex + i < props.pageSum - 1) {
            list.push(props.curIndex + i);
        }
    }
    list.push(0);
    list.push(props.curIndex);
    list.push(props.pageSum - 1);
    list = [...new Set(list)].sort((a, b) => { return a - b }); // sort and remove duplicated items
    if (list[1] - list[0] > 1) {
        let centerNum1 = Math.floor((list[1] - list[0]) / 2 + list[0]);
        list.unshift(centerNum1);
    }
    if (list[list.length - 1] - list[list.length - 2] > 1) {
        let centerNum2 = Math.floor((list[list.length - 1] - list[list.length - 2]) / 2 + list[list.length - 2]);
        list.push(centerNum2);
    }
    return [...new Set(list)].sort((a, b) => { return a - b }); // sort and remove duplicated items again
})

function showNum(val) {
    if (Math.abs(val - props.curIndex) <= pageRange.value) {
        return val + 1;
    } else if (val === 0 || val === props.pageSum - 1) {
        return val + 1;
    } else {
        return '...';
    }
}

function selectPage(n) {
    emit('change', n);
}

function prev() {
    if (props.curIndex !== 0) {
        emit('change', props.curIndex - 1);
    }
}

function next() {
    if (props.curIndex !== props.pageSum - 1) {
        emit('change', props.curIndex + 1);
    }
}
</script>

<style lang="scss" scoped>
@import "../../style/_responsive";
@import "../../style/_variables";

$font_size: 14px;
$item_size: 28px;
$icon_size: 24px;
$item_margin: 5px;
$transition: all 0.3s ease;

div,
section {
    display: flex;
}

.pagination {
    justify-content: center;
    align-items: center;
    transition: $transition;

    >span {
        font-size: $font_size;
        line-height: $item_size;
        // background: $pagination_item_background_actived__color;
        text-align: center;
        color: $pagination_item_text_normal_color;
        transition: $transition;

        &:hover {
            color: $pagination_item_text_hovered__color;
        }
    }

    >.item {
        margin: 0 $item_margin;
        width: $item_size;
        height: $item_size;
        justify-content: center;
        align-content: center;
        border-radius: 6%;
        cursor: pointer;
        user-select: none;
        background: transparent;
        transition: $transition;

        &:hover {
            background: $pagination_item_background_hovered__color;
        }

        &.active {
            color: $pagination_item_text_actived__color;
            background: $pagination_item_background_actived__color;
        }

        >.icon {
            fill: $pagination_icon_active_color;
            width: $icon_size;

            &:hover {
                fill: $pagination_icon_hovered_color;
            }
        }

        // icon disabled style
        &.disable {
            cursor: not-allowed;

            &:hover {
                background: transparent;
            }

            >.icon {
                fill: $pagination_icon_disabled_color;

                &:hover {
                    fill: $pagination_icon_disabled_color;
                }
            }
        }
    }
}
</style>