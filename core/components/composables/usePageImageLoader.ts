import { computed, nextTick, ref, type ComputedRef, type Ref } from 'vue'
import type { AlbumService } from '../../service/AlbumService'
import { ImgSrcMode } from '../../model/model'
import { i18n } from '../../store/i18n'
import { store, storeAction } from '../../store/app'
import Utils from '../../utils/Utils'
import Logger from '../../utils/logger'
import { buildRetryQueueAfterFailure as buildImageRetryQueueAfterFailure } from '../../service/imageRetryPolicy'

export enum ImgLoadStatus {
    Waiting = 0,
    Loading = 1,
    Error = 2,
    Loaded = 3,
}

interface UsePageImageLoaderOptions {
    index: number
    albumService: AlbumService
    imgPageInfo: ComputedRef<any>
    warmMagnifierSource: (src: string) => Promise<void>
}

export function usePageImageLoader(options: UsePageImageLoaderOptions) {
    const { index, albumService, imgPageInfo, warmMagnifierSource } = options

    const reloadTimes = ref(0)
    const message = ref('')
    const curLoadStatus = ref(ImgLoadStatus.Waiting)
    const lastLoadMode = ref(ImgSrcMode.Default)
    const autoRetryQueue = ref<ImgSrcMode[]>([])
    const isAutoRetryRunning = ref(false)
    const isAutoRetryExhausted = ref(false)

    const loadingInfo = computed(() => {
        const reloadInfo = reloadTimes.value ? `[${i18n.value.reload}-${reloadTimes.value}] ` : ''
        if (message.value) {
            return reloadInfo + message.value
        }
        switch (curLoadStatus.value) {
            case ImgLoadStatus.Error:
                return reloadInfo + i18n.value.loadingImgFailed
            case ImgLoadStatus.Loaded:
                return reloadInfo + i18n.value.imgLoaded
            case ImgLoadStatus.Waiting:
                return reloadInfo + i18n.value.waiting
            default:
                return reloadInfo + i18n.value.loadingImg
        }
    })

    function getRetryPolicyOptions() {
        return {
            autoRetryByOtherSource: store.autoRetryByOtherSource,
            supportChangeSource: albumService.isSupportImgChangeSource(),
        }
    }

    function buildRetryQueueAfterFailure(failedMode: ImgSrcMode): ImgSrcMode[] {
        return buildImageRetryQueueAfterFailure(failedMode, getRetryPolicyOptions())
    }

    async function loadImgSrc(mode: ImgSrcMode) {
        lastLoadMode.value = mode
        isAutoRetryExhausted.value = false
        const resp = await albumService.getImgSrc(index, mode)
        if (resp instanceof Error) {
            if (mode === ImgSrcMode.Default) {
                autoRetryQueue.value = buildRetryQueueAfterFailure(mode)
                await runAutoRetryQueue()
            }
            return
        }
        if (imgPageInfo.value.src !== resp.src) {
            storeAction.setImgPageInfoSrc(index, resp.src)
        }
        if (resp.preciseHeightOfWidth && imgPageInfo.value.preciseHeightOfWidth !== resp.preciseHeightOfWidth) {
            storeAction.setImgPageInfoPreciseHeightOfWidth(index, resp.preciseHeightOfWidth)
        }
    }

    async function runAutoRetryQueue() {
        if (isAutoRetryRunning.value) {
            return
        }
        isAutoRetryRunning.value = true
        try {
            while (autoRetryQueue.value.length > 0) {
                const mode = autoRetryQueue.value.shift()
                if (mode === undefined) {
                    break
                }
                const loaded = await getNewImgSrc(mode, true)
                if (loaded) {
                    return
                }
            }
            isAutoRetryExhausted.value = true
        } finally {
            isAutoRetryRunning.value = false
        }
    }

    async function getNewImgSrc(mode: ImgSrcMode, isAutoRetry = false): Promise<boolean> {
        if (!isAutoRetry) {
            autoRetryQueue.value = []
        }
        isAutoRetryExhausted.value = false
        reloadTimes.value++
        message.value = ''
        storeAction.setImgPageInfoSrc(index, '')
        curLoadStatus.value = ImgLoadStatus.Loading
        lastLoadMode.value = mode
        const resp = await albumService.getImgSrc(index, mode)
        if (resp instanceof Error) {
            switch (resp.message) {
                case 'ERROR_NO_ORIGIN':
                    message.value = i18n.value.noOriginalImg
                    break
                default:
                    message.value = i18n.value.loadingFailed
            }
            if (isAutoRetry) {
                return false
            }
            autoRetryQueue.value = buildRetryQueueAfterFailure(mode)
            await runAutoRetryQueue()
            return false
        }
        await nextTick()
        await Utils.timeout(300)
        if (imgPageInfo.value.src !== resp.src) {
            storeAction.setImgPageInfoSrc(index, resp.src)
        }
        if (resp.preciseHeightOfWidth && imgPageInfo.value.preciseHeightOfWidth !== resp.preciseHeightOfWidth) {
            storeAction.setImgPageInfoPreciseHeightOfWidth(index, resp.preciseHeightOfWidth)
        }
        return true
    }

    function failLoad(e: Event) {
        e.preventDefault()
        if (imgPageInfo.value.src) {
            curLoadStatus.value = ImgLoadStatus.Error
            Logger.logText('LOADING', 'loading image failed')
            if (!isAutoRetryExhausted.value && autoRetryQueue.value.length === 0) {
                autoRetryQueue.value = buildRetryQueueAfterFailure(lastLoadMode.value)
            }
            if (autoRetryQueue.value.length > 0) {
                Logger.logText('LOADING', 'reloading image')
                void runAutoRetryQueue()
            }
        }
    }

    function loaded() {
        curLoadStatus.value = ImgLoadStatus.Loaded
        autoRetryQueue.value = []
        isAutoRetryExhausted.value = false
        if (imgPageInfo.value.src) {
            void warmMagnifierSource(imgPageInfo.value.src)
        }
    }

    return {
        curLoadStatus,
        loadingInfo,
        loadImgSrc,
        getNewImgSrc,
        failLoad,
        loaded,
    }
}
