<template>
<div :class="['flat-button', mode]">
    <a :class="[mode]" @click="handleClick">{{ label }}</a>
</div>
</template>

<script>
export default {
    name: 'FlatButton',

    props: {
        label: {
            type: String
        },
        mode: {
            type: String,
            default: 'default'
        }
    },

    data() {
        return {

        };
    },

    methods: {
        handleClick(e) {
            this.$emit('click', e);
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~style/_responsive";
@import "~style/_variables";
.flat-button {
    > a {
        font-size: 14px;
        color: $flat_button_primary_color;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: all 0.2s ease;
    }
    > .default {
        padding: 5px 10px;
        &:hover {
            background: rgba(0, 0, 0, 0.05);
        }
        &:active {
            background: rgba(0, 0, 0, 0.15);
        }
    }
    &.inline {
        margin-left: 10px;
    }
    > .inline {
        &:hover {
            color: $flat_button_light_color;
        }
        &:active {
            color: $flat_button_dark_color;
        }
    }
}
</style>