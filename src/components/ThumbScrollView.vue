<template>
    <div class="thumb-content">
        <awesome-scroll-view ref="scrollView" :is-hidden="true" class="thumb-scroll-view" @mouseenter="hover=true" @mouseleave="hover=false">
            <div class="indicator" :style="{top: px(154*curIndex)}"></div>
            <div class="thumb-container" @click="select(index)" v-for="(item, index) of thumbs" ref="thumbContainers">
                <div class="thumb" :style="{background: `transparent url(${item.url}) -${item.offset}px 0 no-repeat`}"></div>
                <div class="hover-mask"></div>
                <div class="index">{{ index + 1 }}</div>
            </div>
        </awesome-scroll-view>
        <div class="toggle-button"></div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ImgHtmlParser from 'src/service/parser/ImgHtmlParser.js'
    import AlbumCacheService from 'src/service/storage/AlbumCacheService.js'
    import CookieUtil from 'src/utils/CookieUtil.js'
    import AwesomeScrollView from './base/AwesomeScrollView.vue'


    export default {
        name: 'ThumbScrollView',

        data() {
            return {
                parser: new ImgHtmlParser(document.documentElement.innerHTML),
                info: window.info,
                imgList: [], // origin img list
                thumbs: [],
                curIndex: 0,
                hover: false
            }
        },

        components: {
            AwesomeScrollView
        },

        created() {
            // set Cookie for small thumb, important
            CookieUtil.setItem('uconfig', 'dm_t');
            this.initImgList();
            console.log('store');
            console.log(this.$store);
        },

        computed: {
            ...mapGetters({
                centerIndex: 'curIndex'
            })
        },

        watch: {
            centerIndex() {
                if (this.curIndex !== this.centerIndex && !this.hover) {
                    this.curIndex = this.centerIndex;
                    this.$refs.scrollView.ScrollTo(this.$refs.thumbContainers[this.centerIndex].offsetTop, 1000);
                }
            }
        },

        methods: {
            ...mapActions([
                'setIndex'
            ]),
            select(index) {
                this.curIndex = index;
                this.setIndex(index);
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
    .thumb-content {
        position: relative;
        .thumb-scroll-view {
            position: relative;
            background: $thumb_scroll_view_bg;
            min-height: 100vh;
            height: 500px;
            display: inline-block;
            width: $thumb-view-size;
            .thumb-container {
                position: relative;
                width: $thumb-view-size;
                margin: $thumb-view-margin auto;
                height: $thumb-view-size;
                text-align: center;
                > .thumb {
                    margin: 1px auto 0;
                    width: $thumb-width;
                    // 1/1.44 is the default scale of ehentai's thumb
                    height: $thumb-width * 144 / 100; 
                    transition: all 0.5s ease;
                }
                > .loc {
                    display: block;
                    color: rgba(white, .5);
                    font-size: 12px;
                }
                > .index {
                    display: none;
                }
                &:hover {
                    >.hover-mask {
                        position: absolute;
                        top: $thumb-view-margin * -1;
                        right: 0;
                        left: 0;
                        bottom: 0;
                        background: rgba($indicator_color, .2);
                    }
                    > .index {
                        position: absolute;
                        display: block;
                        font-weight: bolder;
                        font-size: 40px;
                        color: rgba($body_bg, .8);
                        top: calc(50% - 4px); // 4px is $thumb-view-margin, if using $thumb-view-margin in these, will get a error 
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 20;
                    }
                }
            }
            .indicator {
                position: absolute;
                box-sizing: border-box;
                height: $thumb-view-size + $thumb-view-margin;
                left: 0;
                top: 0;
                right: 0;
                background: rgba($indicator_color, .3);
                border-left: 3px solid rgba($indicator_color, .5);
                border-right: 3px solid rgba($indicator_color, .5);
                transition: all 0.5s ease;
                z-index: 10;
                pointer-events: none;
            }
        }
        > .toggle-button {
            position: absolute;
            height: 10px;
            width: 10px;
            background: red;
            right: -20px;
            top: 0;
        }
    }
</style>