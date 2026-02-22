<template>
    <SimpleDialog
        :active="store.showInstructionDialog"
        :title="store.instructionDialogTitle || i18n.instructionsAndAbouts"
        :is-compulsive="store.instructionDialogCompulsive"
        :md-text="store.instructionDialogMdText"
        :operations="operations"
        @close="storeAction.closeInstructionDialog" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { i18n } from '../../store/i18n'
import { store, storeAction } from '../../store/app'
import SimpleDialog from '../widget/SimpleDialog.vue'

const operations = computed(() => {
    if (store.instructionDialogOperations.length > 0) {
        return store.instructionDialogOperations
    }
    return [{
        name: i18n.value.confirm,
        btnType: 'plain',
        isCloseModal: true,
        onClick: () => {
            storeAction.closeInstructionDialog()
        },
    }]
})
</script>
