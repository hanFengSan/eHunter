<template>
<section class="album-book-view">
    <div :class="['screen', {'animation': showBookScreenAnimation, 'rtl': bookDirection===0 }]" 
        v-for="screen in activedScreens" 
        :style="getScreenStyle(screen)"
        :key="screenKey(screen)">
        <div 
            class="page-container" 
            v-for="page in screen"
            :style="getPageStyle(page)"
            :key="page.id">
            <page-view
                v-if="page.type===tags.TYPE_NORMAL"
                :index="index(0, page.imgInfo.pageUrl)"
                :active="true"
                :album-id="service.album.getAlbumId()"
                :data="page.imgInfo">
            </page-view>
            <div class="page start-page" v-if="page.type===tags.TYPE_START">
                <div :class="['ehunter-tag', { 'left': bookDirection===1 }]">
                    EHUNTER
                </div>
                <h1>
                    {{ title }}
                </h1>
            </div>
            <div class="page end-page" v-if="page.type===tags.TYPE_END">
                <div :class="['ehunter-tag', { 'left': bookDirection===0 }]">
                    EHUNTER
                </div>
                <h1>END</h1>
            </div>
        </div>
    </div>
    <transition name="center-horizontal-fade">
        <pagination v-if="showBookPagination" class="bottom-pagination" :cur-index="bookIndex" :page-sum="screens.length" @change="selectBookIndex"/>
    </transition>
</section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import PageView from './PageView.vue';
import Pagination from './widget/Pagination.vue';
import * as tags from '../assets/value/tags';
import SettingService from '../service/SettingService';
import InfoService from '../service/InfoService';
// import Logger from '../utils/Logger';

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

    inject: ['service'],

    components: { PageView, Pagination },

    data() {
        return {
            appSize: { height: 0, width: 0 },
            title: ''
        };
    },

    async created() {
        this.appSize = this.getAppSize();
        window.addEventListener('resize', this.watchResize);
        document.addEventListener('keydown', this.watchKeyboard);
        this.checkInstrcutions();
        this.title = await this.service.album.getTitle();
    },

    destroyed() {
        window.removeEventListener('resize', this.watchResize);
        document.removeEventListener('keydown', this.watchKeyboard);
    },

    computed: {
        ...mapGetters({
            bookScreenSize: 'bookScreenSize',
            bookIndex: 'bookIndex',
            showTopBar: 'showTopBar',
            topBarHeight: 'topBarHeight',
            bookLoadNum: 'bookLoadNum',
            showBookScreenAnimation: 'showBookScreenAnimation',
            bookDirection: 'bookDirection',
            showBookPagination: 'showBookPagination'
        }),
        tags: () => tags,
        screenSize() {
            let height = this.appSize.height - (this.showTopBar ? this.topBarHeight : 0);
            return {
                height,
                width: this.appSize.width,
                screenRatio: height / this.appSize.width
            };
        },
        pages() {
            return [
                { id: tags.ID_START, type: tags.TYPE_START, imgInfo: { heightOfWidth: 1.45 } },
                ...this.imgInfoList.map(i => {
                    return {
                        id: i.pageUrl,
                        type: tags.TYPE_NORMAL,
                        imgInfo: i
                    };
                }),
                { id: tags.ID_END, type: tags.TYPE_END, imgInfo: { heightOfWidth: 1.45 } }
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
        },
        // calc each size of page
        pageSizes() {
            let pageSizes = [];
            for (let pages of this.screens) {
                let maxPageRatio = pages.reduce((max, i) => {
                    max = i.imgInfo.heightOfWidth > max ? i.imgInfo.heightOfWidth : max;
                    return max;
                }, 0);
                let pagesRatio = maxPageRatio / pages.length; // assume the all the widths of each page are 1
                let width;
                if (pagesRatio >= this.screenSize.screenRatio) {
                    width = this.screenSize.height / maxPageRatio;
                } else {
                    width = this.screenSize.width / pages.length;
                }
                pages.forEach(page => {
                    pageSizes.push({
                        id: page.id,
                        height: width * page.imgInfo.heightOfWidth,
                        width
                    });
                });
            }
            return pageSizes;
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
            let style = {};
            let index = this.screens.indexOf(screen);
            if (index < this.bookIndex) {
                style.left = '-100%';
            } else if (index > this.bookIndex) {
                style.left = '100%';
            }
            style['padding-top'] = this.showTopBar ? this.px(this.topBarHeight) : 'initial';
            return style;
        },

        getPageStyle(page) {
            let pageSize = this.pageSizes.find(i => i.id === page.id);
            return { height: this.px(pageSize.height), width: this.px(pageSize.width) };
        },

        watchKeyboard(e) {
            if (e.metaKey || e.ctrlKey) {
                return;
            }
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    if (this.bookIndex > 0) {
                        this.setBookIndex(this.bookIndex - 1);
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case ' ':
                    if (this.bookIndex < this.screens.length - 1) {
                        this.setBookIndex(this.bookIndex + 1);
                    }
                    break;
            }
        },

        getAppSize() {
            if (!this.vueContainer) {
                this.vueContainer = document.querySelector('.vue-container');
            }
            return {
                height: this.vueContainer.offsetHeight,
                width: this.vueContainer.offsetWidth
            };
        },

        watchResize(e) {
            window.clearTimeout(this.resizeTimeoutId);
            this.resizeTimeoutId = window.setTimeout(() => {
                this.appSize = this.getAppSize();
            }, 250);
        },

        selectBookIndex(index) {
            this.setBookIndex(index);
        },

        async checkInstrcutions() {
            if (await SettingService.getFirstOpenBookMode()) {
                InfoService.showBookInstruction(true);
                SettingService.setFirstOpenBookMode(false);
            }
        },

        screenKey(screen) {
            return screen.reduce((sum, i) => sum + i.id, '');
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

.album-book-view {
    flex-direction: column;
    position: relative;
    overflow: hidden;
    > .screen {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        transition: padding 0.3s ease;
        &.animation {
            transition: left 0.5s ease;
        }
        &.rtl {
            flex-direction: row-reverse;
        }
        > .page-container {
            position: relative;
            transition: all 0.3s ease;
            user-select: none;
            > .page {
                background: $book_view_page_bg;
                flex: 1;
                align-self: stretch;
                overflow: hidden;
                > .ehunter-tag {
                    position: absolute;
                    right: 8vh;
                    bottom: 8vh;
                    padding: 1vh 10vh;
                    background: $book_view_ehunter_tag_bg;
                    color: $book_view_ehunter_tag_text_color;
                    font-size: 1.8vh;
                    transform-origin: center;
                    transform: translate(50%, 50%) rotate(-45deg);
                    &.left {
                        left: 7vh;
                        right: initial;
                        transform: translate(-50%, 50%) rotate(45deg);
                    }
                }
                &.start-page {
                    position: relative;
                    justify-content: center;
                    > h1 {
                        font-size: 4vh;
                        font-weight: lighter;
                        margin: 40% 20px;
                        text-align: left;
                        color: $book_view_title_color;
                    }
                }
                &.end-page {
                    position: relative;
                    justify-content: center;
                    align-items: center;
                    > h1 {
                        color: $book_view_end_page_text_color;
                        font-size: 6vh;
                        padding-bottom: 20%;
                    }
                }
            }
        }
    }

    > .bottom-pagination {
        position: absolute;
        bottom: 5%;
        left: 50%;
        transform: translateX(-50%);
        background: $book_view_pagination_bg;
        border-radius: 3px;
        opacity: 0.5;
        box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        &:hover {
            opacity: 1;
        }
    }
}
</style>