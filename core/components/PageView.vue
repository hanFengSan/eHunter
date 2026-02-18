<template>
<section class="page-view" @click="onClickBg()">
    <div class="layer preview-layer" :style="previewStyle"></div>
    <div class="layer loading-layer">
        <h6 class="index">{{ index + 1 }}</h6>
        <article class="loading-info-panel" v-if="active">
            <transition name="slide-fade">
                <p class="loading-info" v-if="curLoadStatus!=ImgLoadStatus.Loaded" @click.stop="() => {}">
                    <span class="text">{{ loadingInfo }}</span>
                    <span class="operation">
                        <FlatButton 
                            class="tips tips-down no-margin" 
                            :title-content="i18n.originImgTip" 
                            :label="i18n.originImg" 
                            mode="inline" 
                            type="positive"
                            v-if="albumService.isSupportOriginImg()"
                            @click="getNewImgSrc(ImgSrcMode.Origin)" />
                        <FlatButton 
                            class="tips tips-down" 
                            :title-content="i18n.refreshTip" 
                            :label="i18n.refresh" 
                            mode="inline" 
                            type="positive"
                            @click="getNewImgSrc(ImgSrcMode.Default)" />
                        <FlatButton 
                            class="tips tips-down" 
                            :title-content="i18n.refreshByOtherSourceTip" 
                            :label="i18n.refreshByOtherSource" 
                            mode="inline" 
                            type="positive"
                            v-if="albumService.isSupportImgChangeSource()"
                            @click="getNewImgSrc(ImgSrcMode.ChangeSource)" />
                    </span>
                </p>
            </transition>
        </article>
    </div>
    <div class="layer img-layer">
        <img class="album-item" 
            v-if="active && imgPageInfo && imgPageInfo.src" 
            :src="imgPageInfo.src" 
            @load="loaded()"
            @error="failLoad($event)">
    </div>
</section>
</template>

<script setup lang="ts">
import FlatButton from './widget/FlatButton.vue'
import { inject, ref, computed, watch, nextTick, onMounted } from 'vue'
import { store, storeAction } from '../store/app'
import { NameAlbumService } from '../service/AlbumService'
import type { AlbumService } from '../service/AlbumService'
import { ImgSrcMode } from '../model/model'
import { i18n } from '../store/i18n'
import Utils from '../utils/Utils'
import Logger from '../utils/Logger'

const props = defineProps<{
    index: number,
    active: boolean,
}>()

enum ImgLoadStatus {
    Waiting = 0,
    Loading = 1,
    Error = 2,
    Loaded = 3,
}

const emit = defineEmits(['clickBackground'])

const albumService = <AlbumService>inject(NameAlbumService)

const reloadTimes = ref(0)
const message = ref('')
const curLoadStatus = ref(ImgLoadStatus.Waiting) // 0:waiting, 1:loading, 2:error, 3:loaded
const previewStyle:any = albumService.getPreviewThumbnailStyle(props.index)
const isFirstLoad = ref(true)

const imgPageInfo = computed(() => {
    return storeAction.getImgPageInfo(props.index)
})

async function loadImgSrc(mode: ImgSrcMode) {
    let resp = await albumService.getImgSrc(props.index, mode)
    if (resp instanceof Error) {
        return;
    }
    if (imgPageInfo.value.src != resp.src) {
        storeAction.setImgPageInfoSrc(props.index, resp.src)
    }
    if (resp.preciseHeightOfWidth && imgPageInfo.value.preciseHeightOfWidth != resp.preciseHeightOfWidth) {
        storeAction.setImgPageInfoPreciseHeightOfWidth(props.index, resp.preciseHeightOfWidth)
    }
}

const loadingInfo = computed(() => {
    let reloadInfo = reloadTimes.value ? `[${i18n.value.reload}-${reloadTimes.value}] ` : '';
    if (message.value) {
        return reloadInfo + message.value;
    }
    switch (curLoadStatus.value) {
        case ImgLoadStatus.Error:
            return reloadInfo + i18n.value.loadingImgFailed
        case ImgLoadStatus.Loaded:
            return reloadInfo + i18n.value.imgLoaded
        case ImgLoadStatus.Waiting:
            return reloadInfo + i18n.value.waiting
        case ImgLoadStatus.Loading:
        default:
            return reloadInfo + i18n.value.loadingImg
    }
})

onMounted(() => {
    if (props.active && !imgPageInfo.value.src) {
        loadImgSrc(ImgSrcMode.Default)
    }
})

watch(() => props.active, (newVal) => {
    if (newVal && !imgPageInfo.value.src) {
        loadImgSrc(ImgSrcMode.Default)
    }
})

// refresh img
async function getNewImgSrc(mode: ImgSrcMode) {
    reloadTimes.value++
    message.value = ''
    storeAction.setImgPageInfoSrc(props.index, '')
    curLoadStatus.value = ImgLoadStatus.Loading
    let actualMode = mode
    if (mode === ImgSrcMode.Default && store.autoRetryByOtherSource && albumService.isSupportImgChangeSource()) {
        actualMode = ImgSrcMode.ChangeSource
    }
    let resp = await albumService.getImgSrc(props.index, actualMode)
    if (resp instanceof Error) {
        switch (resp.message) {
            case 'ERROR_NO_ORIGIN':
                message.value = i18n.value.noOriginalImg
                break
            default:
                message.value = i18n.value.loadingFailed
        }
        return
    }
    await nextTick()
    await Utils.timeout(300)
    if (imgPageInfo.value.src != resp.src) {
        storeAction.setImgPageInfoSrc(props.index, resp.src)
    }
    if (resp.preciseHeightOfWidth && imgPageInfo.value.preciseHeightOfWidth != resp.preciseHeightOfWidth) {
        storeAction.setImgPageInfoPreciseHeightOfWidth(props.index, resp.preciseHeightOfWidth)
    }
}

function failLoad(e) {
    e.preventDefault()
    if (imgPageInfo.value.src) {
        curLoadStatus.value = ImgLoadStatus.Error;
        Logger.logText('LOADING', 'loading image failed')
        if (isFirstLoad.value) {
            // auto request src when first loading is failed
            isFirstLoad.value = false
            Logger.logText('LOADING', 'reloading image')
            getNewImgSrc(ImgSrcMode.Default)
        }
    }
}

function loaded() {
    curLoadStatus.value = ImgLoadStatus.Loaded;
}

function onClickBg() {
    emit('clickBackground')
}
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
                padding: 20px;
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
