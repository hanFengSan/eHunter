<template>
    <div class="app">
        <thumb-scroll-view class="thumb-column" :style="thumbStyle"></thumb-scroll-view>
        <reader-view class="reader-column"></reader-view>
        <modal-manager class="modal"></modal-manager>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ThumbScrollView from './components/ThumbScrollView.vue';
import ReaderView from './components/ReaderView.vue';
import ModalManager from './components/ModalManager.vue';
import SettingService from './service/SettingService';
import InfoService from './service/InfoService';
import * as tags from './assets/value/tags';

export default {
    name: 'InjectedApp',

    components: {
        ThumbScrollView,
        ReaderView,
        ModalManager
    },

    data() {
        return {};
    },

    async created() {
        await this.checkInstrcutions();
        this.checkVersion();
    },

    computed: {
        ...mapGetters(['showThumbView', 'thumbWidth', 'readingMode']),
        thumbStyle() {
            if (this.readingMode === 0 && this.showThumbView) {
                return '';
            } else {
                return { 'margin-left': this.px(-this.thumbWidth) };
            }
        }
    },

    methods: {
        async checkInstrcutions() {
            if (await SettingService.getFirstOpen()) {
                // auto choose language
                let lang = navigator.language.toLowerCase();
                if (lang.includes('zh')) {
                    await SettingService.setLang(tags.LANG_CN);
                } else if (lang.includes('jp')) {
                    await SettingService.setLang(tags.LANG_JP);
                }
                // show instructions
                InfoService.showInstruction(true);
                SettingService.setFirstOpen(false);
            }
        },

        async checkVersion() {
            InfoService.checkUpdate();
            InfoService.checkNewVersion();
        }
    }
};
</script>

<style lang="scss">
@import '~style/_responsive';
@import '~style/_variables';
@import '~style/_markdown';

$change_mode_time: 0.8s;
$general_animtation_time: 0.2s;

.app {
    display: flex;
    height: 100%;
    text-align: initial; // overlay original style
    > .thumb-column {
        transition: all $change_mode_time ease;
        &.hide {
            margin: -100%;
        }
    }
    > .reader-column {
        flex: 1;
    }
    > .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100;
        overflow-y: auto;
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
                top: -110%;
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
                color: white;
            }
        }
        &.tips-down {
            &:hover {
                &:after {
                    top: 130%;
                }
            }
        }
        &.tips-right {
            &:hover {
                &:after {
                    left: -10%;
                    transform: initial;
                }
            }
        }
        &.tips-left {
            &:hover {
                &:after {
                    right: -20%;
                    left: initial;
                    transform: initial;
                }
            }
        }
    }

    // 过渡效果
    .slide-fade-enter-active,
    .slide-fade-leave-active {
        transition: all $general_animtation_time ease;
    }
    .slide-fade-enter,
    .slide-fade-leave-active {
        transform: translateX(10px);
        opacity: 0;
    }

    .center-horizontal-fade-enter-active,
    .center-horizontal-fade-leave-active {
        transition: all $change_mode_time ease;
    }
    .center-horizontal-fade-enter,
    .center-horizontal-fade-leave-active {
        transform: translateX(-40%) !important;
        opacity: 0 !important;
    }

    .slow-horizontal-fade-enter-active,
    .slow-horizontal-fade-leave-active {
        transition: all $change_mode_time ease;
    }
    .slow-horizontal-fade-enter,
    .slow-horizontal-fade-leave-active {
        transform: translateX(20%);
        opacity: 0;
    }

    .slow-vertical-fade-enter-active,
    .slow-vertical-fade-leave-active {
        transition: all $change_mode_time ease;
    }
    .slow-vertical-fade-enter,
    .slow-vertical-fade-leave-active {
        transform: translate(-20%, 20%);
        opacity: 0;
    }

    .slow-opacity-fade-enter-active,
    .slow-opacity-fade-leave-active {
        transition: all 0.3s ease;
    }
    .slow-opacity-fade-enter,
    .slow-opacity-fade-leave-active {
        opacity: 0;
    }

    .vertical-list-enter-active,
    .vertical-list-leave-active {
        transition: all 0.5s;
    }
    .vertical-list-enter,
    .vertical-list-leave-to {
        opacity: 0;
        transform: translateY(10%);
    }
}

body {
    font-family: 'San Francisco', Arial, 'Hiragino Sans GB', 'Heiti SC', 'Microsoft YaHei', 'Droid Sans',
        'WenQuanYi Micro Hei', sans-serif;
}
</style>