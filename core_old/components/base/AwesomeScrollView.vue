<template>
<div ref="asv" :class="['awesome-scroll-view', 'scrollbar', { isHidden: isHidden, isThumbView: isThumbView }]" @scroll="onScroll">
    <slot></slot>
</div>
</template>

<script>
// awesome scroll view for chrome(-webkit)
// @author: Alex chen
// @created: 2017-03-11
import BezierEasing from '../../utils/bezier-easing.js';

export default {
    name: 'AwesomeScrollView',

    props: {
        color: {
            type: String,
            default: 'rgba(0,0,0,0.4)'
        },
        isHidden: {
            type: Boolean,
            default: false
        },
        isThumbView: {
            type: Boolean,
            default: false
        },
        offsetInterval: {
            type: Number,
            default: 150
        },
        onScrollStopped: {
            type: Function,
            default: () => {}
        }
    },

    data() {
        return {
            ticking: false,
            isScrolling: false,
            lastKnownScrollPosition: 0
        };
    },

    watch: {
        // watch scroll position about top, for showing/hiding topBar
        lastKnownScrollPosition(newVal, oldVal) {
            if (newVal === 0) {
                this.$emit('topIn');
            } else if (oldVal === 0) {
                this.$emit('topLeave');
            }
        }
    },

    methods: {
        detectScrollStop() {
            window.clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
                this.onScrollStopped(this.lastKnownScrollPosition);
            }, this.offsetInterval);
        },

        onScroll() {
            try {
                this.lastKnownScrollPosition = this.$refs.asv.scrollTop;
                if (!this.ticking) {
                    window.requestAnimationFrame(() => {
                        this.detectScrollStop();
                        this.ticking = false;
                    });
                }
                this.ticking = true;
                this.isScrolling = true;
            } catch (e) {

            }
        },

        ScrollTo(offsetTop, duration) {
            let startingY = this.$refs.asv.scrollTop;
            let diff = offsetTop - startingY;
            let start;
            const self = this;
            const easing = BezierEasing(0.61, 0.29, 0.3, 0.97);
            window.requestAnimationFrame(function step(timestamp) {
                if (!start) start = timestamp;
                var time = timestamp - start;
                var percent = Math.min(time / duration, 1);
                self.$refs.asv.scrollTop = startingY + diff * easing(percent);
                if (time < duration) {
                    window.requestAnimationFrame(step);
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.awesome-scroll-view {
    position: relative;
    overflow-y: overlay;
    overflow-x: hidden;
    
    &.isThumbView {
        &::-webkit-scrollbar {
            display: none;
        }
    
        &:hover::-webkit-scrollbar {
            display: initial;
        }
    
        &.isHidden:hover::-webkit-scrollbar {
            display: none;
        }
    }

    &.scrollbar {
        transition: all 0.3s ease;
        &::-webkit-scrollbar {
            width: 10px;
        }
        &::-webkit-scrollbar-track {
            background-color: transparent;
            border-width: 0;
        }
        &::-webkit-scrollbar-thumb {
            border-radius: 20px;
            background-color: rgba(255, 255, 255, 0.4);
            border-style: solid;
            border-color: transparent;
            border-width: 3px;
            background-clip: padding-box;
        }
        &::-webkit-scrollbar-button,
        &::-webkit-scrollbar-track-piece,
        &::-webkit-scrollbar-corner,
        &::-webkit-resizer {
            display: none;
        }
    }
}
</style>