<template>
    <div class="manga-container">
        <div class="loading-container" v-if="imgList.length === 0">
            loading...
        </div>
        <div class="scroll-view" v-if="imgList.length > 0">
            <h1>{{ info.title }}</h1>
            <div class="img-container" v-for="index in curImgParser.getSumOfPage()">
                <div class="img"></div>
                <label class="index">{{ index }}</label>
            </div>
        </div>
    </div>
</template>

<script>
    import ImgHtmlParser from 'src/service/ImgHtmlParser.js'
    import IntroHtmlParser from 'src/service/IntroHtmlParser.js'
    import * as api from 'src/service/api.js'
    import MultiAsyncReqService from 'src/service/MultiAsyncReqService.js'
    import ImgUrlListParser from 'src/service/ImgUrlListParser.js'

    export default {
        name: 'MangaScrollView',

        data() {
            return {
                curImgParser: new ImgHtmlParser(document.documentElement.innerHTML),
                imgList: [],
                imgBaseUrl: '',
                sumOfPage: '',
                imgUrlMap: new Map()
            }
        },

        created() {
            this.sumOfPage = this.curImgParser.getSumOfPage();
            this.getImgUrl();
        },

        methods: {
            getImgUrl() {
                (new ImgUrlListParser(this.curImgParser.getIntroUrl(), this.sumOfPage))
                    .request()
                    .then(urls => {
                        // console.log(urls);
                    }, err => {});
                // let imgUrls = [];
                // for (let pageNum of this.range(1, 1)) {
                //     imgUrls.push(api.getImgHtml(this.imgBaseUrl, pageNum))
                // }
                // console.log(imgUrls);
                // (new MultiAsyncReqService(imgUrls))
                //     .request()
                //     .then(imgUrlMap => {
                //         this.imgUrlMap = imgUrlMap;
                //         console.log(imgUrlMap);
                //     }, err => {
                //         console.log(err);
                //         // TODO: show tip for this error
                //     });


                // return new Promise((resolve, reject) => {
                //     api.getImgHtml(this.curImgParser.getImgBaseUrl, pageNum)
                //         .then(res => {
                //             res.text().then(text => {
                //                 resolve((new ImgHtmlParser(text).getImgUrl()));
                //             })
                //         })
                //         .catch(err => reject(err));
                // });
            },

            initImgSize() {

            },
            range(start, count) {
                return Array.apply(0, Array(count))
                    .map(function (element, index) {
                        return index + start;
                    });
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
            }
            > .img-container {
                position: relative;
                height: 720px;
                width: 500px;
                max-width: calc(100vw - 150px);
                margin: 35px auto;
                border: 5px solid $img_container_color;
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
            }
        }
    }
</style>