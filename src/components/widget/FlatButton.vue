<template>
<div class="FlatButton">
    <a @click="handleClick">{{ label }}</a>
</div>
</template>

<script>
export default {
    name: 'FlatButton',

    props: {
        label: {
            type: String
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
.FlatButton {
    > a {
        font-size: 14px;
        color: $flat_button_primary_color;
        padding: 5px 10px;
        cursor: pointer;
        white-space: nowrap;
        user-select: none;
        transition: all 0.2s ease;
        &:hover {
            background: rgba(0, 0, 0, 0.05);
        }
        &:active {
            background: rgba(0, 0, 0, 0.15);
        }
    }
}
</style>