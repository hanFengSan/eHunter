<template>
<section
    ref="pageViewRef"
    class="page-view"
    @click="onClickBg"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchCancel">
    <div class="layer preview-layer">
        <ThumbView class="preview-thumb" :thumb-info="store.thumbInfos[index]" />
    </div>
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
        <img
            ref="imgRef"
            class="album-item"
            v-if="active && imgPageInfo && imgPageInfo.src"
            :src="imgPageInfo.src"
            @load="loaded()"
            @error="failLoad($event)">
    </div>

    <div class="layer menu-layer" v-if="menuOpen" @click.stop>
        <div class="menu-anchor" :style="menuAnchorStyle">
            <Popover :active="menuOpen" :custom-style="{ 'margin-left': '0px', 'margin-top': '0px' }" @close="closeMenu">
                <div class="page-menu-options no-select">
                    <button
                        v-if="showMagnifierToggleAction"
                        type="button"
                        class="item"
                        @click="toggleMagnifierFromMenu">
                        <span>{{ magnifierEnabled ? i18n.closeMagnifier : i18n.openMagnifier }}</span>
                    </button>

                    <button
                        type="button"
                        :class="['item', { disabled: !loadOriginalEnabled }]"
                        :title="loadOriginalDisabledReason"
                        @click="loadOriginalFromMenu">
                        <span>{{ i18n.originImg }}</span>
                        <small v-if="!loadOriginalEnabled">{{ loadOriginalDisabledReason }}</small>
                    </button>

                    <button
                        v-if="showOddEvenAction"
                        type="button"
                        class="item"
                        @click="toggleOddEvenFromMenu">
                        <span>{{ i18n.oddEven }}</span>
                    </button>

                    <button
                        v-if="showMagnifierZoomActions"
                        type="button"
                        class="item"
                        :disabled="magnifierZoom >= 5"
                        @click="changeMagnifierZoom(1)">
                        <span>{{ i18n.zoomInMagnifier }}</span>
                    </button>

                    <button
                        v-if="showMagnifierZoomActions"
                        type="button"
                        class="item"
                        :disabled="magnifierZoom <= 2"
                        @click="changeMagnifierZoom(-1)">
                        <span>{{ i18n.zoomOutMagnifier }}</span>
                    </button>

                    <button
                        v-if="showMagnifierZoomActions"
                        type="button"
                        class="item"
                        :disabled="magnifierAreaSize >= 150"
                        @click="changeMagnifierAreaSize(1)">
                        <span>{{ i18n.increaseMagnifierArea }}</span>
                    </button>

                    <button
                        v-if="showMagnifierZoomActions"
                        type="button"
                        class="item"
                        :disabled="magnifierAreaSize <= 50"
                        @click="changeMagnifierAreaSize(-1)">
                        <span>{{ i18n.decreaseMagnifierArea }}</span>
                    </button>
                </div>
            </Popover>
        </div>
    </div>

    <div v-if="showFocusIndicator" class="focus-indicator" :style="focusIndicatorStyle"></div>
    <div v-if="showMagnifierLens" class="magnifier-lens" :style="magnifierLensStyle">
        <canvas ref="magnifierCanvasRef" class="magnifier-canvas" v-show="lensWarmState === 'ready'"></canvas>
        <div class="magnifier-pending" v-if="showMagnifierPending">
            <span class="spinner"></span>
            <span>{{ i18n.loadingImg }}</span>
        </div>
    </div>
</section>
</template>

<script setup lang="ts">
import FlatButton from './widget/FlatButton.vue'
import Popover from './widget/Popover.vue'
import ThumbView from './ThumbView.vue'
import { inject, ref, computed, watch, onMounted } from 'vue'
import { store, storeAction } from '../store/app'
import { NameAlbumService } from '../service/AlbumService'
import type { AlbumService } from '../service/AlbumService'
import { ImgSrcMode } from '../model/model'
import { i18n } from '../store/i18n'
import { usePageMenu } from './composables/usePageMenu'
import { useMagnifier } from './composables/useMagnifier'
import { usePageImageLoader, ImgLoadStatus } from './composables/usePageImageLoader'
import { useTouchLongPress } from './composables/useTouchLongPress'

type MagnifierSessionPreference = {
    enabled: boolean,
}

const MAGNIFIER_SESSION_KEY = '__ehunterMagnifierSessionState__'
const sharedMagnifierSessionHost = globalThis as typeof globalThis & Record<typeof MAGNIFIER_SESSION_KEY, MagnifierSessionPreference | undefined>
if (!sharedMagnifierSessionHost[MAGNIFIER_SESSION_KEY]) {
    sharedMagnifierSessionHost[MAGNIFIER_SESSION_KEY] = {
        enabled: false,
    }
}
const magnifierSessionState = sharedMagnifierSessionHost[MAGNIFIER_SESSION_KEY] as MagnifierSessionPreference

const props = defineProps<{
    index: number,
    active: boolean,
    activeLoad?: boolean,
}>()

const emit = defineEmits(['clickBackground', 'toggleOddEven'])
const albumService = <AlbumService>inject(NameAlbumService)

const pageViewRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const magnifierCanvasRef = ref<HTMLCanvasElement | null>(null)
const menuOwnerId = `pageview-menu-${props.index}`

const touchLongPressMs = 500
const touchMoveTolerance = 10
const menuAreaSizeOptions = [50, 80, 120, 150]
const pendingRevealDelayMs = 120
const lensGap = 6

const imgPageInfo = computed(() => storeAction.getImgPageInfo(props.index))
const isBookMode = computed(() => store.readingMode === 1)
const isDesktopPointer = computed(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return true
    }
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
})

const showMagnifierToggleAction = computed(() => isDesktopPointer.value)
const showOddEvenAction = computed(() => isBookMode.value)
const magnifierZoom = computed(() => Math.max(2, Math.min(5, Math.round(store.magnifierZoom || 3))))
const magnifierAreaSize = computed(() => Math.max(20, Math.min(300, Math.round(store.magnifierAreaSize || 80))))

const loadOriginalEnabled = computed(() => albumService.isSupportImgChangeSource())
const loadOriginalDisabledReason = computed(() => i18n.value.notSupportedInCurrentPlatform || i18n.value.disabled)

const {
    menuOpen,
    menuAnchorStyle,
    openMenuAt,
    closeMenu,
} = usePageMenu({
    pageViewRef,
    menuOwnerId,
})

const {
    magnifierEnabled,
    lensWarmState,
    showFocusIndicator,
    showMagnifierLens,
    showMagnifierPending,
    focusIndicatorStyle,
    magnifierLensStyle,
    warmMagnifierSource,
    updateLensPosition,
    hideMagnifierPointerArtifacts,
    onMouseMove,
    onMouseLeave,
    toggleMagnifier,
    setEnabledFromSession,
} = useMagnifier({
    pageViewRef,
    imgRef,
    magnifierCanvasRef,
    imgSrc: computed(() => imgPageInfo.value?.src || ''),
    isDesktopPointer,
    magnifierZoom,
    magnifierAreaSize,
    pendingRevealDelayMs,
    lensGap,
    onSyncEnabled: (enabled) => {
        magnifierSessionState.enabled = enabled
    },
})

const showMagnifierZoomActions = computed(() => isDesktopPointer.value && magnifierEnabled.value)

const {
    curLoadStatus,
    loadingInfo,
    loadImgSrc,
    getNewImgSrc,
    failLoad,
    loaded,
} = usePageImageLoader({
    index: props.index,
    albumService,
    imgPageInfo,
    warmMagnifierSource,
})

const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
} = useTouchLongPress({
    touchLongPressMs,
    touchMoveTolerance,
    shouldHandle: () => !isBookMode.value && !isDesktopPointer.value,
    onLongPress: (x, y) => openMenuAt(x, y),
})

onMounted(() => {
    if (props.active && !imgPageInfo.value.src) {
        void loadImgSrc(ImgSrcMode.Default)
    } else if (imgPageInfo.value.src) {
        void warmMagnifierSource(imgPageInfo.value.src)
    }
    setEnabledFromSession(magnifierSessionState.enabled)
})

watch(() => props.active, (newVal) => {
    if (newVal && !imgPageInfo.value.src) {
        void loadImgSrc(ImgSrcMode.Default)
        return
    }
    if (newVal && imgPageInfo.value.src) {
        void warmMagnifierSource(imgPageInfo.value.src)
    }
})

watch(() => props.index, () => {
    setEnabledFromSession(magnifierSessionState.enabled)
    hideMagnifierPointerArtifacts()
})

function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val))
}

function isInBookCenterRegion(clientY: number) {
    return clientY >= store.viewportHeight * 0.3 && clientY <= store.viewportHeight * 0.7
}

function toggleMagnifierFromMenu() {
    if (!isDesktopPointer.value) {
        return
    }
    toggleMagnifier()
    closeMenu()
}

function toggleOddEvenFromMenu() {
    emit('toggleOddEven')
    closeMenu()
}

function changeMagnifierZoom(step: number) {
    const next = clamp(magnifierZoom.value + step, 2, 5)
    storeAction.setMagnifierZoom(next)
    updateLensPosition()
    closeMenu()
}

function changeMagnifierAreaSize(step: number) {
    const current = magnifierAreaSize.value
    const sorted = menuAreaSizeOptions.slice().sort((a, b) => a - b)
    if (step > 0) {
        const next = sorted.find(item => item > current)
        if (next !== undefined) {
            storeAction.setMagnifierAreaSize(next)
        }
    } else {
        const prev = sorted.slice().reverse().find(item => item < current)
        if (prev !== undefined) {
            storeAction.setMagnifierAreaSize(prev)
        }
    }
    updateLensPosition()
    closeMenu()
}

function loadOriginalFromMenu() {
    if (!loadOriginalEnabled.value) {
        return
    }
    void getNewImgSrc(ImgSrcMode.Origin)
    closeMenu()
}

function onClickBg(e: MouseEvent) {
    if (menuOpen.value) {
        closeMenu()
        return
    }
    if (isBookMode.value) {
        if (isInBookCenterRegion(e.clientY)) {
            e.stopPropagation()
            openMenuAt(e.clientX, e.clientY)
            return
        }
        emit('clickBackground')
        return
    }

    if (isDesktopPointer.value) {
        e.stopPropagation()
        openMenuAt(e.clientX, e.clientY)
        return
    }
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
    overflow: visible;
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
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: stretch;

        > .preview-thumb {
            width: 100%;
            height: 100%;
        }

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

.menu-layer {
    z-index: 12010;
    pointer-events: auto;

    > .menu-anchor {
        position: absolute;
        width: 0;
        height: 0;

        :deep(.popover) {
            min-width: 170px;
            z-index: 12020;
        }
    }
}

.page-menu-options {
    flex-direction: column;
    min-width: 170px;

    > .item {
        border: 0;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 8px 12px;
        color: rgba(0, 0, 0, 0.82);
        transition: all 0.2s ease;
        width: 100%;
        font-size: 13px;

        > small {
            margin-top: 3px;
            color: rgba(0, 0, 0, 0.45);
            font-size: 11px;
        }

        &:hover {
            cursor: pointer;
            background: rgba(0, 0, 0, 0.08);
            color: $accent_color;
        }

        &:disabled,
        &.disabled {
            cursor: not-allowed;
            color: rgba(0, 0, 0, 0.45);
            background: rgba(0, 0, 0, 0.03);
        }
    }
}

.focus-indicator {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.3);
    box-sizing: border-box;
    pointer-events: none;
    z-index: 12005;
}

.magnifier-lens {
    position: absolute;
    border: 2px solid $accent_color;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba($accent_color, 0.8);
    overflow: hidden;
    background: rgba(0, 0, 0, 0.12);
    pointer-events: none;
    z-index: 12009;

    > .magnifier-canvas {
        width: 100%;
        height: 100%;
        display: block;
    }

    > .magnifier-pending {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.92);
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0.16));

        > .spinner {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.35);
            border-top-color: rgba(255, 255, 255, 0.95);
            animation: magnifier-spin 0.7s linear infinite;
        }
    }
}

@keyframes magnifier-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
