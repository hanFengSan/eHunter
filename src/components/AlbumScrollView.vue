<template>
    <div class="album-container" @click.stop="">
        <div class="loading-container" v-if="imgInfoList.length === 0">
            <span class="loading">loading...</span>
            <p class="tip">
                注意事项:<br>1.&nbsp;请在图册详情页(就是前面一页)上使用小图查看预览图, 即使用'normal'模式, 否则无法加载<br>
            </p>
        </div>
        <div class="panel">
            <h4 v-show="showPagination" class="location">{{ (curIndex + 1) + '/' + parser.getSumOfPage() }}</h4>
            <img title="全屏" @click="fullscreen()" class="focus icon" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDIyIDIyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyMiAyMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00LDE4aDE0VjRINFYxOHogTTYsNmgxMHYxMEg2VjZ6IiBmaWxsPSIjNTk1ZDYyIi8+CgkJPHBvbHlnb24gcG9pbnRzPSIyLDE2IDAsMTYgMCwyMiA2LDIyIDYsMjAgMiwyMCAgICIgZmlsbD0iIzU5NWQ2MiIvPgoJCTxwb2x5Z29uIHBvaW50cz0iMiwyIDYsMiA2LDAgMCwwIDAsNiAyLDYgICAiIGZpbGw9IiM1OTVkNjIiLz4KCQk8cG9seWdvbiBwb2ludHM9IjIwLDIwIDE2LDIwIDE2LDIyIDIyLDIyIDIyLDE2IDIwLDE2ICAgIiBmaWxsPSIjNTk1ZDYyIi8+CgkJPHBvbHlnb24gcG9pbnRzPSIxNiwwIDE2LDIgMjAsMiAyMCw2IDIyLDYgMjIsMCAgICIgZmlsbD0iIzU5NWQ2MiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />
        </div>        
        <awesome-scroll-view ref="scrollView" class="scroll-view" v-if="imgInfoList.length > 0" :on-scroll-stopped="onScrollStopped">
            <h1>{{ parser.getTitle() }}</h1>
            <!-- 150px is $album-view-width -->
            <div class="img-container" :style="{'min-width': `calc(${widthScale}vw - 150px)`, 'height': `calc(calc(${widthScale}vw - 150px)*${imgInfo.heightOfWidth})` }" v-for="(imgInfo,index) of imgInfoList"
                ref="imgContainers">
                <img class="album-item" :src="imgInfo.src" :get-src="getImgSrc(index)" v-if="nearbyArray.indexOf(index) > -1" @error="failLoad(index, $event)" @load="loaded(index)">
                <div class="index">{{ index + 1 }}</div>
                <div class="img-info-panel" v-if="nearbyArray.indexOf(index)>-1">
                    <div class="loading-info" v-if="imgInfo.loadStatus!=loadStatus.error&&imgInfo.src">...加载图片中...</div>
                    <div class="loading-info" v-if="imgInfo.loadStatus!=loadStatus.error&&!imgInfo.src">...加载图片地址中...</div>
                    <div class="loading-info" v-if="imgInfo.loadStatus==loadStatus.error">图片加载失败, 请在图片框右下角点击刷新按钮重新尝试</div>
                </div>
                <div class="img-console-panel" v-if="imgInfo.loadStatus!=loadStatus.loaded">
                    <svg class="refresh-btn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" title="刷新" @click="getNewImgSrc(index)">
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                    </svg>
                </div>
            </div>
        </awesome-scroll-view>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ImgHtmlParser from 'src/service/parser/ImgHtmlParser.js'
    // import Platform from 'src/service/PlatformService'
    import AlbumCacheService from 'src/service/storage/AlbumCacheService.js'
    import AwesomeScrollView from './base/AwesomeScrollView.vue'

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
                loadStatus: { loading: Symbol(), error: Symbol(), waiting: Symbol(), loaded: Symbol() }, // status of img loading
                nearbyRange: [-2, 3] // the range of necessary imgs, basing curIndex
            }
        },

        components: {
            AwesomeScrollView
        },

        computed: {
            ...mapGetters({
                centerIndex: 'curIndex',
                widthScale: 'albumWidth',
                showPagination: 'showPagination'
            }),
            curIndex() {
                this.scrollTop; // if no use scrollTop, Vue would no watch curIndex, maybe because of next scrollTop in callback.
                let cons = this.$refs.imgContainers;
                if (cons) {
                    const _cons = cons.concat().reverse();
                    let result = cons.indexOf(_cons.find(item => item.offsetTop <= this.scrollTop + window.innerHeight));
                    const index = result === -1 ? (this.$refs.imgContainers.length - 1) : result;
                    this.setIndex(index);
                    return index;
                } else {
                    return 0;
                }
            },
            nearbyArray() {
                let curIndex = this.curIndex;
                let _start = curIndex + this.nearbyRange[0];
                let start = _start >= 0 ? _start : 0;
                let _end = curIndex + this.nearbyRange[1];
                let end = _end >= this.imgInfoList.length - 1 ? this.imgInfoList.length - 1 : _end;
                return this.range(start, end - start + 1);
            }
        },

        watch: {
            centerIndex() {
                if (this.curIndex !== this.centerIndex) {
                    this.$refs.scrollView.ScrollTo(this.$refs.imgContainers[this.centerIndex].offsetTop - 100, 1000);
                }
            }
        },

        created() {
            this.sumOfPage = this.parser.getSumOfPage();
            this.initImgInfoList();
            this.blockEhActions();
        },

        methods: {
            ...mapActions([
                'setIndex'
            ]),
            initImgInfoList() {
                AlbumCacheService.instance
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
                AlbumCacheService.instance
                    .getImgSrc(this.parser.getAlbumId(), index)
                    .then(src => {
                        if (this.imgInfoList[index].src !== src) {
                            this.imgInfoList[index].src = src;
                            this.imgInfoList[index].loadStatus = this.loadStatus.loading;
                        }
                    });
            },

            getNewImgSrc(index) {
                this.imgInfoList[index].src = '';
                this.imgInfoList[index].loadStatus = this.loadStatus.loading;
                AlbumCacheService.instance
                    .getNewImgSrc(this.parser.getAlbumId(), index)
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
                            if (window.onpopstate) {
                                window.onpopstate = null;
                                window.clearInterval(timerId);
                                load_image_dispatch = () => {};
                                api_response = () => {};
                                _load_image = () => {};
                                nl = () => {};
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
                this.imgInfoList[index].loadStatus = this.loadStatus.error;
                console.log('加载图片失败, load image failed');
                e.preventDefault();
                if (this.imgInfoList[index].isFirstLoad) { // auto request src when first loading is failed
                    this.imgInfoList[index].isFirstLoad = false;
                    console.log('重新加载图片, reloading');
                    this.getNewImgSrc(index);
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
                color: $title_color;
                padding: 10px 20px;
                font-size: 18px;
                text-align: center;
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
                    > .refresh-btn {
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
