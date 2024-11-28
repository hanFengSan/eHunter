<template>
    <aside class="thumb-content">
        <awesome-scroll-view ref="scrollView"  class="thumb-scroll-view" :isThumbView="true">
            <div class="header">
                <span class="app-name">EHUNTER</span>
            </div>
            <!-- 160 is $thumb-view-height -->
            <div class="indicator" :style="{top: px(160*(curIndex.val - volFirstIndex))}"></div>
            <div class="thumb-container" @click="select(index(i))" v-for="(item, i) of volThumbs" :key="item.id" ref="thumbContainers">
                <template v-if="(readingMode === 0 && showThumbView) || (readingMode ===1 && showThumbViewInBook)">
                    <div class="thumb spirit-mode" v-if="item.mode === 0" :style="getSpriteStyle(item)"></div>
                    <div class="thumb img-mode" v-if="item.mode === 1" :style="{background: `transparent url(${item.src}) no-repeat`, 'background-size': 'contain'}"></div>
                </template>
                <div class="hover-mask"></div>
                <div class="index">{{ index(i) + 1 }}</div>
            </div>
        </awesome-scroll-view>
    </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AwesomeScrollView from './base/AwesomeScrollView.vue';
import * as tags from '../assets/value/tags';
// import Logger from '../utils/Logger';

export default {
    name: 'ThumbScrollView',

    inject: ['service'],
    
    props: {
        thumbInfos: {
            type: Array
        },
        pageCount: {
            type: Number
        }
    },

    components: {
        AwesomeScrollView
    },

    computed: {
        ...mapGetters({
            centerIndex: 'curIndex',
            volumeSize: 'volumeSize',
            _volFirstIndex: 'volFirstIndex',
            readingMode: 'readingMode',
            showThumbView: 'showThumbView',
            showThumbViewInBook: 'showThumbViewInBook',
            readingMode: 'readingMode'
        }),

        volFirstIndex() {
            if (this.readingMode === 0) {
                return this._volFirstIndex;
            }
            // let book mode compatible with volume, using one volume
            if (this.readingMode === 1) {
                return 0;
            }
        },

        // the thumbs of current volume
        volThumbs() {
            if (this.readingMode === 0) {
                return this.thumbInfos.slice(this.volFirstIndex, this.volFirstIndex + this.volumeSize);
            }
            // let book mode compatible with volume, using one volume
            if (this.readingMode === 1) {
                return this.thumbInfos;
            }
        },

        curIndex() {
            return this.service.album.getRealCurIndexInfo(this.pageCount, this.centerIndex)
        }
    },

    watch: {
        centerIndex: {
            handler: function(val, oldVal) {
                // sync pagination
                if (this.curIndex.updater !== tags.THUMB_VIEW) {
                    if (this.curIndex.val !== this.volFirstIndex && this.$refs.thumbContainers) {
                        // sort again, because if changing volume size, it may be out-of-order
                        let cons = this.$refs.thumbContainers.sort((a, b) => a.offsetTop - b.offsetTop);
                        // Logger.logText('Thumb', this.curIndex.val);
                        if (cons[this.volIndex(this.curIndex.val)]) {
                            this.$refs.scrollView.ScrollTo(cons[this.volIndex(this.curIndex.val)].offsetTop, 1000);
                        }
                    } else {
                        this.$refs.scrollView.ScrollTo(0, 1000); // if is page 1, scroll to top, cuz of having a header
                    }
                }
            },
            deep: true
        }
    },

    methods: {
        ...mapActions(['setIndex']),

        select(index) {
            this.setIndex({ val: index, updater: tags.THUMB_VIEW });
        },

        // get index of album for index of current volume
        index(i) {
            return this.volFirstIndex + i;
        },

        // get index of current volume for index of album
        volIndex(i) {
            return i - this.volFirstIndex;
        },

        getSpriteStyle(item) {
            if (item.height > item.width) {
                return `${item.style}; height: ${item.height}px; width: ${item.width}px; transform: scale(${144 / item.height}); position: absolute;`
            } else {
                return `${item.style}; height: ${item.height}px; width: ${item.width}px; transform: scale(${100 / item.width}); position: absolute;`
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';
.thumb-content {
    position: relative;
    .thumb-scroll-view {
        position: relative;
        background: $thumb_scroll_view_bg;
        height: 100%;
        display: inline-block;
        width: $thumb-view-width;
        > .header {
            position: relative;
            height: $header-height;
            background: $header-bg;
            > .app-name {
                color: white;
                font-weight: bolder;
                font-size: 18px;
                display: block;
                position: absolute;
                white-space: nowrap;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .more-vertical-solid.icon {
                display: block;
                margin-top: 18px;
                color: white;
                position: absolute;
                margin-left: 9px;
                width: 2px;
                height: 2px;
                border-radius: 50%;
                border: solid 1px currentColor;
                background-color: currentColor;
                &:before {
                    content: '';
                    position: absolute;
                    left: -1px;
                    top: -8px;
                    width: 2px;
                    height: 2px;
                    border-radius: 50%;
                    border: solid 1px currentColor;
                    background-color: currentColor;
                }
                &:after {
                    content: '';
                    position: absolute;
                    left: -1px;
                    top: 6px;
                    width: 2px;
                    height: 2px;
                    border-radius: 50%;
                    border: solid 1px currentColor;
                    background-color: currentColor;
                }
            }
        }
        .thumb-container {
            position: relative;
            width: $thumb-view-width;
            padding: $thumb-view-margin 0;
            margin: 0;
            height: $thumb-view-height;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            > .thumb {
                display: block;
                width: $thumb-width;
                // 1/1.44 is the default scale of ehentai's thumb. 100px width per one thumb in img.
                height: $thumb-width * 144 / 100;
                transition: all 0.5s ease;
            }
            > .loc {
                display: block;
                color: rgba(white, 0.5);
                font-size: 12px;
            }
            > .index {
                display: none;
            }
            &:hover {
                > .hover-mask {
                    position: absolute;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    background: rgba($indicator_color, 0.2);
                }
                > .index {
                    position: absolute;
                    display: block;
                    font-weight: bolder;
                    font-size: 40px;
                    color: rgba($body_bg, 0.8);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 20;
                    user-select: none;
                    cursor: default;
                }
            }
        }
        .indicator {
            position: absolute;
            box-sizing: border-box;
            margin-top: $header-height;
            height: $thumb-view-height;
            left: 0;
            top: 0;
            right: 0;
            background: rgba($indicator_color, 0.3);
            border-left: 3px solid rgba($indicator_color, 0.5);
            border-right: 3px solid rgba($indicator_color, 0.5);
            transition: all 0.5s ease;
            z-index: 10;
            pointer-events: none;
        }
    }
}
</style>
