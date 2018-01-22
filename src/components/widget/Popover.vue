<template>
    <transition name="slide-fade">
        <div class="popover" v-if="active" :style="customStyle">
                <slot></slot>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'Popover',

    props: ['active', 'customStyle', 'close'],

    data() {
        return {

        };
    }
}
</script>

<style lang="scss" scoped>
.popover {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border-radius: 2px;
    color: black;
    box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

// 过渡效果
.slide-fade-enter-active {
    transition: all .2s ease;
}
.slide-fade-leave-active {
    transition: all .2s ease;
}
.slide-fade-enter,
.slide-fade-leave-active {
    transform: translateX(10px);
    opacity: 0;
}
</style>