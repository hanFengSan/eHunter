<template>
    <div :class="['flat-button', mode]">
        <a :class="[mode, type]" @click="handleClick">{{ label }}</a>
    </div>
</template>

<script setup lang="ts">
defineProps({
    label: {
        type: String
    },
    mode: { // mode: [inline, default]
        type: String,
        default: 'default'
    },
    type: { // mode: [plain, negative, positive, warning]
        type: String,
        default: 'plain'
    }
})

const emit = defineEmits(['click'])

function handleClick(e) {
    emit('click', e);
}
</script>

<style lang="scss" scoped>
@import "../../style/_responsive";
@import "../../style/_variables";
$color: $flat_button_plain_color;

.flat-button {
    >a {
        font-size: 14px;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: all 0.2s ease;
    }

    >.default {
        padding: 5px 10px;
    }

    &.inline {
        margin-left: 10px;
    }

    >.plain {
        color: $flat_button_plain_color;

        &:hover {
            color: $flat_button_plain_light_color;
        }

        &:active {
            color: $flat_button_plain_dark_color;
        }
    }

    >.positive {
        color: $flat_button_positive_color;

        &:hover {
            color: $flat_button_positive_light_color;
        }

        &:active {
            color: $flat_button_positive_dark_color;
        }
    }

    >.negative {
        color: $flat_button_negative_color;

        &:hover {
            color: $flat_button_negative_light_color;
        }

        &:active {
            color: $flat_button_negative_dark_color;
        }
    }

    >.warning {
        color: $flat_button_warning_color;

        &:hover {
            color: $flat_button_warning_light_color;
        }

        &:active {
            color: $flat_button_warning_dark_color;
        }
    }
}
</style>