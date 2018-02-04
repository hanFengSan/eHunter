<template>
    <div class="album-container">
        <!-- loading view -->
        <div class="loading-container" v-if="imgInfoList.length === 0">
            <span class="loading">loading...</span>
            <p class="tip">
                注意事项:<br>无<br>
            </p>
        </div>
        <!-- top bar view -->
        <TopBar class="top-bar" />
        <!-- panel view -->
        <div class="panel">
            <h4 class="location">{{ (curIndex + 1) + '/' + parser.getSumOfPage() }}</h4>
            <img title="全屏" @click="fullscreen()" class="focus icon" :src="image.fullScreen" />
        </div>
        <!-- scroll view -->
        <awesome-scroll-view 
            ref="scrollView" 
            class="scroll-view" 
            v-if="imgInfoList.length > 0" 
            :on-scroll-stopped="onScrollStopped" 
            @topIn="toggleTopBar(true)"
            @topLeave="toggleTopBar(false)">
            <h1>{{ parser.getTitle() }}</h1>
            <pagination></pagination>
            <!-- 150px is $album-view-width -->
            <div class="img-container" 
                :style="{'min-width': `calc(${widthScale}vw - 150px)`, 'height': `calc(calc(${widthScale}vw - 150px)*${imgInfo.heightOfWidth})` }" 
                v-for="(imgInfo,index) of imgInfoList"
                :key="imgInfo.pageUrl"
                ref="imgContainers">
                <img class="album-item" :src="imgInfo.src" :get-src="getImgSrc(index)" v-if="nearbyArray.indexOf(index) > -1" @error="failLoad(index, $event)" @load="loaded(index)">
                <div class="index">{{ index + 1 }}</div>
                <div class="img-info-panel" v-if="nearbyArray.indexOf(index)>-1">
                    <div class="loading-info" v-if="imgInfo.loadStatus!=loadStatus.error&&imgInfo.src">...加载图片中...</div>
                    <div class="loading-info" v-if="imgInfo.loadStatus!=loadStatus.error&&!imgInfo.src">...加载图片地址中...</div>
                    <div class="loading-info" v-if="imgInfo.loadStatus==loadStatus.error">图片加载失败, 请在图片框右下角点击刷新按钮重新尝试</div>
                </div>
                 <div class="img-console-panel" v-if="imgInfo.loadStatus!=loadStatus.loaded"> 
                    <div class="tips" title-content="载入原图">
                        <svg class="refresh-origin-btn" viewBox="0 0 24 24" width="24" @click="getNewImgSrc(index, 'origin')" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                            <path d="M0 0h24v24H0z" fill="none"/>
                        </svg>
                    </div>
                    <div class="tips" title-content="刷新">
                        <svg class="refresh-btn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="getNewImgSrc(index)">
                            <path d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </awesome-scroll-view>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ImgHtmlParser from 'src/service/parser/ImgHtmlParser.js'
    import AlbumCacheService from 'src/service/storage/AlbumCacheService.js'
    import AwesomeScrollView from './base/AwesomeScrollView.vue'
    import TopBar from './TopBar.vue'
    import Logger from '../utils/Logger.js'
    import image from '../assets/img'
    import Pagination from './widget/Pagination.vue';

    export default {
        name: 'AlbumScrollView',

        data() {
            return {
                parser: new ImgHtmlParser(document.documentElement.innerHTML),
                imgInfoList: [],
                imgBaseUrl: '',
                sumOfPage: '',
                imgUrlMap: new Map(),
                scrollTop: 0,
                image,
                loadStatus: { loading: Symbol(), error: Symbol(), waiting: Symbol(), loaded: Symbol() }, // status of img loading
                nearbyRange: [-2, 3] // the range of necessary imgs, basing on curIndex
            }
        },

        components: {
            AwesomeScrollView,
            TopBar,
            Pagination
        },

        computed: {
            ...mapGetters({
                centerIndex: 'curIndex',
                widthScale: 'albumWidth',
                toggleSyncScroll: 'toggleSyncScroll',
                loadNum: 'loadNum'
            }),
            curIndex() {
                this.scrollTop; // if no use scrollTop, Vue would no watch curIndex, maybe because of next scrollTop in callback.
                let cons = this.$refs.imgContainers;
                if (cons) {
                    if (this.scrollTop !== 0) { // avoiding that in the top, page 1 and page 2 show at the same time, the index is 1
                        const _cons = cons.concat().reverse();
                        let result = cons.indexOf(_cons.find(item => item.offsetTop <= this.scrollTop + window.innerHeight));
                        const index = result === -1 ? (this.$refs.imgContainers.length - 1) : result;
                        this.setIndex(index);
                        return index;
                    } else {
                        this.setIndex(0);
                        return 0;
                    }
                } else {
                    return 0;
                }
            },
            // return a indexes array. the index is index of page, determining the show of pages.
            nearbyArray() {
                Logger.logText('Setting', this.loadNum);
                let curIndex = this.curIndex;
                let _start = curIndex - this.loadNum;
                let start = _start >= 0 ? _start : 0;
                let _end = curIndex + this.loadNum;
                let end = _end >= this.imgInfoList.length - 1 ? this.imgInfoList.length - 1 : _end;
                return this.range(start, end - start + 1);
            }
        },

        watch: {
            centerIndex: {
                handler: function(val, oldVal) {
                    if (this.toggleSyncScroll) {
                        if (this.curIndex !== this.centerIndex) {
                            this.$refs.scrollView.ScrollTo(this.centerIndex === 0 ? 0 : (this.$refs.imgContainers[this.centerIndex].offsetTop - 100), 1000);
                        }
                    }
                },
                deep: true
            }
        },

        created() {
            this.sumOfPage = this.parser.getSumOfPage();
            this.initImgInfoList();
            this.blockEhActions();
        },

        methods: {
            ...mapActions([
                'setIndex',
                'toggleTopBar'
            ]),
            initImgInfoList() {
                AlbumCacheService
                    .getImgInfos(this.parser.getAlbumId(), this.parser.getIntroUrl(), this.parser.getSumOfPage())
                    .then(imgInfoList => {
                        this.imgInfoList = imgInfoList.map(i => {
                            i.isFirstLoad = true;
                            i.loadStatus = this.loadStatus.waiting;
                            return i;
                        });
                        window.setTimeout(() => {
                            this.setIndex(this.parser.getCurPageNum() - 1); // 同步页数
                        }, 1000);
                    });
            },

            // for lazy load img
            getImgSrc(index) {
                // avoid redundant getImgSrc(), overlap refreshing of 'origin'
                if (this.imgInfoList[index].loadStatus !== this.loadStatus.loading) {
                    AlbumCacheService
                        .getImgSrc(this.parser.getAlbumId(), index)
                        .then(src => {
                            if (this.imgInfoList[index].src !== src) {
                                this.imgInfoList[index].src = src;
                                this.imgInfoList[index].loadStatus = this.loadStatus.loading;
                            }
                        });
                }
            },

            // refresh img
            getNewImgSrc(index, mode) {
                this.imgInfoList[index].src = '';
                this.imgInfoList[index].loadStatus = this.loadStatus.loading;
                AlbumCacheService
                    .getNewImgSrc(this.parser.getAlbumId(), index, mode)
                    .then(src => {
                        this.imgInfoList[index].src = src;
                    });
            },

            range(start, count) {
                return Array.apply(0, Array(count)).map(function (element, index) {
                    return index + start;
                });
            },

            onScrollStopped(position) {
                this.scrollTop = position;
            },

            // block some weird actions in eh page
            blockEhActions() {
                var elt = document.createElement('script');
                elt.innerHTML = `
                    if (typeof timerId === 'undefined') {
                        const timerId = window.setInterval(() => {
                            if (document.onkeyup) {
                                window.onpopstate = null;
                                window.clearInterval(timerId);
                                load_image_dispatch = () => {};
                                api_response = () => {};
                                _load_image = () => {};
                                nl = () => {};
                                hookEvent = () => { console.log('hookEvent') };
                                scroll_space = () => {};
                                document.onkeydown = () => {};
                                document.onkeyup = () => {};
                            }
                        }, 1000);
                    }
                `;
                document.body.appendChild(elt);
            },

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
            },

            failLoad(index, e) {
                e.preventDefault();
                if (this.imgInfoList[index].src) {
                    this.imgInfoList[index].loadStatus = this.loadStatus.error;
                    Logger.logText('LOADING', 'loading image failed');
                    if (this.imgInfoList[index].isFirstLoad) { // auto request src when first loading is failed
                        this.imgInfoList[index].isFirstLoad = false;
                        Logger.logText('LOADING', 'reloading image');
                        this.getNewImgSrc(index);
                    }
                }
            },

            loaded(index) {
                this.imgInfoList[index].loadStatus = this.loadStatus.loaded;
            }
        }
    }

</script>

<style lang="scss" scoped>
    @import "~style/_responsive";
    @import "~style/_variables";
    .album-container {
        position: relative;
        > .loading-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: $img_container_color;
            > .loading {
                display: block;
                font-size: 24px;
                font-weight: bolder;
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
            position: absolute;
            bottom: 5px;
            right: 23px;
            z-index: 10;
            color: rgba(white, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            > .location {
                font-size: 14px;
                display: inline-block;
                line-height: 16px;
                height: 16px;
            }
            .icon-container {
                position: relative;
                display: inline-block;
            }
            .focus.icon {
                width: 16px;
                display: inline-block;
                height: 16px;
                cursor: pointer;
                margin: 18px 0 18px 10px;
            }

        }

        > .scroll-view {
            position: relative;
            height: 100vh;
            h1 {
                color: #c9cacf;
                padding: 10px 20px;
                font-size: 18px;
                text-align: center;
                margin-top: 60px;
            }
            .img-container {
                position: relative;
                // width: 1280px;
                width: 10px;
                transition: all 0.3s ease;
                margin: 35px auto;
                box-shadow: inset 0px 0px 0px 5px $img_container_color;
                > .index {
                    position: absolute;
                    color: $img_container_color;
                    font-weight: bolder;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 80px;
                    z-index: -1;
                }
                > .img-info-panel {
                    position: absolute;
                    top: calc(50% + 80px);
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: $img_container_color;
                    font-size: 14px;
                    z-index: -1;
                }
                > .img-console-panel {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    z-index: 1;
                    display: flex;
                    flex-direction: row;
                    .refresh-btn {
                        fill: $img_container_color;
                        height: 20px;
                        width: 20px;
                        display: block;
                        margin: 0 auto;
                        cursor: pointer;
                        &:hover {
                            fill: $primary_color;
                        }
                    }
                    .refresh-origin-btn {
                        fill: $img_container_color;
                        height: 20px;
                        width: 20px;
                        display: block;
                        margin: 0 auto;
                        cursor: pointer;
                        &:hover {
                            fill: $primary_color;
                        }
                    }
                }
                > .album-item {
                    width: inherit;
                    min-width: inherit;
                    height: inherit;
                }
            }
        }
    }
</style>
