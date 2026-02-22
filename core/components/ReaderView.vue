<template>
<div class="reader-view">
    <DockWorkspace
        ref="dockWorkspaceRef"
        :thumb-slot="store.thumbDockSlot"
        :thumb-size-px="store.thumbDockSlot === 'bottom' ? store.thumbViewHeight : store.thumbViewWidth"
        :show-thumb="showThumb"
        :long-press-ms="500"
        @request-dock="(slot) => storeAction.setThumbDockSlot(slot)"
        @request-resize="(size) => storeAction.setThumbPanelSize(size)">
        <template #thumb>
            <ThumbScrollView @dock-drag-start="onThumbDockDragStart" @open-thumb-expand="onOpenThumbExpand" />
        </template>
        <template #main>
            <div class="main-content">
                <TopBar class="top-bar" @closeEHunter="closeReader"/>
                <transition name="slow-horizontal-fade">
                    <AlbumScrollView class="content scroll-mode" v-if="store.readingMode === 0" />
                </transition>
                <transition name="slow-vertical-fade">
                    <AlbumBookView class="content book-mode" v-if="store.readingMode === 1" />
                </transition>
            </div>
        </template>
    </DockWorkspace>
    <div class="status-pannel">
        <button
            class="full-screen"
            :aria-label="i18n.fullScreen"
            @click="toggleFullscreen"
            type="button">
            <FullScreenIcon />
        </button>
        <div class="progress">{{ `${store.curViewIndex + 1} / ${store.pageCount}` }}</div>
    </div>
    <ThumbExpandDialog @select-page="onThumbExpandSelectPage" />
    <InstructionDialog />
</div>
</template>

<script lang="ts" setup>
import AlbumScrollView from './AlbumScrollView.vue';
import ThumbScrollView from './ThumbScrollView.vue';
import TopBar from './TopBar.vue';
import AlbumBookView from './AlbumBookView.vue';
import ThumbExpandDialog from './dialog/ThumbExpandDialog.vue'
import InstructionDialog from './dialog/InstructionDialog.vue'
import DockWorkspace from './layout/DockWorkspace.vue'
import FullScreenIcon from '../assets/svg/full_screen.svg?component'
import { i18n } from '../store/i18n'
import { store, storeAction } from '../store/app'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { GestureStartPayload } from '../utils/layoutGesture'

type FullscreenTarget = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void
    webkitRequestFullScreen?: () => Promise<void> | void
    mozRequestFullScreen?: () => Promise<void> | void
}

const isFullscreen = ref(false)
const dockWorkspaceRef = ref<null | { startDockDrag: (payload: GestureStartPayload) => void }>(null)
const showThumb = computed(() => {
    if (store.readingMode === 0) {
        return store.showThumbView
    }
    return store.showBookThumbView
})

function syncFullscreenState() {
    const doc = document as Document & {
        webkitFullscreenElement?: Element | null
        mozFullScreenElement?: Element | null
    }
    isFullscreen.value = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement)
}

function closeReader() {
    const win = window as Window & {
        __EHUNTER_UI__?: { close: () => void }
    }

    if (win.__EHUNTER_UI__) {
        win.__EHUNTER_UI__.close()
        return
    }

    const container = document.querySelector('#ehunter-app .ehunter-container') as HTMLElement | null
    if (container) {
        container.style.top = '-100%'
        document.body.style.overflow = ''
    }
}

function toggleFullscreen() {
    const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void> | void
        mozCancelFullScreen?: () => Promise<void> | void
        webkitFullscreenElement?: Element | null
        mozFullScreenElement?: Element | null
    }
    const isFullScreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement)

    if (isFullScreen) {
        if (doc.exitFullscreen) {
            doc.exitFullscreen()
            return
        }
        if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen()
            return
        }
        if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen()
        }
        return
    }

    const elem = document.querySelector('.ehunter-container') as FullscreenTarget | null
    const target: FullscreenTarget = elem || (document.documentElement as FullscreenTarget)

    if (target.requestFullscreen) {
        target.requestFullscreen()
        return
    }
    if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen()
        return
    }
    if (target.webkitRequestFullScreen) {
        target.webkitRequestFullScreen()
        return
    }
    if (target.mozRequestFullScreen) {
        target.mozRequestFullScreen()
    }
}

function onThumbDockDragStart(payload: GestureStartPayload) {
    dockWorkspaceRef.value?.startDockDrag(payload)
}

function onOpenThumbExpand() {
    storeAction.openThumbExpandDialog()
}

function onThumbExpandSelectPage(pageNumber: number) {
    storeAction.closeThumbExpandDialog()
    storeAction.setCurViewIndex(pageNumber - 1, 'thumb-expand')
}

onMounted(() => {
    syncFullscreenState()
    document.addEventListener('fullscreenchange', syncFullscreenState)
    document.addEventListener('webkitfullscreenchange', syncFullscreenState as EventListener)
    document.addEventListener('mozfullscreenchange', syncFullscreenState as EventListener)
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', syncFullscreenState)
    document.removeEventListener('webkitfullscreenchange', syncFullscreenState as EventListener)
    document.removeEventListener('mozfullscreenchange', syncFullscreenState as EventListener)
})
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

div {
    display: flex;
}

.reader-view {
    position: relative;
    flex-direction: row;
    align-items: center;
    height: 100%;
    width: 100%;

    :deep(.main-content) {
        height: 100%;
        width: 100%;
        flex-grow: 1;
        position: relative;
        display: flex;
        flex-direction: column;

        > .top-bar {
            position: absolute;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
        }

        > .content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }
    }
    > .panel {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        bottom: 2vh;
        right: 2vh;
        z-index: 10000;
        opacity: 0.5;
        transition: all 0.2s ease;
        &:hover {
            opacity: 1;
        }
        > .location {
            color: $reader_view_location_color;
            display: inline-block;
            font-size: 16px;
            line-height: 16px;
            margin-top: 2px;
        }
        .icon-container {
            position: relative;
            display: inline-block;
        }
        > .full-screen {
            cursor: pointer;
            margin-left: 5px;
            > svg {
                fill: $reader_view_full_screen_color;
                width: 26px;
                height: 26px;
            }
        }
    }
    
    > .status-pannel {
        z-index: 10000;
        position: absolute;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        opacity: 0.5;
        background-color: black;
        padding: 3px 5px;
        gap: 3px;
        > .progress {
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 11px;
            line-height: 11px;
            color: white
        }
        > .full-screen {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            border: 0;
            background: transparent;
            cursor: pointer;
            padding: 0;
            color: white;
            transition: color 0.2s ease;
            &:hover {
                color: $accent_color;
            }
            > svg {
                fill: currentColor;
                width: 12px;
                height: 12px;
            }
        }
    }
}
</style>
