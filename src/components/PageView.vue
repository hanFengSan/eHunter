<template>
<div class="page-view">
    <img class="album-item" 
        v-if="active" 
        :src="imgInfo.src" 
        :get-src="getImgSrc()"
        @load="loaded()"
        @error="failLoad($event)">
    <div class="index">{{ index + 1 }}</div>
    <div class="img-info-panel" v-if="active">
        <div class="loading-info" v-if="imgInfo.loadStatus!=loadStatus.error&&imgInfo.src">...加载图片中...</div>
        <div class="loading-info" v-if="imgInfo.loadStatus!=loadStatus.error&&!imgInfo.src">...加载图片地址中...</div>
        <div class="loading-info" v-if="imgInfo.loadStatus==loadStatus.error">图片加载失败, 请在图片框右下角点击刷新按钮重新尝试</div>
    </div>
        <div class="img-console-panel" v-if="imgInfo.loadStatus!=loadStatus.loaded"> 
        <div class="tips" title-content="载入原图">
            <svg class="refresh-origin-btn" viewBox="0 0 24 24" width="24" @click="getNewImgSrc('origin')" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
        </div>
        <div class="tips" title-content="刷新">
            <svg class="refresh-btn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="getNewImgSrc()">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
        </div>
    </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AlbumCacheService from 'src/service/storage/AlbumCacheService.js'
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

    data() {
        return {
            imgInfo: {},
            loadStatus: { loading: Symbol(), error: Symbol(), waiting: Symbol(), loaded: Symbol() } // status of img loading
        };
    },

    created() {
        this.imgInfo = JSON.parse(JSON.stringify(this.data));
        this.imgInfo.isFirstLoad = true;
        this.imgInfo.loadStatus = this.loadStatus.waiting;
    },

    methods: {
        // for lazy load img
        getImgSrc() {
            // avoid redundant getImgSrc(), overlap refreshing of 'origin'
            if (this.imgInfo.loadStatus !== this.loadStatus.loading) {
                AlbumCacheService
                    .getImgSrc(this.albumId, this.index)
                    .then(src => {
                        if (this.imgInfo.src !== src) {
                            this.imgInfo.src = src;
                            this.imgInfo.loadStatus = this.loadStatus.loading;
                        }
                    });
            }
        },

        // refresh img
        getNewImgSrc(mode) {
            this.imgInfo.src = '';
            this.imgInfo.loadStatus = this.loadStatus.loading;
            AlbumCacheService
                .getNewImgSrc(this.albumId, this.index, mode)
                .then(src => {
                    this.imgInfo.src = src;
                });
        },

        failLoad(e) {
            e.preventDefault();
            if (this.imgInfo.src) {
                this.imgInfo.loadStatus = this.loadStatus.error;
                Logger.logText('LOADING', 'loading image failed');
                if (this.imgInfo.isFirstLoad) { // auto request src when first loading is failed
                    this.imgInfo.isFirstLoad = false;
                    Logger.logText('LOADING', 'reloading image');
                    this.getNewImgSrc();
                }
            }
        },

        loaded() {
            this.imgInfo.loadStatus = this.loadStatus.loaded;
        }
    }
};
</script>

<style lang="scss" scoped>
@import "~style/_responsive";
@import "~style/_variables";

.page-view {
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
    > .img-info-panel {
        position: absolute;
        top: calc(50% + 80px);
        left: 50%;
        transform: translate(-50%, -50%);
        color: $img_container_color;
        font-size: 14px;
        z-index: -1;
    }
    > .img-console-panel {
        position: absolute;
        bottom: 10px;
        right: 10px;
        z-index: 1;
        display: flex;
        flex-direction: row;
        .refresh-btn {
            fill: $img_container_color;
            height: 20px;
            width: 20px;
            display: block;
            margin: 0 auto;
            cursor: pointer;
            &:hover {
                fill: $primary_color;
            }
        }
        .refresh-origin-btn {
            fill: $img_container_color;
            height: 20px;
            width: 20px;
            display: block;
            margin: 0 auto;
            cursor: pointer;
            &:hover {
                fill: $primary_color;
            }
        }
    }
    > .album-item {
        width: inherit;
        min-width: inherit;
        height: inherit;
    }
}
</style>