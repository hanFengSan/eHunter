<template>
<section class="page-view">
    <div class="layer preview-layer" :style="previewStyle"></div>
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
                            v-if="service.album.supportOriginImg()"
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
                            v-if="service.album.supportImgChangeSource()"
                            @click="getNewImgSrc(tags.MODE_CHANGE_SOURCE)">
                        </flat-button>
                    </span>
                </p>
            </transition>
        </article>
    </div>
    <div class="layer img-layer">
        <img class="album-item" 
            v-if="active" 
            :src="imgPageInfo.src" 
            @load="loaded()"
            @error="failLoad($event)">
    </div>
</section>
</template>

<script>
import { mapGetters } from 'vuex';
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

    inject: ['service'],
    
    components: { FlatButton },

    data() {
        return {
            imgPageInfo: {},
            reloadTimes: 0,
            message: '',
            curLoadStatus: null,
            previewStyle: {}
        };
    },

    async created() {
        this.imgPageInfo = JSON.parse(JSON.stringify(this.data));
        this.imgPageInfo.isFirstLoad = true;
        this.curLoadStatus = tags.STATE_WAITING;
        if (this.active) {
            this.getImgSrc();
        }
        this.service.album.getThumbInfo(this.index).then(async thumbInfo => {
            this.previewStyle = await this.service.album.getPreviewThumbnailStyle(this.index, this.imgPageInfo, thumbInfo);
        });
    },

    computed: {
        ...mapGetters(['string']),
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
                let src = await this.service.album.getImgSrc(this.index, tags.MODE_FAST);
                if (this.imgPageInfo.src !== src) {
                    this.imgPageInfo.src = src;
                }
                this.curLoadStatus = tags.STATE_LOADING;
            }
        },

        // refresh img
        async getNewImgSrc(mode) {
            this.reloadTimes++;
            this.message = '';
            this.imgPageInfo.src = '';
            this.curLoadStatus = tags.STATE_LOADING;
            let src = await this.service.album.getNewImgSrc(this.index, mode);
            if (!(src instanceof Error)) {
                this.imgPageInfo.src = src;
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
            if (this.imgPageInfo.src) {
                this.curLoadStatus = tags.STATE_ERRORED;
                Logger.logText('LOADING', 'loading image failed');
                if (this.imgPageInfo.isFirstLoad) {
                    // auto request src when first loading is failed
                    this.imgPageInfo.isFirstLoad = false;
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
@import '../style/_responsive';
@import '../style/_variables';

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