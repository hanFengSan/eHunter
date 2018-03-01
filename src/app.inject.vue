<template>
    <div class="app">
        <thumb-scroll-view class="thumb-column" :style="thumbStyle"></thumb-scroll-view>
        <reader-view class="reader-column"></reader-view>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ThumbScrollView from './components/ThumbScrollView.vue';
import ReaderView from './components/ReaderView.vue';

export default {
    name: 'InjectedApp',

    data() {
        return {};
    },

    components: {
        ThumbScrollView,
        ReaderView
    },

    computed: {
        ...mapGetters(['showThumbView', 'thumbWidth', 'readingMode']),
        thumbStyle() {
            if (this.showThumbView) {
                return '';
            } else {
                return `margin-left: -${this.thumbWidth}px`;
            }
        }
    }
};
</script>

<style lang="scss">
@import '~style/_responsive';
@import '~style/_variables';

.app {
    display: flex;
    height: 100%;
    > .thumb-column {
        transition: all 0.3s ease;
        &.hide {
            margin: -100%;
        }
    }
    > .reader-column {
        flex: 1;
    }

    section,
    header,
    nav {
        display: flex;
    }

    p {
        padding: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
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
                box-shadow: 0 1px 6px rgba(0, 0, 0, 0.117647), 0 1px 4px rgba(0, 0, 0, 0.117647);
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

    // 过渡效果
    .slide-fade-enter-active {
        transition: all 0.2s ease;
    }
    .slide-fade-leave-active {
        transition: all 0.2s ease;
    }
    .slide-fade-enter,
    .slide-fade-leave-active {
        transform: translateX(10px);
        opacity: 0;
    }
}

body {
    font-family: 'San Francisco', 'Helvetica', Arial, 'Hiragino Sans GB', 'Heiti SC',
        'Microsoft YaHei', 'Droid Sans', 'WenQuanYi Micro Hei', sans-serif;
}
</style>