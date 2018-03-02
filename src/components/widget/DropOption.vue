<template>
<div class="drop-option">
    <div class="text clickable no-select" @click="select()">{{ curVal }}</div>
    <svg class="icon-drop-down clickable no-select" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="select()">
        <path d="M7 10l5 5 5-5z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
    </svg>
    <popover :active="active" :custom-style="{'margin-left': '7px', 'margin-top': '4px'}" :close="close">
        <div class="options no-select">
            <div class="item" v-for="(item, index) in list" :key="item" @click="onClick(index)">
                <span>{{ item.name || item }}</span>
            </div>
        </div>
    </popover>
</div>
</template>

<script>
import Popover from './Popover.vue';

export default {
    name: 'DropOption',

    props: ['list', 'change', 'curVal'],

    data() {
        return {
            active: false
        };
    },

    components: { Popover },

    computed: {
    },

    methods: {
        select() {
            this.active = !this.active;
        },

        onClick(index) {
            this.select();
            this.$emit('change', index);
        },

        close() {
            this.active = false;
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

.drop-option {
    position: relative;
    justify-content: center;
    align-items: center;
    overflow: visible;     
    > .text {                
        margin-left: 7px;
        padding: 3px 5px;
        background: rgba(0, 0, 0, 0.2);
        white-space: nowrap;
    }
    > .icon-drop-down {
        fill: white;
        height: 18px;
        width: 18px;
        margin-left: 2px;
    }
    .options {
        flex-direction: column;
        transition: all 0.3s ease;
        > .item {
            padding: 5px 10px;
            white-space: nowrap;
            color: rgba(0,0,0,0.8);
            padding: 7px 11px;
            min-width: 52px;
            transition: all 0.3s ease;
            > span {
                transition: all 0.3s ease;
            }
            &:hover {
                cursor: pointer;
                background: rgba(0, 0, 0, 0.1);
                > span {
                    color: $accent_color;
                    transform: translateX(5px);
                }
            }
        }
    }
}
</style>