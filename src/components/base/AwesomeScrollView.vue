<template>
    <div ref="asw" :class="['awesome-scroll-view', 'scrollbar', { isHidden: isHidden }]" @scroll="onScroll">
        <slot></slot>
    </div>
</template>

<script>
    // awesome scroll view for chrome(-webkit)
    // @author: Alex chen
    // @created: 2017-03-11
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
                this.lastKnownScrollPosition = this.$refs.asw.scrollTop;
                if (!this.ticking) {
                    window.requestAnimationFrame(() => {
                        this.detectScrollStop();
                        this.ticking = false;
                    });
                }
                this.ticking = true;
                this.isScrolling = true;
            },

            showScrollbar() {

            },

            hideScrollBar() {

            }
        }
    }

</script>

<style lang="scss" scoped>
    .awesome-scroll-view {
        position: relative;
        overflow-y: overlay;
        overflow-x: hidden;
        .test {
            background: red;
            width: 50px;
            height: 50px;
            position: absolute;
            right: 0;
            top: 50%;
        }

        &::-webkit-scrollbar {
            display: none;
        }

        &:hover::-webkit-scrollbar {
            display: initial; 
        }

        &.isHidden:hover::-webkit-scrollbar {
            display: none;
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