<template>
    <div class="manga-container">
        <div class="loading-container" v-if="imgInfoList.length === 0">
            loading...
        </div>
        <div ref="scrollView" class="scroll-view" @scroll.stop="onScroll" v-if="imgInfoList.length > 0">
            <h1>{{ parser.getTitle() }}</h1>
            <h1 class="location">{{ curIndex }}</h1>
            <div class="img-container" :style="{ height: `calc(calc(80vw - 150px)*${imgInfo.heightOfWidth})` }" v-for="(imgInfo,index) of imgInfoList"
                ref="imgContainers">
                <img class="manga-item" :src="imgInfo.src" :get-src="getImgSrc(index)" v-if="nearbyArray.indexOf(index) > -1">
                <label class="index">{{ index }}</label>
        </div>
    </div>
    </div>
</template>

<script>
    import ImgHtmlParser from 'src/service/parser/ImgHtmlParser.js'
    import AlbumCacheService from 'src/service/storage/AlbumCacheService.js'

    export default {
        name: 'MangaScrollView',

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

        computed: {
            curIndex() {
                this.scrollTop; // if no use scrollTop, Vue would no watch curIndex, maybe because of next scrollTop in callback.
                let cons = this.$refs.imgContainers;
                if (cons) {
                    // console.log(cons.indexOf(cons.find(item => item.offsetTop > this.scrollTop)));
                    let result = cons.indexOf(cons.find(item => item.offsetTop > this.scrollTop));
                    return result === -1 ? (this.$refs.imgContainers.length - 1) : result;
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

        created() {
            this.sumOfPage = this.parser.getSumOfPage();
            this.initImgInfoList();
            this.$nextTick(() => {
                console.log('next tick');
            })
        },

        methods: {
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
                // if (!this.imgInfoList[index].src) {
                //     (new TextReqService(this.imgInfoList[index].pageUrl))
                //         .request()
                //         .then(text => {
                //             this.imgInfoList[index].src = new ImgHtmlParser(text).getImgUrl();
                //         });
                // }
            },

            initImgSize() {

            },
            range(start, count) {
                return Array.apply(0, Array(count)).map(function (element, index) {
                    return index + start;
                });
            },

            detectScrollStop() {
                window.clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    this.onScrollStopped();
                }, 150);
            },

            onScrollStopped() {
                this.scrollTop = this.$refs.scrollView.scrollTop;
            },

            onScroll(position) {
                this.detectScrollStop();
            }

        }
    }

</script>

<style lang="scss" scoped>
    @import "~style/_responsive";
    @import "~style/_variables";
    .manga-container {
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
        > .scroll-view {
            overflow-y: auto;
            height: 100vh;
            > h1 {
                color: $title_color;
                padding: 10px 20px;
                font-size: 18px;
                text-align: center;
                &.location {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                }
            }
            > .img-container {
                position: relative;
                width: 1280px;
                max-width: calc(80vw - 150px);
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
                > .manga-item {
                    width: 1280px;
                    max-width: calc(80vw - 150px);
                    height: inherit;
                }
            }
        }
    }
</style>