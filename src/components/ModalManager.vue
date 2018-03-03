<template>
<section class="modal-manager" v-if="dialogs.length">
    <simple-dialog 
        v-for="(dialog, i) in dialogs" 
        class="dialog" 
        :style="getDialogStyle(i)" 
        :key="dialog.id"
        :data="dialog"
        @close="close(dialog)">
    </simple-dialog>
</section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import SimpleDialog from './widget/SimpleDialog.vue';
import DialogBean from '../bean/DialogBean';
import DialogOperation from '../bean/DialogOperation';
import * as tags from '../service/tags';
import Logger from '../utils/Logger';

export default {
    name: 'ModalManager',

    components: { SimpleDialog },

    data() {
        return {};
    },

    computed: {
        ...mapGetters(['string', 'dialogs'])
        // dialogs2() {
        //     return [
        //         new DialogBean(tags.DIALOG_NORMAL, 'Title', 'This is content', [
        //             new DialogOperation(this.string.confirm, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
        //                 Logger.logText('Modal', 'confirm');
        //             }),
        //             new DialogOperation(this.string.confirm, tags.DIALOG_OPERATION_TYPE_POSITIVE, () => {
        //                 Logger.logText('Modal', 'confirm');
        //             }),
        //             new DialogOperation(this.string.confirm, tags.DIALOG_OPERATION_TYPE_NEGATIVE, () => {
        //                 Logger.logText('Modal', 'confirm');
        //             }),
        //             new DialogOperation(this.string.confirm, tags.DIALOG_OPERATION_TYPE_WARNING, () => {
        //                 Logger.logText('Modal', 'confirm');
        //             })
        //         ])
                // new DialogBean(tags.DIALOG_NORMAL, 'Title', 'This is content', [
                //     new DialogOperation(this.string.confirm, tags.DIALOG_OPERATION_TYPE_POSITIVE, () => {
                //         Logger.logText('Modal', 'confirm');
                //     })
                // ]),
                // new DialogBean(tags.DIALOG_NORMAL, 'Title', 'This is content', [
                //     new DialogOperation(this.string.confirm, tags.DIALOG_OPERATION_TYPE_NEGATIVE, () => {
                //         Logger.logText('Modal', 'confirm');
                //     })
                // ]),
                // new DialogBean(tags.DIALOG_NORMAL, 'Title', 'This is content', [
                //     new DialogOperation(this.string.confirm, tags.DIALOG_OPERATION_TYPE_WARNING, () => {
                //         Logger.logText('Modal', 'confirm');
                //     })
                // ])
            // ];
        // }
    },

    methods: {
        ...mapActions(['addDialog', 'removeDialog']),
        getDialogStyle(i) {
            return { 'z-index': i + 100 };
        },
        close(dialog) {
        }
    }
};
</script>

<style lang="scss" scoped>
@import '~style/_responsive';
@import '~style/_variables';

.modal-manager {
    > .dialog {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
}
</style>