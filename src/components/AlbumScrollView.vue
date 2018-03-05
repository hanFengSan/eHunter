<template>
<div class="album-scroll-view">
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
        <div 
            class="page-container" 
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
import { mapGetters, mapActions } from 'vuex';
import AwesomeScrollView from './base/AwesomeScrollView.vue';
import TopBar from './TopBar.vue';
import Logger from '../utils/Logger.js';
import image from '../assets/img';
import Pagination from './widget/Pagination.vue';
import PageView from './PageView.vue';
import AlbumService from '../service/AlbumService';
import * as tags from '../assets/value/tags';

export default {
    name: 'AlbumScrollView',

    props: {
        imgInfoList: {
            type: Array
        },
        pageUrlsObj: {
            type: Object
        }
    },

    data() {
        return {
            scrollTop: 0,
            preloadImgs: []
        };
    },

    components: {
        AwesomeScrollView,
        TopBar,
        Pagination,
        PageView
    },

    created() {
        setTimeout(() => this.setIndex({ val: this.curIndex.val, updater: tags.SCROLL_VIEW_VOL }), 1000);
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
            let curIndex = this.curIndex.val;
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
            return Math.ceil(AlbumService.getPageCount() / this.volumeSize);
        },

        AlbumService: () => AlbumService,
        image: () => image,
        curIndex() {
            return AlbumService.getRealCurIndex(this.centerIndex)
        }
    },

    watch: {
        centerIndex: {
            handler: function(val, oldVal) {
                if (this.curIndex.updater !== tags.SCROLL_VIEW && this.$refs.pageContainers) {
                    // sync index
                    if (this.curIndex.val === this.volFirstIndex) {
                        this.$refs.scrollView.ScrollTo(0, 1000);
                    } else {
                        this.$refs.scrollView.ScrollTo(
                            this.$refs.pageContainers[this.volIndex(this.curIndex.val)].offsetTop - 100,
                            1000
                        );
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
            let index;
            if (cons) {
                if (this.scrollTop !== 0) {
                    // avoiding that in the top, page 1 and page 2 show at the same time, the index is 1
                    const _cons = cons.concat().reverse();
                    let result = cons.indexOf(
                        _cons.find(item => item.offsetTop <= this.scrollTop + window.innerHeight)
                    );
                    const volIndex = result === -1 ? this.$refs.pageContainers.length - 1 : result;
                    index = volIndex + this.volFirstIndex;
                } else {
                    index = this.volFirstIndex;
                }
                if (index !== this.curIndex.val) {
                    // avoiding to update updater of curIndex
                    this.setIndex({ val: index, updater: tags.SCROLL_VIEW });
                }
            }
        }
    },

    methods: {
        ...mapActions(['setIndex', 'toggleTopBar']),

        range(start, count) {
            return Array.apply(0, Array(count)).map(function(element, index) {
                return index + start;
            });
        },

        onScrollStopped(position) {
            this.scrollTop = position;
        },

        // get index of album for index of current volume
        index(i, pageUrl) {
            if (pageUrl) {
                // fix errors in delay methods
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
            this.setIndex({ val: newIndex, updater: tags.SCROLL_VIEW_VOL });
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
                    if (AlbumService.getPageCount() - 1 >= volLastIndex + i) {
                        this.preload(volLastIndex + i);
                    }
                }
                Logger.logText('Album', 'preload volume');
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import '~style/_responsive';
@import '~style/_variables';
.album-scroll-view {
    position: relative;
    flex-direction: column;
    align-items: center;
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
        height: 100%;
        width: 100%;
        h1 {
            color: #c9cacf;
            padding: 10px 20px;
            font-size: 18px;
            text-align: center;
            margin-top: 60px;
        }
        > .top-pagination {
            margin-top: 15px;
        }
        > .bottom-pagination {
            margin-bottom: 30px;
        }
        .page-container {
            transition: all 0.3s ease;
            margin: 70px auto;
            height: 0;
            position: relative;
            &:first-of-type {
                margin-top: 35px;
            }
            &:last-of-type {
                margin-bottom: 35px;
            }
        }
    }
}
</style>
