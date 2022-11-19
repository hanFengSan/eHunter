<template>
    <div class="drop-option" @click="onSelect">
        <div class="text clickable no-select">{{ curValName }}</div>
        <DropDownIcon class="icon-drop-down clickable no-select" />
        <popover :active="active" :custom-style="{ 'margin-left': '7px', 'margin-top': '4px' }" @close="onClose">
            <div class="options no-select">
                <div class="item" v-for="(item, index) in list" :key="item.name || item.i18nKey"
                    @click="onClick(index)">
                    <span>{{ item.i18nKey ? i18n[item.i18nKey] : item.name }}</span>
                </div>
            </div>
        </popover>
    </div>
</template>

<script setup lang="ts">
import DropDownIcon from '../../assets/svg/drop_down.svg?component'
import Popover from './Popover.vue'
import { i18n } from '../../store/i18n'
import { ref, computed } from 'vue'

interface ListItem {
    name?: string
    abbrName?: string
    i18nKey?: string
    abbrI18nKey?: string
    val: string | number
}

const props = withDefaults(defineProps<{
    list: Array<ListItem>,
    curVal: string | number,
    formatCurValByList?: boolean,
    useAbbrName?: boolean,
}>(), {
    formatCurValByList: false,
    useAbbrName: false
})

const emit = defineEmits(['change'])

let active = ref(false)

function onSelect() {
    active.value = !active.value
}

function onClose() {
    active.value = false
}

function onClick(index) {
    onSelect()
    emit('change', props.list[index].val, index)
}

const curValName = computed(() => {
    if (props.formatCurValByList) {
        for (let item of props.list) {
            if (item.val == props.curVal) {
                if (props.useAbbrName && item.abbrI18nKey) {
                    return i18n.value[item.abbrI18nKey]
                }
                if (item.i18nKey) {
                    return i18n.value[item.i18nKey]
                }
                if (props.useAbbrName && item.abbrName) {
                    return item.abbrName
                }
                return item.name
            }
        }
    }
    return String(props.curVal)
})
</script>

<style lang="scss" scoped>
@import "../../style/_responsive";
@import "../../style/_variables";

div {
    display: flex;
}

.drop-option {
    position: relative;
    justify-content: center;
    align-items: center;
    overflow: visible;
    cursor: pointer;

    >.text {
        margin-left: 7px;
        padding: 3px 5px;
        background: rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        color: white;
        font-size: 14px;
    }

    >.icon-drop-down {
        fill: white;
        height: 18px;
        width: 18px;
        margin-left: 2px;
    }

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