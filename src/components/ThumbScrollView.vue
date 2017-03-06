<template>
    <div class="thumb-scroll-view">
        <div class="indicator" :style="{top: px(154*curIndex)}"></div>
        <div class="thumb-container" @click="select(index)" v-for="(item, index) of thumbList">
            <div class="thumb" :style="{background: `transparent url(${item.url}) -${item.offset}px 0 no-repeat`}"></div>
            <div class="hover-mask"></div>
            <!--<span class="loc">{{ index }}</span>-->
        </div>
    </div>
</template>

<script>
    import ImgHtmlParser from 'src/service/ImgHtmlParser.js'
    import IntroHtmlParser from 'src/service/IntroHtmlParser.js'
    import * as api from 'src/service/api.js'
    import TextReqService from 'src/service/TextReqService.js'
    import CookieUtil from 'src/utils/CookieUtil.js'

    export default {
        name: 'ThumbScrollView',

        data() {
            return {
                parser: new ImgHtmlParser(document.documentElement.innerHTML),
                info: window.info,
                imgList: [], // origin img list
                thumbList: [],
                curIndex: 0,
            }
        },

        created() {
            // set Cookie for small thumb, important
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
            getIntroHtml(page) {
                const url = page > 1 ? `${this.parser.getIntroUrl()}?p=${page - 1}` : this.parser.getIntroUrl()
                return fetch(url, {
                    method: 'GET',
                    credentials: 'include'
                });
            },
            getThumbListCount() {
                // 20 is the img sum per spirit in small thumb model
                let sumOfPage = this.parser.getSumOfPage();
                if (sumOfPage < 20) {
                    return 1;
                }
                let reminder = sumOfPage % 20;
                if (reminder > 1) {
                    return (sumOfPage - reminder) / 20 + 1;
                } else {
                    return sumOfPage / 20;
                }
            },
            initImgList() {
                (new TextReqService(api.getIntroHtml(this.parser.getIntroUrl(), 1)))
                    .request()
                    .then(text => {
                        let thumbKeyId = (new IntroHtmlParser(text)).getThumbKeyId();
                        for (let i = 0; i < this.getThumbListCount(); i++) {
                            this.imgList.push(`/m/${thumbKeyId}/${this.parser.getAlbumId()}-${i < 10 ? '0' + i : i}.jpg`);
                        }
                        this.computeThumbList();
                    }, err => {
                        console.log(err);
                        // TODO: show tips for the error      
                    });
            },

            computeThumbList() {
                for (let i = 0; i < this.imgList.length; i++) {
                    for (let t = 0; t < 20; t++) {
                        if (i != this.imgList.length - 1 || t < this.parser.getSumOfPage() % 20) {
                            this.thumbList.push({
                                url: this.imgList[i],
                                offset: t * 100
                            })
                        }
                    }
                }
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