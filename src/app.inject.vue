<template>
    <div class="app">
        <thumb-scroll-view class="thumb-scroll-view" :style="thumbStyle"></thumb-scroll-view>
        <album-scroll-view class="album-scroll-view"></album-scroll-view>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ThumbScrollView from './components/ThumbScrollView.vue'
import AlbumScrollView from './components/AlbumScrollView.vue'

export default {
    name: 'InjectedApp',

    data() {
        return {
        };
    },

    components: {
        ThumbScrollView, AlbumScrollView
    },

    computed: {
        ...mapGetters([
            'showThumbView',
            'thumbWidth'
        ]),
        thumbStyle() {
            if (this.showThumbView) {
                return '';
            } else {
                return `margin-left: -${this.thumbWidth}px`;
            }
        }
    }
}
</script>

<style lang="scss">
@import "~style/_responsive";
@import "~style/_variables";

.app {
    display: flex;
    > .thumb-scroll-view {
        transition: all 0.3s ease;
        &.hide {
            margin: -100%;
        }
    }
    > .album-scroll-view {
        flex-grow: 1;
    }

    section, header, nav {
        display: flex;
    }

    p {
        padding: 0;
    }

    h1, h2, h3, h4, h5, h6 {
        margin: 0;
    }

    .clickable {
        cursor: pointer;
    }
    
    .no-select {
        user-select: none;
    }

    .tips {
        position: relative;
        &:hover {
            &:after {
                content: attr(title-content);
                position: absolute;
                top: -130%;
                left: 50%;
                transform: translate(-50%, 0);
                font-size: 12px;
                white-space: nowrap;
                padding: 4px 6px 5px 6px;
                border-radius: 2px;
                min-width: 50px;
                text-align: center;
                background: rgba(0, 0, 0, 0.8);
                box-shadow: 0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647);
            }
        }
        &.tips-down {
            &:hover {
                &:after {
                    top: 130%;
                }
            }
        }
    }
}

body {
    font-family: 'San Francisco', 'Helvetica', Arial, "Hiragino Sans GB", "Heiti SC",//macOS & ios
    "Microsoft YaHei", //windows
    'Droid Sans', // android default
    'WenQuanYi Micro Hei', // linux
    sans-serif;
}
</style>