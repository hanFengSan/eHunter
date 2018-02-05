<template>
    <transition name="slide-fade">
        <div class="popover" v-if="active" :style="customStyle" @click="handleClick($event)">
                <slot></slot>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'Popover',

    props: ['active', 'customStyle', 'close', 'canCancel'],

    data() {
        return {
            timer: {}
        };
    },

    watch: {
        active(newVal, oldVal) {
            if (!this.canCancel) {
                // when user click outside, close popover
                if (newVal) {
                    // user a timer, avoiding call 'close' when 'open'
                    this.timer = setTimeout(() => {
                        document.addEventListener('click', this.handleOuterClick);
                    }, 500);
                }
                if (oldVal) {
                    document.removeEventListener('click', this.handleOuterClick);
                    // remove timer if closing is too fast to having no time for adding event
                    if (this.timer) {
                        clearTimeout(this.timer);
                    }
                }
            }
        }
    },

    methods: {
        handleOuterClick() {
            if (this.close) {
                this.close();
            }
        },

        handleClick(e) {
            e.stopPropagation(); // avoiding emit click event within popover
        }
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