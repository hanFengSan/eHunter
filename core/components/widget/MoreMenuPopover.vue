<template>
    <Popover :active="active" :custom-style="{ 'margin-left': '7px', 'margin-top': '4px' }" @close="$emit('close')">
        <div class="options no-select">
            <div class="item" @click="handleMoreSettings">
                <span>{{ i18n.moreSettings }}</span>
            </div>
            <div class="item" @click="handleQuickPreview">
                <span>{{ i18n.quickPreview }}</span>
            </div>
            <div class="item" @click="handleDownload">
                <span>{{ i18n.download }}</span>
            </div>
        </div>
    </Popover>
</template>

<script setup lang="ts">
import Popover from './Popover.vue'
import { i18n } from '../../store/i18n'

defineProps({
    active: Boolean,
})

const emit = defineEmits(['close', 'more-settings', 'quick-preview', 'download'])

function handleMoreSettings() {
    emit('more-settings')
    emit('close')
}

function handleQuickPreview() {
    emit('quick-preview')
    emit('close')
}

function handleDownload() {
    emit('download')
    emit('close')
}
</script>

<style lang="scss" scoped>
@import '../../style/_responsive';
@import '../../style/_variables';

div {
    display: flex;
}

.options {
    flex-direction: column;
    transition: all 0.3s ease;

    > .item {
        padding: 5px 10px;
        white-space: nowrap;
        color: rgba(0, 0, 0, 0.8);
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
                margin-left: 5px;
                margin-right: -5px;
            }
        }
    }
}
</style>
