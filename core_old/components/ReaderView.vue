<template>
<div class="reader-view">
    <!-- loading view -->
    <div class="loading-container" v-if="false">
        <span class="loading">Loading...</span>
        <p class="tip">
            {{ string .loadingTip }}
        </p>
    </div>
    <!-- top bar view -->
    <top-bar class="top-bar" />
    <!-- panel view -->
    <div class="panel">
        <h4 class="location">{{ location }}</h4>
        <div class="full-screen tips tips-left" :title-content="string.fullScreen" @click="fullscreen">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
        </div>
    </div>
    <transition name="slow-horizontal-fade">
        <album-scroll-view
            class="content scroll-mode"
            v-if="readingMode === 0"
            :pageCount="pageCount"
            :curPageNum="curPageNum"
            :title="title"
            :imgPageInfos="imgPageInfos"
            :albumId="albumId">
        </album-scroll-view>
    </transition>
    <transition name="slow-vertical-fade">
        <album-book-view
            class="content book-mode"
            v-if="readingMode === 1"
            :pageCount="pageCount"
            :curPageNum="curPageNum"
            :title="title"
            :imgPageInfos="imgPageInfos"
            :albumId="albumId">
        </album-book-view>
    </transition>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AlbumScrollView from './AlbumScrollView.vue';
import TopBar from './TopBar.vue';
import AlbumBookView from './AlbumBookView.vue';
import * as tags from '../assets/value/tags';
// import Logger from '../utils/Logger';

export default {
    name: 'reader-view',

    inject: ['service'],

    props: {
        pageCount: {
            type: Number
        },
        curPageNum: {
            type: Number
        },
        title: {
            type: String
        },
        imgPageInfos: {
            type: Array
        },
        albumId: {
            type: String
        }
    },

    components: { AlbumScrollView, AlbumBookView, TopBar },

    async created() {
        this.setIndex({ val: this.curPageNum - 1, updater: tags.READER_VIEW });
    },

    computed: {
        ...mapGetters({
            curIndex: 'curIndex',
            readingMode: 'readingMode',
            bookIndex: 'bookIndex',
            bookScreenSize: 'bookScreenSize',
            string: 'string'
        }),
        location() {
            let bookScreenCount = this.service.album.getBookScreenCount(this.pageCount, this.bookScreenSize);
            switch (this.readingMode) {
                case 0:
                    return `${this.curIndex.val + 1} / ${this.pageCount}`;
                case 1:
                    return `${this.bookIndex + 1} / 
                    ${bookScreenCount}`;
            }
        }
    },

    methods: {
        ...mapActions(['setIndex']),
        fullscreen() {
            // hack for crossing chrome and firefox
            const elem = document.querySelector('.vue-container');
            if (document.webkitCurrentFullScreenElement || document.mozFullScreenElement) {
                document.webkitExitFullscreen ? document.webkitExitFullscreen() : '';
                document.mozCancelFullScreen ? document.mozCancelFullScreen() : '';
            } else {
                elem.mozRequestFullScreen ? elem.mozRequestFullScreen() : '';
                elem.webkitRequestFullScreen ? elem.webkitRequestFullScreen() : '';
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

div {
    display: flex;
}

.reader-view {
    position: relative;
    flex-direction: column;
    align-items: center;
    > .loading-container {
        position: absolute;
        flex-direction: column;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: $reader_view_loading_color;
        > .loading {
            display: block;
            font-size: 24px;
            font-weight: bolder;
            font-size: 4vw;
        }
        > .tip {
            padding: 0;
            margin: 10px 0;
            font-size: 16px;
        }
    }
    > .top-bar {
        position: absolute;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100%;
    }
    > .panel {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        bottom: 2vh;
        right: 2vh;
        z-index: 10;
        opacity: 0.5;
        transition: all 0.2s ease;
        &:hover {
            opacity: 1;
        }
        > .location {
            color: $reader_view_location_color;
            display: inline-block;
            font-size: 16px;
            line-height: 16px;
            margin-top: 2px;
        }
        .icon-container {
            position: relative;
            display: inline-block;
        }
        > .full-screen {
            cursor: pointer;
            margin-left: 5px;
            > svg {
                fill: $reader_view_full_screen_color;
                width: 26px;
                height: 26px;
            }
        }
    }

    > .content {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
    }
}
</style>