<template>
<section class="album-book-view">
    <div :class="['screen', { 'avoid-top-bar': showTopBar, 'animation': showBookScreenAnimation, 'rtl': bookDirection===0 }]" 
        v-for="screen in activedScreens" 
        :style="getScreenStyle(screen)"
        :key="screen">
        <div 
            :class="['page-container', { 'avoid-top-bar': showTopBar }]" 
            v-for="page in screen"
            :key="page.id">
            <page-view
                v-if="page.type===TYPE_NORMAL"
                :index="index(0, page.imgInfo.pageUrl)"
                :active="true"
                :album-id="AlbumService.getAlbumId()"
                :data="page.imgInfo">
            </page-view>
            <div class="page start-page" v-if="page.type===TYPE_START">
                {{ AlbumService.getTitle() }}
            </div>
            <div class="page end-page" v-if="page.type===TYPE_END">
                {{ AlbumService.getTitle() }}
            </div>
        </div>
    </div>
</section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import PageView from './PageView.vue';
import AlbumService from 'src/service/AlbumService.js';
import Logger from '../utils/Logger';

export default {
    name: 'AlbumBookView',

    props: {
        imgInfoList: {
            type: Array
        },
        pageUrlsObj: {
            type: Object
        }
    },

    components: { PageView },

    data() {
        return {
            ID_START: 'ID_START',
            ID_END: 'ID_END',
            TYPE_NORMAL: 'TYPE_NORMAL',
            TYPE_START: 'TYPE_START',
            TYPE_END: 'TYPE_END'
        };
    },

    created() {
        this.watchKeyboard();
    },

    computed: {
        ...mapGetters({
            bookScreenSize: 'bookScreenSize',
            bookIndex: 'bookIndex',
            showTopBar: 'showTopBar',
            bookLoadNum: 'bookLoadNum',
            showBookScreenAnimation: 'showBookScreenAnimation',
            bookDirection: 'bookDirection'
        }),
        AlbumService: () => AlbumService,
        pages() {
            return [
                { id: this.ID_START, type: this.TYPE_START },
                ...this.imgInfoList.map(i => {
                    return {
                        id: i.pageUrl,
                        type: this.TYPE_NORMAL,
                        imgInfo: i
                    };
                }),
                { id: this.ID_END, type: this.TYPE_END }
            ];
        },
        screens() {
            let _pages = this.pages.concat();
            let pageList = [];
            while (_pages.length > 0) {
                pageList.push(_pages.splice(0, this.bookScreenSize));
            }
            return pageList;
        },
        activedScreens() {
            let begin = this.bookIndex - this.bookLoadNum;
            return this.screens.slice(begin >= 0 ? begin : 0, this.bookIndex + this.bookLoadNum);
        }
    },

    methods: {
        ...mapActions(['setBookIndex']),
        // get index of album for index of current volume
        index(i, pageUrl) {
            if (pageUrl) {
                // fix errors in delay methods
                return this.pageUrlsObj[pageUrl];
            } else {
                return this.volFirstIndex + i;
            }
        },

        getScreenIndexByPageIndex(pageIndex) {
            if (pageIndex === 0 || pageIndex === 1) {
                return 0;
            } else {
                let index = pageIndex + 2;
                let remainder = index % this.bookScreenSize;
                return (index - remainder) / this.bookScreenSize;
            }
        },

        getScreenStyle(screen) {
            let index = this.screens.indexOf(screen);
            if (index === this.bookIndex) {
                return {};
            } else if (index < this.bookIndex) {
                return { left: '-100%' };
            } else if (index > this.bookIndex) {
                return { left: '100%' };
            }
        },

        watchKeyboard() {
            document.addEventListener('keydown', e => {
                switch (e.key) {
                    case 'ArrowLeft':
                        this.setBookIndex(this.bookIndex > 0 ? this.bookIndex - 1 : 0);
                        Logger.logText('Book', 'prev page');
                        break;
                    case 'ArrowRight':
                        this.setBookIndex(
                            this.bookIndex === this.screens.length - 1
                                ? this.screens.length - 1
                                : this.bookIndex + 1
                        );
                        Logger.logText('Book', 'next page');
                        break;
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import '~style/_responsive';
@import '~style/_variables';
div {
    display: flex;
}

.album-book-view {
    flex-direction: column;
    position: relative;
    > .screen {
        width: 100%;
        height: 100vh;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        &.animation {
            transition: all 0.5s ease;
        }
        &.rtl {
            flex-direction: row-reverse;
        }
        &.avoid-top-bar {
            margin-top: 40px;
            height: calc(100vh - 40px);
        }
        > .page-container {
            width: calc(100vh / 1.45);
            height: 100%;
            position: relative;
            transition: all 0.3s ease;
            &.avoid-top-bar {
                width: calc((100vh - 40px) / 1.45);
            }
            > .page {
                background: white;
                flex: 1;
                align-self: stretch;
            }
        }
    }
}
</style>