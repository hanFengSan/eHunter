<template>
<transition name="slow-opacity-fade">
    <section class="modal-manager" v-if="dialogs.length">
        <transition-group name="vertical-list" tag="p">
            <simple-dialog 
                v-for="(dialog, i) in dialogs" 
                class="dialog" 
                :style="getDialogStyle(i)" 
                :key="dialog.id"
                :data="dialog"
                @close="removeDialog(dialog)">
            </simple-dialog>
        </transition-group>
    </section>
</transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import SimpleDialog from './widget/SimpleDialog.vue';

export default {
    name: 'ModalManager',

    components: { SimpleDialog },

    data() {
        return {};
    },

    computed: {
        ...mapGetters(['string', 'dialogs'])
    },

    methods: {
        ...mapActions(['addDialog', 'removeDialog']),
        getDialogStyle(i) {
            return { 'z-index': i + 100 };
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

.modal-manager {
    .dialog {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
}
</style>