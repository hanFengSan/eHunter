<template>
<div class="album-scroll-view">
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
        <h4 class="location">{{ (curIndex + 1) + '/' + AlbumService.getSumOfPage() }}</h4>
        <img title="全屏" @click="fullscreen()" class="focus icon" :src="image.fullScreen" />
    </div>
    <div class="preload">
        <img :src="src" width="100" height="144" v-for="src of preloadImgs" :key="src">
    </div>
    <!-- scroll view -->
    <awesome-scroll-view
        ref="scrollView" 
        class="scroll-view" 
        v-if="imgInfoList.length > 0" 
        :on-scroll-stopped="onScrollStopped" 
        @topIn="toggleTopBar(true)"
        @topLeave="toggleTopBar(false)">
        <h1>{{ AlbumService.getTitle() }}</h1>
        <pagination v-if="volumeSum != 1" class="top-pagination" :cur-index="curVolume" :page-sum="volumeSum" @change="selectVol"/>
        <div class="page-container" 
            ref="pageContainers" 
            v-for="(imgInfo, i) of volImgInfoList" 
            :key="imgInfo.pageUrl"
            :style="{'width':`${widthScale}%`,'padding-bottom':`${widthScale*imgInfo.heightOfWidth}%`}">
            <page-view
                :index="index(i, imgInfo.pageUrl)"
                :active="nearbyArray.indexOf(index(i)) > -1"
                :album-id="AlbumService.getAlbumId()"
                :data="imgInfo"
            ></page-view>
        </div>
        <pagination v-if="volumeSum != 1" class="bottom-pagination" :cur-index="curVolume" :page-sum="volumeSum" @change="selectVol"/>
    </awesome-scroll-view>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ImgHtmlParser from 'src/service/parser/ImgHtmlParser.js'
import AwesomeScrollView from './base/AwesomeScrollView.vue'
import TopBar from './TopBar.vue'
import Logger from '../utils/Logger.js'
import image from '../assets/img'
import Pagination from './widget/Pagination.vue'
import PageView from './PageView.vue'
import AlbumService from '../service/AlbumService'

export default {
    name: 'AlbumScrollView',

    data() {
        return {
            parser: new ImgHtmlParser(document.documentElement.innerHTML),
            imgInfoList: [],
            pageUrlsObj: {}, // hash, for fast get page index by pagUrl
            scrollTop: 0,
            curIndex: 0,
            preloadImgs: []
        }
    },

    components: {
        AwesomeScrollView,
        TopBar,
        Pagination,
        PageView
    },

    computed: {
        ...mapGetters({
            centerIndex: 'curIndex',
            widthScale: 'albumWidth',
            loadNum: 'loadNum',
            volumeSize: 'volumeSize',
            volFirstIndex: 'volFirstIndex',
            curVolume: 'curVolume',
            volumePreloadCount: 'volumePreloadCount'
        }),

        // return a indexes array. the index is index of page, determining the show of pages.
        nearbyArray() {
            let curIndex = this.curIndex;
            let _start = curIndex - this.loadNum;
            let start = _start >= 0 ? _start : 0;
            let _end = curIndex + this.loadNum;
            let end = _end >= this.imgInfoList.length - 1 ? this.imgInfoList.length - 1 : _end;
            return this.range(start, end - start + 1);
        },

        volImgInfoList() {
            return this.imgInfoList.slice(this.volFirstIndex, this.volFirstIndex + this.volumeSize);
        },

        volumeSum() {
            return Math.ceil(AlbumService.getSumOfPage() / this.volumeSize);
        },

        AlbumService: () => AlbumService,
        image: () => image
    },

    watch: {
        centerIndex: {
            handler: function(val, oldVal) {
                if (this.curIndex !== this.centerIndex) {
                    // sync index
                    if (this.centerIndex === this.volFirstIndex) {
                        this.$refs.scrollView.ScrollTo(0, 1000);
                        this.curIndex = this.volFirstIndex;
                    } else {
                        // Logger.logText('Album', this.volIndex(this.centerIndex));
                        this.$refs.scrollView.ScrollTo(this.$refs.pageContainers[this.volIndex(this.centerIndex)].offsetTop - 100, 1000);
                    }
                }
                // if in the last page of current volume, preload next volume
                if (val === this.volFirstIndex + this.volumeSize - 1) {
                    this.preloadVolume();
                }
            },
            deep: true
        },

        // watch scrollTop to calculate curIndex
        scrollTop() {
            // sort again, because if changing volume size, it may be out-of-order
            let cons = this.$refs.pageContainers.sort((a, b) => a.offsetTop - b.offsetTop);
            if (cons) {
                if (this.scrollTop !== 0) { // avoiding that in the top, page 1 and page 2 show at the same time, the index is 1
                    const _cons = cons.concat().reverse();
                    let result = cons.indexOf(_cons.find(item => item.offsetTop <= this.scrollTop + window.innerHeight));
                    const volIndex = result === -1 ? (this.$refs.pageContainers.length - 1) : result;
                    const index = volIndex + this.volFirstIndex;
                    this.setIndex(index);
                    this.curIndex = index;
                } else {
                    this.setIndex(this.volFirstIndex);
                    this.curIndex = this.volFirstIndex;
                }
            } else {
                this.curIndex = this.volFirstIndex;
            }
        }
    },

    created() {
        this.curIndex = this.volFirstIndex;
        this.initImgInfoList();
    },

    methods: {
        ...mapActions([
            'setIndex',
            'toggleTopBar'
        ]),

        async initImgInfoList() {
            this.imgInfoList = await AlbumService.getImgInfos();
            // init pageUrlsObj
            for (let i = 0; i < this.imgInfoList.length; i++) {
                this.pageUrlsObj[this.imgInfoList[i].pageUrl] = i;
            }
            // sync location of page
            window.setTimeout(() => {
                this.setIndex(AlbumService.getCurPageNum() - 1);
            }, 1000);
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

        // get index of album for index of current volume
        index(i, pageUrl) {
            if (pageUrl) { // fix errors in delay methods
                return this.pageUrlsObj[pageUrl];
            } else {
                return this.volFirstIndex + i;
            }
        },

        // get index of current volume for index of album
        volIndex(i) {
            return i - this.volFirstIndex;
        },

        selectVol(index) {
            // this.$refs.scrollView.ScrollTo(0, 1000);
            let newIndex = index * this.volumeSize; // set index to first index of target volume
            this.setIndex(newIndex);
        },

        // preload image
        async preload(index) {
            if (this.preloadImgs.length === this.volumePreloadCount) {
                this.preloadImgs = [];
            }
            this.preloadImgs.push(await AlbumService.getImgSrc(index));
        },

        // preload next volume
        preloadVolume() {
            if (this.volumeSum > this.curVolume + 1) {
                let volLastIndex = this.volFirstIndex + this.volumeSize - 1;
                for (let i = 1; i <= this.volumePreloadCount; i++) {
                    if (AlbumService.getSumOfPage() - 1 >= volLastIndex + i) {
                        this.preload(volLastIndex + i);
                    }
                }
                Logger.logText('Album', 'preload volume');
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~style/_responsive";
@import "~style/_variables";
* div {
    display: flex;
}
.album-scroll-view {
    position: relative;
    flex-direction: column;
    align-items: center;
    > .loading-container {
        position: absolute;
        flex-direction: column;
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

    > .preload {
        position: absolute;
        top: 0;
        left: 0;
        width: 200px;
        height: 144px;
        z-index: -10;
        opacity: 0;
    }

    > .scroll-view {
        flex-direction: column;
        align-items: center;
        height: 100vh;
        width: 100%;
        h1 {
            color: #c9cacf;
            padding: 10px 20px;
            font-size: 18px;
            text-align: center;
            margin-top: 60px;
        }
        > .top-pagination {
            margin-top: 20px;
        }
        > .bottom-pagination {
            margin-bottom: 40px;
        }
        .page-container {
            transition: all 0.3s ease;
            margin: 35px 0;
            background: red;
            height: 0;
            position: relative;
        }
    }
}
</style>
