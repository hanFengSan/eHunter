<template>
    <div class="album-container" @click.stop="">
        <div class="loading-container" v-if="imgInfoList.length === 0">
            loading...
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
                <img class="album-item" :src="imgInfo.src" :get-src="getImgSrc(index)" v-if="nearbyArray.indexOf(index) > -1">
                <label class="index">{{ index + 1 }}</label>
            </div>
        </awesome-scroll-view>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ImgHtmlParser from 'src/service/parser/ImgHtmlParser.js'
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
                    let result = cons.indexOf(cons.find(item => item.offsetTop >= this.scrollTop));
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
        },

        methods: {
            ...mapActions([
                'setIndex'
            ]),
            initImgInfoList() {
                AlbumCacheService.instance
                    .getImgInfos(this.parser.getAlbumId(), this.parser.getIntroUrl(), this.parser.getSumOfPage())
                    .then(imgInfoList => {
                        this.imgInfoList = imgInfoList;
                    });
            },

            // for lazy load img
            getImgSrc(index) {
                AlbumCacheService.instance
                    .getImgSrc(this.parser.getAlbumId(), index)
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

            fullscreen() {
                if (!document.webkitCurrentFullScreenElement) {
                    document.querySelector('.vue-container').webkitRequestFullScreen();
                } else {
                    document.webkitExitFullscreen()
                }
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
            left: calc(50% - 75px);
            transform: translate(-50%, -50%);
            color: $img_container_color;
            font-size: 24px;
            font-weight: bolder;
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
                > .album-item {
                    width: inherit;
                    min-width: inherit;
                    height: inherit;
                }
            }
        }
    }
</style>
