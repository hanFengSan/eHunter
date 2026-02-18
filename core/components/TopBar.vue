<template>
    <nav class="top-bar">
        <div class="float-content">
            <CircleIconButton class="button tips tips-left tips-down" icon-type="expand"
                :title-content="i18n.openMoreSettingsModal" @click="storeAction.openMoreSettingsDialog()" size="normal"/>
            <CircleIconButton class="button tips tips-left tips-down" icon-type="menu"
                :title-content="i18n.toggleTopBar" :rotate="store.showTopBar" @click="storeAction.toggleShowTopBar()" size="normal"/>
            <CircleIconButton class="button tips tips-left tips-down" icon-type="close"
                :title-content="i18n.closeEHunter" @click="closeEHunter" size="normal"/>
        </div>
        <div :class="['inner-content', { hide: !store.showTopBar }]">
            <div class="item" v-for="field in topBarFields" :key="field.id" :class="{ 'less-margin': field.id === 'lang' }">
                <span
                    class="label tips tips-down tips-right"
                    :title-content="field.tipI18nKey ? i18n[field.tipI18nKey] : ''">
                    {{ i18n[field.labelI18nKey] }}:
                </span>
                <DropOption
                    v-if="field.control === 'drop'"
                    :list="getDropList(field.id)"
                    :cur-val="getFieldValue(field.id)"
                    :format-cur-val-by-list="true"
                    :use-abbr-name="!!field.useAbbrName"
                    @change="(val) => handleFieldChange(field.id, val)" />
                <NumDropOption
                    v-else-if="field.control === 'num'"
                    :quick-options="getNumList(field.id)"
                    :cur-val="getFieldValue(field.id)"
                    :suffix="getNumSuffix(field.id)"
                    :min="field.min || 0"
                    :max="field.max || 999"
                    :is-float="!!field.isFloat"
                    @change="(val) => handleFieldChange(field.id, val)" />
                <SimpleSwitch
                    v-else-if="field.control === 'switch'"
                    :active="!!getFieldValue(field.id)"
                    @change="(val) => handleFieldChange(field.id, val)" />
            </div>
        </div>
        <MoreSettingsDialog />
    </nav>
</template>

<script setup lang="ts">
/// <reference types="vite-svg-loader" />
import DropOption from './widget/DropOption.vue'
import NumDropOption from './widget/NumDropOption.vue'
import SimpleSwitch from './widget/SimpleSwitch.vue'
import CircleIconButton from './widget/CircleIconButton.vue'
import { i18n } from '../store/i18n'
import { store, storeAction, computedVisibleQuickSettingIds, settingFieldMap } from '../store/app'
import MoreSettingsDialog from './MoreSettingsDialog.vue'
import { computed } from 'vue'
import { getFieldValue, setFieldValue, getDropList, getNumList, getNumSuffix } from '../store/settingFieldRuntime'

const emit = defineEmits(['closeEHunter'])

const topBarFields = computed(() => {
    return computedVisibleQuickSettingIds.value
        .map(id => settingFieldMap[id])
        .filter((field): field is NonNullable<typeof field> => !!field)
        .filter(field => {
            if (!field.showInTopBar) {
                return false
            }
            if (field.modeScope === 'scroll-only' && store.readingMode !== 0) {
                return false
            }
            if (field.modeScope === 'book-only' && store.readingMode !== 1) {
                return false
            }
            if (field.requireThumbSupportInTopBar && !store.isSupportThumbView) {
                return false
            }
            return true
        })
})

function handleFieldChange(id: string, val: any) {
    setFieldValue(id, val)
}

function closeEHunter() {
    emit('closeEHunter')
}
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

div {
    display: flex;
}

.top-bar {
    width: 100%;
    padding: 0;
    margin: 0;
    background: transparent;
    position: relative;

    >.float-content {
        position: absolute;
        top: 0;
        right: 0;
        align-items: center;
        z-index: 20000;
        height: v-bind('store.topBarHeight+"px"');

        >.button {
            margin-right: 13px;
        }
    }

    >.inner-content {
        color: white;
        flex-grow: 1;
        background: $accent_color;
        font-size: 14px;
        transition: all 0.3s ease;
        height: v-bind('store.topBarHeight + "px"');

        >.item {
            margin-left: 18px;
            position: relative;
            height: 40px;

            &.less-margin {
                margin-left: 10px;
            }

            &.icon-margin {
                margin-left: 15px;
            }

            >.label {
                display: flex;
                align-items: center;
                font-size: 14px;
                margin: auto;
                white-space: nowrap;
                cursor: default;

                &.icon {
                    >svg {
                        fill: white;
                        height: 18px;
                        width: 18px;

                        &.reset {
                            height: 18px;
                            width: 18px;
                        }

                        &.info {
                            height: 20px;
                            width: 20px;
                        }

                        &.github {
                            height: 17px;
                            height: 17px;
                        }
                    }
                }

                &.clickable {
                    cursor: pointer;
                }
            }
        }

        &.hide {
            transform: translateY(-100%);
        }

    }
}
</style>
