<template>
<section class="page-view">
    <div class="layer preview-layer" :style="AlbumService.getPreviewThumbnailStyle(index, imgInfo, thumb)"></div>
    <div class="layer loading-layer">
        <h6 class="index">{{ index + 1 }}</h6>
        <article class="loading-info-panel" v-if="active">
            <transition name="slide-fade">
                <p class="loading-info" v-if="curLoadStatus!=tags.STATE_LOADED">
                    <span class="text">{{ loadingInfo }}</span>
                    <span class="operation">
                        <flat-button 
                            class="tips tips-down no-margin" 
                            :title-content="string.originImgTip" 
                            :label="string.originImg" 
                            mode="inline" 
                            type="positive"
                            @click="getNewImgSrc(tags.MODE_ORIGIN)">
                        </flat-button>
                        <flat-button 
                            class="tips tips-down" 
                            :title-content="string.refreshTip" 
                            :label="string.refresh" 
                            mode="inline" 
                            type="positive"
                            @click="getNewImgSrc()">
                        </flat-button>
                        <flat-button 
                            class="tips tips-down" 
                            :title-content="string.refreshByOtherSourceTip" 
                            :label="string.refreshByOtherSource" 
                            mode="inline" 
                            type="positive"
                            @click="getNewImgSrc(tags.MODE_CHANGE_SOURCE)">
                        </flat-button>
                    </span>
                </p>
            </transition>
        </article>
        <div class="loading-console-panel" v-if="active&&curLoadStatus!=tags.STATE_LOADED"> 
            <div class="tips tips-left" :title-content="string.originImgTip">
                <svg class="btn" viewBox="0 0 24 24" width="24" @click="getNewImgSrc(tags.MODE_ORIGIN)" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
            </div>
            <div class="tips tips-left" :title-content="string.refresh">
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
            @load="loaded()"
            @error="failLoad($event)">
    </div>
</section>
</template>

<script>
import { mapGetters } from 'vuex';
import AlbumService from '../service/AlbumService.js';
import FlatButton from './widget/FlatButton.vue';
import Logger from '../utils/Logger.js';
import * as tags from '../assets/value/tags';

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
            curLoadStatus: null
        };
    },

    async created() {
        this.imgInfo = JSON.parse(JSON.stringify(this.data));
        this.imgInfo.isFirstLoad = true;
        this.curLoadStatus = tags.STATE_WAITING;
        if (this.active) {
            this.getImgSrc();
        }
        this.thumb = await AlbumService.getThumb(this.index);
    },

    computed: {
        ...mapGetters(['string']),
        AlbumService: () => AlbumService,
        tags: () => tags,
        loadingInfo() {
            let reloadInfo = this.reloadTimes ? `[${this.string.reload}-${this.reloadTimes}] ` : '';
            if (this.message) {
                return reloadInfo + this.message;
            }
            switch (this.curLoadStatus) {
                case tags.STATE_ERRORED:
                    return reloadInfo + this.string.loadingImgFailed;
                case tags.STATE_LOADED:
                    return reloadInfo + this.string.imgLoaded;
                case tags.STATE_WAITING:
                    return reloadInfo + this.string.waiting;
                case tags.STATE_LOADING:
                default:
                    return reloadInfo + this.string.loadingImg;
            }
        }
    },

    watch: {
        active(val, oldVal) {
            if (val) {
                this.getImgSrc();
            }
        }
    },

    methods: {
        // for lazy load img
        async getImgSrc() {
            // avoid redundant getImgSrc(), overlap refreshing of 'origin'
            if (this.curLoadStatus !== tags.STATE_LOADING) {
                let src = await AlbumService.getImgSrc(this.index, tags.MODE_FAST);
                if (this.imgInfo.src !== src) {
                    this.imgInfo.src = src;
                }
                this.curLoadStatus = tags.STATE_LOADING;
            }
        },

        // refresh img
        async getNewImgSrc(mode) {
            this.reloadTimes++;
            this.message = '';
            this.imgInfo.src = '';
            this.curLoadStatus = tags.STATE_LOADING;
            let src = await AlbumService.getNewImgSrc(this.index, mode);
            if (!(src instanceof Error)) {
                this.imgInfo.src = src;
            } else {
                switch (src.message) {
                    case tags.ERROR_NO_ORIGIN:
                        this.message = this.string.noOriginalImg;
                        break;
                    default:
                        this.message = this.string.loadingFailed;
                }
            }
        },

        failLoad(e) {
            e.preventDefault();
            if (this.imgInfo.src) {
                this.curLoadStatus = tags.STATE_ERRORED;
                Logger.logText('LOADING', 'loading image failed');
                if (this.imgInfo.isFirstLoad) {
                    // auto request src when first loading is failed
                    this.imgInfo.isFirstLoad = false;
                    Logger.logText('LOADING', 'reloading image');
                    this.getNewImgSrc(tags.MODE_FAST);
                }
            }
        },

        loaded() {
            this.curLoadStatus = tags.STATE_LOADED;
        }
    }
};
</script>

<style lang="scss" scoped>
@import '~style/_responsive';
@import '~style/_variables';

div,
span {
    display: flex;
}

.page-view {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    transition: all 0.3s ease;
    overflow: hidden;
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
                flex-direction: column;
                > .operation {
                    margin-top: 2px;
                    > .no-margin {
                        margin-left: 0;
                    }
                }
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