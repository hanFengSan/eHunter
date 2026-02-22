<template>
    <SimpleDialog
        v-for="(dialog, index) in store.instructionDialogStack"
        :key="dialog.id"
        :active="true"
        :title="dialog.title || i18n.instructionsAndAbouts"
        :is-compulsive="dialog.isCompulsive !== false"
        :md-text="dialog.mdText"
        :operations="getDialogOperations(dialog.id, dialog.operations)"
        :style="{ zIndex: 10030 + index }"
        @close="storeAction.closeInstructionDialog(dialog.id)" />
</template>

<script setup lang="ts">
import type { InstructionDialogOperation } from '../../store/app'
import { i18n } from '../../store/i18n'
import { store, storeAction } from '../../store/app'
import SimpleDialog from '../widget/SimpleDialog.vue'

function getDialogOperations(dialogId: string, operations?: InstructionDialogOperation[]) {
    if (operations && operations.length > 0) {
        return operations
    }
    return [{
        name: i18n.value.confirm,
        btnType: 'plain',
        isCloseModal: true,
        onClick: () => {
            storeAction.closeInstructionDialog(dialogId)
        },
    }]
}
</script>
