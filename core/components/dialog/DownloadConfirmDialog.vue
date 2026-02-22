<template>
    <SimpleDialog
        :active="store.showDownloadConfirmDialog"
        :title="i18n.downloadConfirmTitle"
        :md-text="`${i18n.downloadConfirmMessage}\n\n${i18n.downloadAuthorizeTip}`"
        :operations="operations"
        @close="onClose" />
</template>

<script setup lang="ts">
import SimpleDialog from '../widget/SimpleDialog.vue'
import { i18n } from '../../store/i18n'
import { store, storeAction } from '../../store/app'
import { GalleryDownloadService } from '../../service/GalleryDownloadService'

const operations = [
    {
        name: i18n.value.cancel,
        btnType: 'plain',
        isCloseModal: true,
    },
    {
        name: i18n.value.confirm,
        btnType: 'positive',
        isCloseModal: true,
        onClick: async () => {
            const albumService = storeAction.getAlbumService()
            if (!albumService) {
                return
            }
            const downloadService = new GalleryDownloadService()
            const taskId = `download-${Date.now()}-${Math.round(Math.random() * 1000)}`
            const pageCount = store.pageCount
            storeAction.registerDownloadRunner(taskId, downloadService)
            storeAction.startDownloadTask(taskId, store.albumTitle, pageCount)
            try {
                await downloadService.run({
                    taskId,
                    albumService,
                    galleryTitle: store.albumTitle,
                    introUrl: albumService.getIntroUrl(),
                    pageCount,
                    chunkSize: store.downloadChunkSize,
                    autoRetryByOtherSource: store.autoRetryByOtherSource,
                    eHunterVersion: '',
                    onStatus: (event) => {
                        storeAction.applyDownloadStatusEvent(taskId, store.albumTitle, event)
                    },
                })
            } catch (e) {
                const isAborted = e instanceof Error && e.message === 'DOWNLOAD_ABORTED'
                storeAction.applyDownloadStatusEvent(taskId, store.albumTitle, {
                    phase: isAborted ? 'partial' : 'failed',
                    severity: isAborted ? 'warning' : 'error',
                    message: isAborted ? i18n.value.downloadAborted : i18n.value.downloadFailed,
                    processedPages: 0,
                    totalPages: pageCount,
                    failedPages: pageCount,
                })
            } finally {
                storeAction.clearDownloadRunner(taskId)
            }
        }
    }
]

function onClose() {
    storeAction.closeDownloadConfirmDialog()
}
</script>
