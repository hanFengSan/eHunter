<template>
<section class="page-view">
    <div class="layer preview-layer" :style="AlbumService.getPreviewThumbnailStyle(index, imgInfo, thumb)"></div>
    <div class="layer loading-layer">
        <h6 class="index">{{ index + 1 }}</h6>
        <article class="loading-info-panel" v-if="active">
            <transition name="slide-fade">
                <p class="loading-info" v-if="curLoadStatus!=loadStatus.loaded">
                    {{ loadingInfo }}
                    <flat-button class="tips" title-content="加载原图, 可有效解决加载问题" label="原图" mode="inline" @click="getNewImgSrc('ORIGIN')"></flat-button>
                    <flat-button class="tips" title-content="刷新, 获取普通图片" label="刷新" mode="inline" @click="getNewImgSrc()"></flat-button>
                    <flat-button v-if="reloadTimes>2" class="tips" title-content="通过其他服务器获取普通图片" label="换源刷新" mode="inline" @click="getNewImgSrc('CHANGE_SOURCE')"></flat-button>
                </p>
            </transition>
        </article>
        <div class="loading-console-panel" v-if="active&&curLoadStatus!=loadStatus.loaded"> 
            <div class="tips" title-content="载入原图">
                <svg class="btn" viewBox="0 0 24 24" width="24" @click="getNewImgSrc('ORIGIN')" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
            </div>
            <div class="tips" title-content="刷新">
                <svg class="btn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="getNewImgSrc()">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
            </div>
        </div>
    </div>
    <div class="layer img-layer">
        <img class="album-item" 
            v-if="active" 
            :src="imgInfo.src" 
            :get-src="getImgSrc()"
            @load="loaded()"
            @error="failLoad($event)">
    </div>
</section>
</template>

<script>
import AlbumService from 'src/service/AlbumService.js'
import FlatButton from './widget/FlatButton.vue'
import Logger from '../utils/Logger.js'

export default {
    name: 'PageView',

    props: {
        data: {
            type: Object
        },
        index: {
            type: Number
        },
        active: {
            type: Boolean
        },
        albumId: {
            type: String
        }
    },

    components: { FlatButton },

    data() {
        return {
            imgInfo: {},
            thumb: {},
            reloadTimes: 0,
            message: '',
            curLoadStatus: null,
            loadStatus: { loading: 'loading', error: 'error', waiting: 'waiting', loaded: 'loaded' }
        };
    },

    async created() {
        this.imgInfo = JSON.parse(JSON.stringify(this.data));
        this.imgInfo.isFirstLoad = true;
        this.curLoadStatus = this.loadStatus.waiting;
        this.thumb = await AlbumService.getThumb(this.index);
    },

    computed: {
        AlbumService: () => AlbumService,
        loadingInfo() {
            let reloadInfo = this.reloadTimes ? `[重载-${this.reloadTimes}] ` : '';
            if (this.message) {
                return reloadInfo + this.message;
            }
            if (this.curLoadStatus !== this.loadStatus.error) {
                if (this.imgInfo.src) {
                    return reloadInfo + '加载图片中';
                } else {
                    return reloadInfo + '加载图片地址中';
                }
            } else {
                return reloadInfo + '图片加载失败, 请刷新';
            }
        }
    },

    methods: {
        // for lazy load img
        async getImgSrc() {
            // avoid redundant getImgSrc(), overlap refreshing of 'origin'
            if (this.curLoadStatus !== this.loadStatus.loading) {
                let src = await AlbumService.getImgSrc(this.index);
                if (this.imgInfo.src !== src) {
                    this.imgInfo.src = src;
                    this.curLoadStatus = this.loadStatus.loading;
                }
            }
        },

        // refresh img
        async getNewImgSrc(mode) {
            this.reloadTimes++;
            this.message = '';
            this.imgInfo.src = '';
            this.curLoadStatus = this.loadStatus.loading;
            let src = await AlbumService.getNewImgSrc(this.index, mode);
            if (!(src instanceof Error)) {
                this.imgInfo.src = src;
            } else {
                switch (src.message) {
                    case 'NO_ORIGIN':
                        this.message = '无原图地址, 请刷新';
                        Logger.logText('PageView', 'fuck');
                        break;
                    default:
                        this.message = '加载错误';
                }
            }
        },

        failLoad(e) {
            e.preventDefault();
            if (this.imgInfo.src) {
                this.curLoadStatus = this.loadStatus.error;
                Logger.logText('LOADING', 'loading image failed');
                if (this.imgInfo.isFirstLoad) { // auto request src when first loading is failed
                    this.imgInfo.isFirstLoad = false;
                    Logger.logText('LOADING', 'reloading image');
                    this.getNewImgSrc();
                }
            }
        },

        loaded() {
            this.curLoadStatus = this.loadStatus.loaded;
        }
    }
};
</script>

<style lang="scss" scoped>
@import "~style/_responsive";
@import "~style/_variables";

div {
    display: flex;
}

.page-view {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    transition: all 0.3s ease;
    > .layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    > .preview-layer {
        overflow: hidden;
        background-color: black;
        background-repeat: no-repeat;
        &:after {
            display: block;
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: $page_view_thumb_mask_color;
        }
    }

    > .loading-layer {
        box-shadow: inset 0px 0px 0px 5px $page_view_border_color;
        > .index {
            position: absolute;
            color: $page_view_index_color;
            font-weight: bolder;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 80px;
            margin: 0;
        }
        > .loading-info-panel {
            position: absolute;
            top: calc(50% + 80px);
            left: 50%;
            transform: translate(-50%, -50%);
            color: $page_view_info_color;
            font-size: 14px;
            z-index: 1;
            .loading-info {
                display: flex;
                align-items: center;
            }
        }
        > .loading-console-panel {
            position: absolute;
            bottom: 10px;
            right: 10px;
            z-index: 1;
            display: flex;
            flex-direction: row;
            .btn {
                height: 20px;
                width: 20px;
                display: block;
                margin: 0 auto;
                cursor: pointer;
                transition: all 0.2s ease;
                fill: $page_view_loading_btn_color;
                &:hover {
                    fill: $page_view_loading_btn_hovered_color;
                }
                &:active {
                    fill: $page_view_loading_btn_actived_color;
                }
            }
        }
    }

    > .img-layer {
        > .album-item {
            width: inherit;
            min-width: inherit;
            height: inherit;
        }
    }
}
</style>