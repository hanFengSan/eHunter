<template>
<div class="drop-option">
    <div class="label">画面比例:</div>
    <div class="option-container">
        <div class="text clickable no-select" @click="select()">{{ curVal }}</div>
        <svg class="icon-drop-down clickable no-select" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="select()">
            <path d="M7 10l5 5 5-5z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
        <popover :active="active" :custom-style="{'margin-left': '7px', 'margin-top': '4px'}">
            <div class="options no-select">
                <div class="item" v-for="(item, index) in list" :key="item" @click="onClick(index)">{{ item.name || item }}</div>
            </div>
        </popover>
    </div>
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
            this.change(index);
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
    justify-content: center;
    align-items: center;
    > .label {
        }
    > .option-container {
        position: relative;
        justify-content: center;
        align-items: center;
        overflow: visible;        
        > .text {                
            margin-left: 7px;
            padding: 3px 5px;
            background: rgba(0, 0, 0, 0.2);
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
                &:hover {
                    cursor: pointer;
                    // transition: background-color 0.3s ease, color 0.3s ease, padding-left 0.3s ease;
                    color: $accent_color;
                    background: rgba(0, 0, 0, 0.1);
                    padding-left: 15px;
                    padding-right: 5px;
                }
            }
        }
    }
}
</style>