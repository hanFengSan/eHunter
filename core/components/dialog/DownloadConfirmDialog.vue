<template>
    <SimpleDialog
        :active="store.showDownloadConfirmDialog"
        :title="i18n.downloadConfirmTitle"
        :md-text="i18n.downloadConfirmMessage"
        :operations="operations"
        @close="onClose" />
</template>

<script setup lang="ts">
import SimpleDialog from '../widget/SimpleDialog.vue'
import { i18n } from '../../store/i18n'
import { store, storeAction } from '../../store/app'

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
        onClick: () => {
            // TODO: 实现下载逻辑
            console.log('Download confirmed')
        }
    }
]

function onClose() {
    storeAction.closeDownloadConfirmDialog()
}
</script>
