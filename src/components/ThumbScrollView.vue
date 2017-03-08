<template>
    <div class="thumb-scroll-view">
        <div class="indicator" :style="{top: px(154*curIndex)}"></div>
        <div class="thumb-container" @click="select(index)" v-for="(item, index) of thumbs">
            <div class="thumb" :style="{background: `transparent url(${item.url}) -${item.offset}px 0 no-repeat`}"></div>
            <div class="hover-mask"></div>
            <!--<span class="loc">{{ index }}</span>-->
        </div>
    </div>
</template>

<script>
    import ImgHtmlParser from 'src/service/parser/ImgHtmlParser.js'
    import AlbumCacheService from 'src/service/storage/AlbumCacheService.js'
    import CookieUtil from 'src/utils/CookieUtil.js'

    export default {
        name: 'ThumbScrollView',

        data() {
            return {
                parser: new ImgHtmlParser(document.documentElement.innerHTML),
                info: window.info,
                imgList: [], // origin img list
                thumbs: [],
                curIndex: 0
            }
        },

        created() {
            // set Cookie for small thumb, important
            // cSpell:ignore uconfig
            CookieUtil.setItem('uconfig', 'dm_t');
            this.initImgList();
        },

        methods: {
            px(num) {
                return `${num}px`;
            },
            select(index) {
                this.curIndex = index;
            },

            initImgList() {
                AlbumCacheService.instance
                .getThumbs(this.parser.getAlbumId(), this.parser.getIntroUrl(), this.parser.getSumOfPage())
                .then(thumbs => {
                    this.thumbs = thumbs;
                });
            }
        }
    }

</script>

<style lang="scss" scoped>
    @import "~style/_responsive";
    @import "~style/_variables";
    $indicator_color: white;
    .thumb-scroll-view {
        position: relative;
        background: $thumb_scroll_view_bg;
        min-height: 100vh;
        height: 500px;
        display: inline-block;
        overflow-y: auto;
        width: 150px;
        > .thumb-container {
            position: relative;
            width: 150px;
            margin: 4px auto;
            height: 150px;
            text-align: center;
            > .thumb {
                margin: 1px auto 0;
                width: 100px;
                height: 144px;
                transition: all 0.5s ease;
            }
            > .loc {
                display: block;
                color: rgba(white, .5);
                font-size: 12px;
            }
            &:hover {
                >.hover-mask {
                    position: absolute;
                    top: -5px;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    background: rgba($indicator_color, .2);
                }
            }
        }
        > .indicator {
            position: absolute;
            box-sizing: border-box;
            height: 154px;
            left: 0;
            top: 0;
            right: 0;
            background: rgba($indicator_color, .3);
            // border-top: 1px solid $indicator_color;
            // border-bottom: 1px solid $indicator_color;
            border-left: 3px solid rgba($indicator_color, .5);
            border-right: 3px solid rgba($indicator_color, .5);
            transition: all 0.5s ease;
            z-index: 10;
        }
    }
</style>