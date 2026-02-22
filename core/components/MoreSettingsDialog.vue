<template>
    <teleport to="#ehunter-app">
        <transition name="slow-opacity-fade" appear>
            <div v-if="store.showMoreSettingsDialog" class="more-settings-modal" @click.self="storeAction.closeMoreSettingsDialog">
                <div class="panel" @click.stop>
                    <header class="panel-header">
                        <h3>{{ i18n.openMoreSettingsModal }}</h3>
                        <button class="close-btn" type="button" :aria-label="i18n.cancel" @click="storeAction.closeMoreSettingsDialog">×</button>
                    </header>
                    <div class="panel-body">
                        <nav class="left-nav">
                            <button
                                v-for="category in settingsCategories"
                                :key="category.id"
                                :class="['category', { active: store.activeSettingsCategory === category.id }]"
                                @click="scrollToCategory(category.id)">
                                {{ i18n[category.i18nKey] }}
                            </button>
                        </nav>
                        <section ref="contentRef" class="content" @scroll="onContentScroll">
                            <article ref="generalRef" class="group" data-category="general">
                                <h4>{{ i18n.settingsGeneral }}</h4>
                                <div class="row" v-for="fieldId in dialogGeneralFieldIds" :key="fieldId">
                                    <span class="label">{{ fieldLabel(fieldId) }}</span>
                                    <DropOption
                                        v-if="settingFieldMap[fieldId]?.control === 'drop'"
                                        :list="getDropList(fieldId)"
                                        :cur-val="getFieldValue(fieldId)"
                                        :format-cur-val-by-list="true"
                                        :use-abbr-name="!!settingFieldMap[fieldId]?.useAbbrName"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                    <NumDropOption
                                        v-else-if="settingFieldMap[fieldId]?.control === 'num'"
                                        :quick-options="getNumList(fieldId)"
                                        :cur-val="getFieldValue(fieldId)"
                                        :suffix="getNumSuffix(fieldId)"
                                        :min="settingFieldMap[fieldId]?.min || 0"
                                        :max="settingFieldMap[fieldId]?.max || 999"
                                        :is-float="!!settingFieldMap[fieldId]?.isFloat"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                    <SimpleSwitch
                                        v-else-if="settingFieldMap[fieldId]?.control === 'switch'"
                                        :active="!!getFieldValue(fieldId)"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                </div>
                            </article>

                            <article ref="scrollRef" class="group" data-category="scroll">
                                <h4>{{ i18n.settingsScrollMode }}</h4>
                                <div class="row" v-for="fieldId in dialogScrollFieldIds" :key="fieldId">
                                    <span class="label">{{ fieldLabel(fieldId) }}</span>
                                    <DropOption
                                        v-if="settingFieldMap[fieldId]?.control === 'drop'"
                                        :list="getDropList(fieldId)"
                                        :cur-val="getFieldValue(fieldId)"
                                        :format-cur-val-by-list="true"
                                        :use-abbr-name="!!settingFieldMap[fieldId]?.useAbbrName"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                    <NumDropOption
                                        v-else-if="settingFieldMap[fieldId]?.control === 'num'"
                                        :quick-options="getNumList(fieldId)"
                                        :cur-val="getFieldValue(fieldId)"
                                        :suffix="getNumSuffix(fieldId)"
                                        :min="settingFieldMap[fieldId]?.min || 0"
                                        :max="settingFieldMap[fieldId]?.max || 999"
                                        :is-float="!!settingFieldMap[fieldId]?.isFloat"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                    <SimpleSwitch
                                        v-else-if="settingFieldMap[fieldId]?.control === 'switch'"
                                        :active="!!getFieldValue(fieldId)"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                </div>
                            </article>

                            <article ref="bookRef" class="group" data-category="book">
                                <h4>{{ i18n.settingsBookMode }}</h4>
                                <div class="row" v-for="fieldId in dialogBookFieldIds" :key="fieldId">
                                    <span class="label">{{ fieldLabel(fieldId) }}</span>
                                    <DropOption
                                        v-if="settingFieldMap[fieldId]?.control === 'drop'"
                                        :list="getDropList(fieldId)"
                                        :cur-val="getFieldValue(fieldId)"
                                        :format-cur-val-by-list="true"
                                        :use-abbr-name="!!settingFieldMap[fieldId]?.useAbbrName"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                    <NumDropOption
                                        v-else-if="settingFieldMap[fieldId]?.control === 'num'"
                                        :quick-options="getNumList(fieldId)"
                                        :cur-val="getFieldValue(fieldId)"
                                        :suffix="getNumSuffix(fieldId)"
                                        :min="settingFieldMap[fieldId]?.min || 0"
                                        :max="settingFieldMap[fieldId]?.max || 999"
                                        :is-float="!!settingFieldMap[fieldId]?.isFloat"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                    <SimpleSwitch
                                        v-else-if="settingFieldMap[fieldId]?.control === 'switch'"
                                        :active="!!getFieldValue(fieldId)"
                                        @change="(val) => onFieldChange(fieldId, val)" />
                                </div>
                            </article>

                            <article ref="quickRef" class="group" data-category="quick">
                                <h4>{{ i18n.settingsQuick }}</h4>
                                <div class="quick-lanes">
                                    <p class="lane-intro">{{ i18n.quickDragHint }}</p>
                                    <div
                                        class="quick-lane"
                                        @dragover.prevent
                                        @drop="onDropToLane($event, true)">
                                        <header class="lane-header">{{ i18n.enabled }}</header>
                                        <p class="lane-desc">{{ i18n.quickEnabledHint }}</p>
                                        <div
                                            v-for="item in enabledQuickSettingList"
                                            :key="`enabled-${item.id}`"
                                            class="quick-item"
                                            draggable="true"
                                            :data-id="item.id"
                                            @dragstart="onDragStart($event, item.id)"
                                            @dragend="onDragEnd"
                                            @dragover.prevent
                                            @drop="onDropToItem($event, item.id, true)">
                                            <span class="drag-handle" aria-hidden="true"></span>
                                            <span class="label">{{ quickItemLabel(item.id, item.i18nKey) }}</span>
                                            <span v-if="modeScopeText(item.modeScope)" class="mode-tag">{{ modeScopeText(item.modeScope) }}</span>
                                        </div>
                                    </div>
                                    <div class="lane-divider"></div>
                                    <div
                                        class="quick-lane hidden"
                                        @dragover.prevent
                                        @drop="onDropToLane($event, false)">
                                        <header class="lane-header">{{ i18n.hidden }}</header>
                                        <p class="lane-desc">{{ i18n.quickHiddenHint }}</p>
                                        <div
                                            v-for="item in hiddenQuickSettingList"
                                            :key="`hidden-${item.id}`"
                                            class="quick-item"
                                            draggable="true"
                                            :data-id="item.id"
                                            @dragstart="onDragStart($event, item.id)"
                                            @dragend="onDragEnd"
                                            @dragover.prevent
                                            @drop="onDropToItem($event, item.id, false)">
                                            <span class="drag-handle" aria-hidden="true"></span>
                                            <span class="label">{{ quickItemLabel(item.id, item.i18nKey) }}</span>
                                            <span v-if="modeScopeText(item.modeScope)" class="mode-tag">{{ modeScopeText(item.modeScope) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <article ref="otherRef" class="group" data-category="other">
                                <h4>{{ i18n.settingsOther }}</h4>
                                <div class="row">
                                    <span class="label">{{ i18n.versionLabel }}</span>
                                    <span class="value">{{ versionText }}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Github</span>
                                    <a target="_blank" href="https://github.com/hanFengSan/eHunter" class="link">https://github.com/hanFengSan/eHunter</a>
                                </div>
                                <div class="row">
                                    <span class="label">{{ i18n.resetTip }}</span>
                                    <button class="danger" @click="storeAction.showFactoryResetDialog">{{ i18n.resetTip }}</button>
                                </div>
                            </article>
                        </section>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
    <SimpleDialog
        :active="store.isFactoryResetDialogVisible"
        :title="i18n.resetAllConfirmTitle"
        :md-text="i18n.resetAllConfirmDesc"
        :operations="resetOperations"
        @close="storeAction.hideFactoryResetDialog" />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import pkgJson from '../../package.json'
import DropOption from './widget/DropOption.vue'
import NumDropOption from './widget/NumDropOption.vue'
import SimpleSwitch from './widget/SimpleSwitch.vue'
import SimpleDialog from './widget/SimpleDialog.vue'
import { i18n } from '../store/i18n'
import { store, storeAction, settingsCategories, quickSettingOptions, settingFieldMap } from '../store/app'
import { getFieldValue, setFieldValue, getDropList, getNumList, getNumSuffix, getDialogFieldIds } from '../store/settingFieldRuntime'

const contentRef = ref<HTMLElement | null>(null)
const generalRef = ref<HTMLElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)
const bookRef = ref<HTMLElement | null>(null)
const quickRef = ref<HTMLElement | null>(null)
const otherRef = ref<HTMLElement | null>(null)
const dragSourceId = ref('')

const versionText = computed(() => pkgJson.version)

const quickSettingOrderList = computed(() => {
    return store.quickSettingOrder
        .map(id => quickSettingOptions.find(item => item.id === id))
        .filter(item => !!item) as typeof quickSettingOptions
})

const quickSettingManageList = computed(() => {
    return quickSettingOrderList.value.filter(item => !item.fixed)
})

const enabledQuickSettingList = computed(() => {
    return quickSettingManageList.value.filter(item => storeAction.isQuickSettingSelected(item.id))
})

const hiddenQuickSettingList = computed(() => {
    return quickSettingManageList.value.filter(item => !storeAction.isQuickSettingSelected(item.id))
})

const dialogGeneralFieldIds = getDialogFieldIds('general')
const dialogScrollFieldIds = getDialogFieldIds('scroll')
const dialogBookFieldIds = getDialogFieldIds('book')

const resetOperations = computed(() => {
    return [
        {
            name: i18n.value.cancel,
            btnType: 'plain',
            isCloseModal: true,
            onClick: () => storeAction.hideFactoryResetDialog(),
        },
        {
            name: i18n.value.confirm,
            btnType: 'positive',
            isCloseModal: true,
            onClick: () => storeAction.runFactoryReset(),
        },
    ]
})

function modeScopeText(scope: string): string {
    if (scope === 'scroll-only') {
        return i18n.value.scrollMode
    }
    if (scope === 'book-only') {
        return i18n.value.bookMode
    }
    return ''
}

function quickItemLabel(id: string, i18nKey: string): string {
    if (id === 'lang') {
        return i18n.value.languageSetting
    }
    return i18n.value[i18nKey]
}

function fieldLabel(id: string): string {
    const field = settingFieldMap[id]
    if (!field) {
        return id
    }
    return i18n.value[field.labelI18nKey]
}

function onFieldChange(id: string, val: any) {
    setFieldValue(id, val)
}

function getCategoryRef(category: string): HTMLElement | null {
    switch (category) {
        case 'general':
            return generalRef.value
        case 'scroll':
            return scrollRef.value
        case 'book':
            return bookRef.value
        case 'quick':
            return quickRef.value
        case 'other':
            return otherRef.value
        default:
            return null
    }
}

function scrollToCategory(category: any) {
    storeAction.setActiveSettingsCategory(category)
    const target = getCategoryRef(category)
    if (!target || !contentRef.value) {
        return
    }
    const containerRect = contentRef.value.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const nextTop = contentRef.value.scrollTop + (targetRect.top - containerRect.top)
    contentRef.value.scrollTo({
        top: Math.max(0, nextTop),
        behavior: 'smooth',
    })
}

function onContentScroll() {
    if (!contentRef.value) {
        return
    }
    const top = contentRef.value.scrollTop
    const mapping = [
        { id: 'general', elem: generalRef.value },
        { id: 'scroll', elem: scrollRef.value },
        { id: 'book', elem: bookRef.value },
        { id: 'quick', elem: quickRef.value },
        { id: 'other', elem: otherRef.value },
    ]
    let active: any = 'general'
    for (const item of mapping) {
        if (item.elem && top + 20 >= item.elem.offsetTop) {
            active = item.id
        }
    }
    if (active !== store.activeSettingsCategory) {
        storeAction.setActiveSettingsCategory(active)
    }
}

function onDragStart(e: DragEvent, id: string) {
    if (!quickSettingManageList.value.find(item => item.id === id)) {
        return
    }
    dragSourceId.value = id
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', id)
    }
}

function onDragEnd() {
    dragSourceId.value = ''
}

function moveQuickToTarget(sourceId: string, targetId: string) {
    if (sourceId === targetId) {
        return
    }
    const ids = quickSettingManageList.value.map(item => item.id)
    const target = ids.includes(targetId) ? targetId : ''
    if (!target) {
        return
    }
    const index = ids.indexOf(target)
    if (index < 0) {
        return
    }
    storeAction.moveQuickSettingItem(sourceId, index)
}

function ensureQuickSelection(id: string, selected: boolean) {
    const isSelected = storeAction.isQuickSettingSelected(id)
    if (isSelected !== selected) {
        storeAction.toggleQuickSettingSelection(id)
    }
}

function onDropToItem(_: DragEvent, targetId: string, selected: boolean) {
    if (!dragSourceId.value) {
        return
    }
    ensureQuickSelection(dragSourceId.value, selected)
    moveQuickToTarget(dragSourceId.value, targetId)
    dragSourceId.value = ''
}

function onDropToLane(_: DragEvent, selected: boolean) {
    if (!dragSourceId.value) {
        return
    }
    ensureQuickSelection(dragSourceId.value, selected)
    const laneList = selected ? enabledQuickSettingList.value : hiddenQuickSettingList.value
    if (laneList.length > 0) {
        const anchor = laneList[laneList.length - 1]
        if (anchor) {
            moveQuickToTarget(dragSourceId.value, anchor.id)
        }
    }
    dragSourceId.value = ''
}

onMounted(() => {
    onContentScroll()
})
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

.more-settings-modal {
    position: fixed;
    inset: 0;
    background:
        radial-gradient(1200px 700px at 12% 8%, rgba(132, 176, 255, 0.24), rgba(132, 176, 255, 0) 58%),
        radial-gradient(1000px 600px at 100% 100%, rgba(82, 205, 186, 0.2), rgba(82, 205, 186, 0) 55%),
        rgba(16, 24, 39, 0.46);
    backdrop-filter: blur(6px);
    z-index: 10020;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;

    > .panel {
        position: relative;
        width: min(980px, 100%);
        height: min(740px, 100%);
        border-radius: 18px;
        overflow: hidden;
        background: linear-gradient(180deg, #f8fbff 0%, #f2f6fd 100%);
        box-shadow:
            0 28px 70px rgba(6, 19, 38, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
        display: flex;
        flex-direction: column;

        > .panel-header {
            display: flex;
            align-items: center;
            flex-direction: row;
            justify-content: flex-start;
            padding: 14px 56px 14px 20px;
            border-bottom: 1px solid rgba(78, 102, 146, 0.18);
            background: rgba(255, 255, 255, 0.82);

            > h3 {
                margin: 0;
                font-size: 19px;
                color: #1e304f;
                font-weight: 700;
                letter-spacing: 0.2px;
            }

            > .close-btn {
                position: absolute;
                right: 14px;
                top: 12px;
                z-index: 2;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                color: #4a6fa5;
                background: rgba(255, 255, 255, 0.9);
                cursor: pointer;
                font-size: 20px;
                line-height: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(26, 45, 78, 0.12);

                &:hover {
                    background: rgba(235, 243, 255, 1);
                    color: #2d5a9e;
                    transform: scale(1.08);
                    box-shadow: 0 4px 12px rgba(31, 68, 125, 0.18);
                }

                &:active {
                    transform: scale(0.96);
                }
            }
        }

        > .panel-body {
            flex: 1;
            min-height: 0;
            display: flex;

            > .left-nav {
                width: 210px;
                padding: 14px 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                border-right: 1px solid rgba(88, 113, 158, 0.16);
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(245, 250, 255, 0.72));

                > .category {
                    border: none;
                    background: transparent;
                    text-align: left;
                    border-radius: 11px;
                    font-size: 14px;
                    color: #4a5f84;
                    padding: 10px 12px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    font-weight: 500;

                    &:hover {
                        background: rgba(208, 225, 255, 0.55);
                        color: #2b4f86;
                    }

                    &.active {
                        background: linear-gradient(180deg, #dce9ff, #cfe2ff);
                        color: #1f447d;
                        font-weight: 700;
                        box-shadow: inset 0 0 0 1px rgba(63, 106, 177, 0.24);
                    }
                }
            }

            > .content {
                flex: 1;
                min-width: 0;
                min-height: 0;
                overflow: auto;
                display: block;
                padding: 16px 18px;
                scroll-behavior: smooth;

                > .group {
                    display: block;
                    scroll-margin-top: 12px;
                    padding: 14px;
                    border: 1px solid rgba(92, 119, 163, 0.18);
                    border-radius: 14px;
                    margin-bottom: 12px;
                    background: rgba(255, 255, 255, 0.82);
                    box-shadow: 0 8px 24px rgba(26, 45, 78, 0.08);

                    > h4 {
                        margin: 0 0 12px;
                        font-size: 16px;
                        color: #233e67;
                        font-weight: 700;
                    }

                    > .row {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        margin: 8px 0;
                        color: #2f415d;
                        min-height: 42px;
                        padding: 6px 0;

                        &:not(:last-child) {
                            border-bottom: 1px dashed rgba(128, 150, 186, 0.2);
                        }

                        > .label {
                            font-size: 14px;
                            color: #2f466d;
                            font-weight: 500;
                            min-width: 120px;
                            flex-shrink: 0;
                        }

                        > :not(.label) {
                            margin-left: auto;
                        }

                        > .value {
                            font-size: 13px;
                            color: #476088;
                        }

                        > .link {
                            color: #2b5da5;
                            text-decoration: none;
                            font-size: 13px;
                            word-break: break-all;
                            text-align: right;
                            max-width: 66%;
                        }

                        > .danger {
                            border: none;
                            border-radius: 8px;
                            background: linear-gradient(180deg, #e65f5f, #cc3f3f);
                            color: #fff;
                            font-size: 13px;
                            padding: 8px 12px;
                            cursor: pointer;
                            box-shadow: 0 8px 16px rgba(201, 67, 67, 0.26);
                        }
                    }

                    > .quick-lanes {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        padding: 0 2px;

                        > .lane-intro {
                            margin: 0;
                            font-size: 12px;
                            color: #5a6c8c;
                            line-height: 1.35;
                        }

                        > .lane-divider {
                            width: 100%;
                            height: 1px;
                            background: linear-gradient(90deg, rgba(126, 146, 178, 0), rgba(126, 146, 178, 0.5), rgba(126, 146, 178, 0));
                            margin: 2px 0;
                        }

                        > .quick-lane {
                            display: flex;
                            flex-direction: column;
                            align-items: stretch;
                            padding: 0 2px;

                            > .lane-header {
                                margin: 0;
                                font-size: 12px;
                                color: #355a96;
                                font-weight: 700;
                            }

                            > .lane-desc {
                                margin: 2px 0 5px;
                                font-size: 11px;
                                color: #6c7f9f;
                                line-height: 1.25;
                            }

                            > .quick-item {
                                display: grid;
                                grid-template-columns: 16px minmax(0, 1fr) auto;
                                align-items: center;
                                gap: 6px;
                                width: 100%;
                                box-sizing: border-box;
                                border-radius: 7px;
                                border: 1px solid rgba(101, 126, 168, 0.18);
                                background: #fdfefe;
                                margin: 4px 0;
                                padding: 5px 8px;
                                transition: all 0.18s ease;
                                cursor: grab;

                                &:hover {
                                    background: rgba(232, 243, 255, 0.92);
                                    border-color: rgba(82, 120, 184, 0.36);
                                }

                                > .drag-handle {
                                    width: 10px;
                                    height: 10px;
                                    opacity: 0.8;
                                    background:
                                        radial-gradient(circle, #5f7498 1.1px, transparent 1.2px) 0 0 / 6px 6px,
                                        radial-gradient(circle, #5f7498 1.1px, transparent 1.2px) 3px 3px / 6px 6px;
                                }

                                > .label {
                                    font-size: 13px;
                                    color: #2e4264;
                                }

                                > .mode-tag {
                                    font-size: 11px;
                                    color: #6a7d9c;
                                }
                            }

                            &.hidden {
                                > .lane-header {
                                    color: #6d7a8e;
                                }

                                > .quick-item {
                                    background: rgba(236, 240, 246, 0.92);
                                    border-color: rgba(141, 153, 174, 0.25);

                                    > .drag-handle {
                                        opacity: 0.52;
                                        background:
                                            radial-gradient(circle, #8191a8 1.1px, transparent 1.2px) 0 0 / 6px 6px,
                                            radial-gradient(circle, #8191a8 1.1px, transparent 1.2px) 3px 3px / 6px 6px;
                                    }

                                    > .label,
                                    > .mode-tag {
                                        color: #7e889a;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@include responsive($breakpoint-md) {
}

@media only screen and (max-width: 767px) {
    .more-settings-modal {
        padding: 0;

        > .panel {
            width: 100%;
            height: 100%;
            border-radius: 0;

            > .panel-body {
                flex-direction: column;

                > .left-nav {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid rgba(71, 89, 126, 0.15);
                    flex-direction: row;
                    overflow-x: auto;
                    white-space: nowrap;
                    gap: 6px;
                    padding: 10px;

                    > .category {
                        flex-shrink: 0;
                        padding: 8px 10px;
                        font-size: 13px;
                    }
                }

                > .content {
                    padding: 12px 14px;

                    > .group {
                        > .row {
                            > .label {
                                min-width: 96px;
                            }

                            > .link {
                                max-width: 58%;
                            }
                        }
                    }
                }
            }
        }
    }
}

:deep(.drop-option > .text) {
    background: linear-gradient(180deg, #f2f7ff, #e5efff);
    border: 1px solid rgba(93, 124, 176, 0.34);
    border-radius: 8px;
    color: #2f4f7e;
    font-weight: 600;
    padding: 4px 10px;
}

:deep(.drop-option > .icon-drop-down) {
    fill: #2f4f7e;
}

:deep(.drop-option .options) {
    background: #fff;
    border: 1px solid rgba(95, 124, 169, 0.28);
    border-radius: 10px;
    box-shadow: 0 10px 22px rgba(24, 44, 80, 0.16);
}
</style>
