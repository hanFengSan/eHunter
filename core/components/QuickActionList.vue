<template>
    <div class="quick-action-list">
        <Popover :active="store.showQuickAction" :custom-style="{ 'left': 'unset', 'right': '0' }" @close="storeAction.toggleShowQuickAction">
            <div class="options no-select">
                <div class="item" v-for="(item, index) in list" :key="item.i18nKey" @click="item.onClick">
                    <span>{{ i18n[item.i18nKey] }}</span>
                </div>
            </div>
        </Popover>
    </div>
</template>

<script setup lang="ts">
import { store, storeAction } from '../store/app'
import Popover from './widget/Popover.vue'
import { i18n } from '../store/i18n'
import { ref, computed } from 'vue'

const emit = defineEmits(['change', 'closeEHunter'])

function fullscreen() {
    // hack for crossing chrome and firefox
    const elem = <any>document.querySelector('.vue-container');
    const t = <any>document;
    if (t.webkitCurrentFullScreenElement || t.mozFullScreenElement) {
        t.webkitExitFullscreen ? t.webkitExitFullscreen() : '';
        t.mozCancelFullScreen ? t.mozCancelFullScreen() : '';
    } else {
        elem.mozRequestFullScreen ? elem.mozRequestFullScreen() : '';
        elem.webkitRequestFullScreen ? elem.webkitRequestFullScreen() : '';
    }
}

function closeEhunter() {
    emit('closeEHunter')
}

interface ListItem {
    i18nKey: string
    onClick?: Function
}

let active = ref(false)

let list = ref(<Array<ListItem>>[
    { i18nKey: "fullScreen", onClick: fullscreen },
    { i18nKey: "closeEHunter", onClick: closeEhunter },
])

function onSelect() {
    active.value = !active.value
}

function onClose() {
    active.value = false
}
</script>

<style lang="scss" scoped>
@import "../style/_responsive";
@import "../style/_variables";

div {
    display: flex;
}

.quick-action-list {
    font-size: 14px;
    position: absolute;
    background: white;
    border-radius: 2px;
    color: black;
    box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    .options {
        flex-direction: column;
        transition: all 0.3s ease;

        >.item {
            padding: 5px 10px;
            white-space: nowrap;
            color: rgba(0, 0, 0, 0.8);
            padding: 7px 11px;
            min-width: 52px;
            transition: all 0.3s ease;

            >span {
                transition: all 0.3s ease;
            }

            &:hover {
                cursor: pointer;
                background: rgba(0, 0, 0, 0.1);

                >span {
                    color: $accent_color;
                    margin-left: 5px;
                    margin-right: -5px;
                }
            }
        }
    }
}
</style>