<template>
    <div class="album-container">
        <div class="loading-container" v-if="imgInfoList.length === 0">
            loading...
        </div>
        <h4 class="location">{{ (curIndex + 1) + '/' + parser.getSumOfPage() }}</h4>        
        <awesome-scroll-view ref="scrollView" class="scroll-view" v-if="imgInfoList.length > 0" :on-scroll-stopped="onScrollStopped">
            <h1>{{ parser.getTitle() }}</h1>
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
                widthScale: 'albumWidth'
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

            onScrollStopped(position) {
                this.scrollTop = position;
            },

            syncIndex() {
                console.log('data changed');
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
        > .location {
            position: absolute;
            bottom: 5px;
            right: 23px;
            z-index: 10;
            font-size: 14px;
            color: rgba(white, 0.2);
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
