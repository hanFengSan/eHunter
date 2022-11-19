<template>
<section class="pagination">
    <div :class="['item', { disable: curIndex === 0 }]" @click="prev()">
        <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
            <path d="M0-.5h24v24H0z" fill="none"/>
        </svg>
    </div>
    <span :class="['item', { active: n === curIndex }]" v-for="n in pages" :key="n" @click="selectPage(n)">{{ showNum(n) }}</span>
    <div :class="['item', { disable: curIndex === pageSum - 1 }]" @click="next()">
        <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
            <path d="M0-.25h24v24H0z" fill="none"/>
        </svg>
    </div>
</section>
</template>

<script>
export default {
    name: 'Pagination',

    props: {
        curIndex: {
            type: Number
        },
        pageSum: {
            type: Number
        }
    },

    data() {
        return {
            pageRange: 3
        };
    },

    computed: {
        // get shown page array
        pages() {
            let list = [];
            for (let i = 1; i <= this.pageRange; i++) {
                if (this.curIndex - i > 0) {
                    list.push(this.curIndex - i);
                }
            }
            for (let i = 1; i <= this.pageRange; i++) {
                if (this.curIndex + i < this.pageSum - 1) {
                    list.push(this.curIndex + i);
                }
            }
            list.push(0);
            list.push(this.curIndex);
            list.push(this.pageSum - 1);
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
        }
    },

    methods: {
        showNum(val) {
            if (Math.abs(val - this.curIndex) <= this.pageRange) {
                return val + 1;
            } else if (val === 0 || val === this.pageSum - 1) {
                return val + 1;
            } else {
                return '...';
            }
        },

        selectPage(n) {
            this.$emit('change', n);
        },

        prev() {
            if (this.curIndex !== 0) {
                this.$emit('change', this.curIndex - 1);
            }
        },

        next() {
            if (this.curIndex !== this.pageSum - 1) {
                this.$emit('change', this.curIndex + 1);
            }
        }
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

div, section {
    display: flex;
}

.pagination {
    justify-content: center;
    align-items: center;
    transition: $transition;
    > span {
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
    > .item {
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
        > .icon {
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
            > .icon {
                fill: $pagination_icon_disabled_color;
                &:hover {
                    fill: $pagination_icon_disabled_color;
                }
            }
        }
    }
}
</style>