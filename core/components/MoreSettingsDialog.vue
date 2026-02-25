<template>
    <teleport to=".ehunter-app">
        <transition name="slow-opacity-fade" appear>
            <div v-if="store.showMoreSettingsDialog" class="ehunter-more-settings-modal" @click.self="storeAction.closeMoreSettingsDialog">
                <div class="ehunter-panel" @click.stop="onPanelClick">
                    <header class="ehunter-panel-header">
                        <h3>{{ i18n.openMoreSettingsModal }}</h3>
                        <button class="ehunter-close-btn" type="button" :aria-label="i18n.cancel" @click="storeAction.closeMoreSettingsDialog">×</button>
                    </header>
                    <div class="ehunter-panel-body">
                        <nav class="ehunter-left-nav">
                            <button
                                v-for="category in settingsCategories"
                                :key="category.id"
                                :class="['ehunter-category', { 'ehunter-active': store.activeSettingsCategory === category.id }]"
                                @click="scrollToCategory(category.id)">
                                {{ i18n[category.i18nKey] }}
                            </button>
                        </nav>
                        <section ref="contentRef" class="ehunter-content" @scroll="onContentScroll">
                            <article ref="generalRef" class="ehunter-group" data-category="general">
                                <h4>{{ i18n.settingsGeneral }}</h4>
                                <div class="ehunter-row" v-for="fieldId in dialogGeneralFieldIds" :key="fieldId">
                                    <div class="ehunter-label-block">
                                        <span class="ehunter-label">{{ fieldLabel(fieldId) }}</span>
                                        <p v-if="fieldTip(fieldId)" class="ehunter-tip">{{ fieldTip(fieldId) }}</p>
                                    </div>
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

                            <article ref="scrollRef" class="ehunter-group" data-category="scroll">
                                <h4>{{ i18n.settingsScrollMode }}</h4>
                                <div class="ehunter-row" v-for="fieldId in dialogScrollFieldIds" :key="fieldId">
                                    <div class="ehunter-label-block">
                                        <span class="ehunter-label">{{ fieldLabel(fieldId) }}</span>
                                        <p v-if="fieldTip(fieldId)" class="ehunter-tip">{{ fieldTip(fieldId) }}</p>
                                    </div>
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

                            <article ref="bookRef" class="ehunter-group" data-category="book">
                                <h4>{{ i18n.settingsBookMode }}</h4>
                                <div class="ehunter-row" v-for="fieldId in dialogBookFieldIds" :key="fieldId">
                                    <div class="ehunter-label-block">
                                        <span class="ehunter-label">{{ fieldLabel(fieldId) }}</span>
                                        <p v-if="fieldTip(fieldId)" class="ehunter-tip">{{ fieldTip(fieldId) }}</p>
                                    </div>
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

                            <article ref="quickRef" class="ehunter-group" data-category="quick">
                                <h4>{{ i18n.settingsQuick }}</h4>
                                <div class="ehunter-quick-lanes">
                                    <p class="ehunter-lane-intro">{{ i18n.quickDragHint }}</p>
                                    <div
                                        class="ehunter-quick-lane"
                                        @dragover.prevent
                                        @drop.stop="onDropToLane($event, true)">
                                        <header class="ehunter-lane-header">{{ i18n.enabled }}</header>
                                        <p class="ehunter-lane-desc">{{ i18n.quickEnabledHint }}</p>
                                        <div
                                            v-for="item in enabledQuickSettingList"
                                            :key="`enabled-${item.id}`"
                                            class="ehunter-quick-item"
                                            draggable="true"
                                            :data-id="item.id"
                                            @contextmenu.prevent
                                            @selectstart.prevent
                                            @dragstart="onDragStart($event, item.id)"
                                            @dragend="onDragEnd"
                                            @dragover.prevent
                                            @drop.stop="onDropToItem($event, item.id, true)">
                                            <span class="ehunter-drag-handle" aria-hidden="true"></span>
                                            <span class="ehunter-label">{{ quickItemLabel(item.id, item.i18nKey) }}</span>
                                            <span v-if="modeScopeText(item.modeScope)" class="ehunter-mode-tag">{{ modeScopeText(item.modeScope) }}</span>
                                        </div>
                                    </div>
                                    <div class="ehunter-lane-divider"></div>
                                    <div
                                        class="ehunter-quick-lane ehunter-hidden"
                                        @dragover.prevent
                                        @drop.stop="onDropToLane($event, false)">
                                        <header class="ehunter-lane-header">{{ i18n.hidden }}</header>
                                        <p class="ehunter-lane-desc">{{ i18n.quickHiddenHint }}</p>
                                        <div
                                            v-for="item in hiddenQuickSettingList"
                                            :key="`hidden-${item.id}`"
                                            class="ehunter-quick-item"
                                            draggable="true"
                                            :data-id="item.id"
                                            @contextmenu.prevent
                                            @selectstart.prevent
                                            @dragstart="onDragStart($event, item.id)"
                                            @dragend="onDragEnd"
                                            @dragover.prevent
                                            @drop.stop="onDropToItem($event, item.id, false)">
                                            <span class="ehunter-drag-handle" aria-hidden="true"></span>
                                            <span class="ehunter-label">{{ quickItemLabel(item.id, item.i18nKey) }}</span>
                                            <span v-if="modeScopeText(item.modeScope)" class="ehunter-mode-tag">{{ modeScopeText(item.modeScope) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <article ref="shortcutsRef" class="ehunter-group" data-category="shortcuts">
                                <h4>{{ i18n.settingsShortcuts }}</h4>
                                <p class="ehunter-shortcut-intro">{{ i18n.shortcutEditHint }}</p>
                                <div class="ehunter-row" v-for="action in shortcutActionDefinitions" :key="action.id">
                                    <div class="ehunter-label-block">
                                        <span class="ehunter-label">{{ i18n[action.labelI18nKey] }}</span>
                                        <p v-if="shortcutTip(action.id, action.tipI18nKey)" class="ehunter-tip">{{ shortcutTip(action.id, action.tipI18nKey) }}</p>
                                    </div>
                                    <div class="ehunter-shortcut-editor">
                                        <transition-group name="ehunter-shortcut-chip-list" tag="div" class="ehunter-shortcut-chips">
                                            <button
                                                v-for="key in shortcutBindingList(action.id)"
                                                :key="`${action.id}-${key}`"
                                                class="ehunter-shortcut-chip"
                                                @click="removeShortcutBinding(action.id, key)">
                                                <span class="ehunter-chip-key">{{ shortcutKeyLabel(key) }}</span>
                                                <span class="ehunter-chip-remove">×</span>
                                            </button>
                                        </transition-group>
                                        <div class="ehunter-shortcut-add">
                                            <button class="ehunter-shortcut-add-btn" @click="toggleShortcutDropdown(action.id)">
                                                <span class="ehunter-shortcut-add-icon">+</span>
                                            </button>
                                            <select
                                                v-if="openedShortcutDropdown === action.id"
                                                class="ehunter-shortcut-select"
                                                :value="''"
                                                @change="addShortcutBinding(action.id, ($event.target as HTMLSelectElement).value)">
                                                <option value="" disabled selected>{{ i18n.shortcutAddPlaceholder }}</option>
                                                <option
                                                    v-for="candidate in availableShortcutCandidates(action.id)"
                                                    :key="`${action.id}-candidate-${candidate}`"
                                                    :value="candidate">{{ shortcutKeyLabel(candidate) }}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="ehunter-row">
                                    <span class="ehunter-label">{{ i18n.shortcutResetLabel }}</span>
                                    <button class="ehunter-action" @click="storeAction.resetShortcutBindings">{{ i18n.shortcutResetAction }}</button>
                                </div>
                            </article>

                            <article ref="otherRef" class="ehunter-group" data-category="other">
                                <h4>{{ i18n.settingsOther }}</h4>
                                <div class="ehunter-row">
                                    <span class="ehunter-label">{{ i18n.versionLabel }}</span>
                                    <span class="ehunter-value">{{ versionText }}</span>
                                </div>
                                <div class="ehunter-row">
                                    <span class="ehunter-label">{{ i18n.infoTip }}</span>
                                    <button class="ehunter-action" @click="storeAction.openWelcomeInstructionDialog">{{ i18n.infoTip }}</button>
                                </div>
                                <div class="ehunter-row">
                                    <span class="ehunter-label">Github</span>
                                    <a target="_blank" href="https://github.com/hanFengSan/eHunter" class="ehunter-link">https://github.com/hanFengSan/eHunter</a>
                                </div>
                                <div class="ehunter-row">
                                    <span class="ehunter-label">{{ i18n.resetTip }}</span>
                                    <button class="ehunter-danger" @click="storeAction.showFactoryResetDialog">{{ i18n.resetTip }}</button>
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
import { computed, ref, onMounted, onUnmounted } from 'vue'
import pkgJson from '../../package.json'
import DropOption from './widget/DropOption.vue'
import NumDropOption from './widget/NumDropOption.vue'
import SimpleSwitch from './widget/SimpleSwitch.vue'
import SimpleDialog from './widget/SimpleDialog.vue'
import { i18n } from '../store/i18n'
import { store, storeAction, settingsCategories, quickSettingOptions, settingFieldMap, shortcutActionDefinitions, shortcutKeyCandidates, type ShortcutActionId } from '../store/app'
import { getFieldValue, setFieldValue, getDropList, getNumList, getNumSuffix, getDialogFieldIds } from '../store/settingFieldRuntime'

const contentRef = ref<HTMLElement | null>(null)
const generalRef = ref<HTMLElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)
const bookRef = ref<HTMLElement | null>(null)
const quickRef = ref<HTMLElement | null>(null)
const shortcutsRef = ref<HTMLElement | null>(null)
const otherRef = ref<HTMLElement | null>(null)
const dragSourceId = ref('')
const openedShortcutDropdown = ref<ShortcutActionId | ''>('')
const pinnedQuickSettingId = 'readingMode'

const versionText = computed(() => pkgJson.version)

function handleContentDragOver(e: DragEvent) {
    if (dragSourceId.value) {
        e.preventDefault()
    }
}

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

function fieldTip(id: string): string {
    const field = settingFieldMap[id]
    if (!field || !field.tipI18nKey) {
        return ''
    }
    const tip = i18n.value[field.tipI18nKey] || ''
    const label = i18n.value[field.labelI18nKey] || ''
    if (!tip || tip === label) {
        return ''
    }
    return tip
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
        case 'shortcuts':
            return shortcutsRef.value
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
        { id: 'shortcuts', elem: shortcutsRef.value },
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
    const sourceIndex = ids.indexOf(sourceId)
    const target = ids.includes(targetId) ? targetId : ''
    if (!target || sourceIndex < 0) {
        return
    }
    const targetIndex = ids.indexOf(target)
    if (targetIndex < 0) {
        return
    }
    const insertBeforeTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
    storeAction.moveQuickSettingItem(sourceId, insertBeforeTargetIndex)
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
    if (targetId === pinnedQuickSettingId && dragSourceId.value !== pinnedQuickSettingId) {
        const firstMovable = quickSettingManageList.value.find(item => storeAction.isQuickSettingSelected(item.id))
        if (firstMovable) {
            targetId = firstMovable.id
        }
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
    const laneList = (selected ? enabledQuickSettingList.value : hiddenQuickSettingList.value)
        .filter(item => item.id !== pinnedQuickSettingId)
    if (laneList.length > 0) {
        const anchor = laneList[laneList.length - 1]
        if (anchor) {
            moveQuickToTarget(dragSourceId.value, anchor.id)
        }
    } else if (selected) {
        const firstMovable = quickSettingManageList.value.find(item => storeAction.isQuickSettingSelected(item.id))
        if (firstMovable) {
            moveQuickToTarget(dragSourceId.value, firstMovable.id)
        }
    }
    dragSourceId.value = ''
}

function shortcutTip(actionId: string, tipI18nKey?: string): string {
    const tip = tipI18nKey ? (i18n.value[tipI18nKey] || '') : ''
    const list = shortcutBindingList(actionId as ShortcutActionId)
    if (list.length > 0) {
        return `${tip ? `${tip} · ` : ''}${i18n.value.currentShortcut}: ${list.map(shortcutKeyLabel).join(' / ')}`
    }
    return tip
}

function shortcutKeyLabel(key: string): string {
    const found = shortcutKeyCandidates.find(item => item.key.toLowerCase() === key.toLowerCase())
    return found ? found.label : key
}

function shortcutBindingList(actionId: ShortcutActionId): string[] {
    const binding = store.shortcutBindings[actionId]
    if (!binding) {
        return []
    }
    return binding
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
}

function availableShortcutCandidates(actionId: ShortcutActionId): string[] {
    const selected = new Set(shortcutBindingList(actionId).map(item => item.toLowerCase()))
    return shortcutKeyCandidates
        .map(item => item.key)
        .filter(item => !selected.has(item.toLowerCase()))
}

function updateShortcutBindingList(actionId: ShortcutActionId, list: string[]) {
    storeAction.setShortcutBinding(actionId, list.join(','))
}

function removeShortcutBinding(actionId: ShortcutActionId, key: string) {
    const next = shortcutBindingList(actionId).filter(item => item.toLowerCase() !== key.toLowerCase())
    updateShortcutBindingList(actionId, next)
}

function toggleShortcutDropdown(actionId: ShortcutActionId) {
    if (openedShortcutDropdown.value === actionId) {
        openedShortcutDropdown.value = ''
    } else {
        openedShortcutDropdown.value = actionId
    }
}

function onPanelClick(event: MouseEvent) {
    if (!openedShortcutDropdown.value) {
        return
    }
    const target = event.target as HTMLElement | null
    if (target && target.closest('.ehunter-shortcut-add')) {
        return
    }
    openedShortcutDropdown.value = ''
}

function addShortcutBinding(actionId: ShortcutActionId, key: string) {
    const normalized = key.trim()
    if (!normalized) {
        return
    }
    const current = shortcutBindingList(actionId)
    if (current.some(item => item.toLowerCase() === normalized.toLowerCase())) {
        openedShortcutDropdown.value = ''
        return
    }
    current.push(normalized)
    updateShortcutBindingList(actionId, current)
    openedShortcutDropdown.value = ''
}

onMounted(() => {
    onContentScroll()
    if (contentRef.value) {
        contentRef.value.addEventListener('dragover', handleContentDragOver)
    }
})

onUnmounted(() => {
    if (contentRef.value) {
        contentRef.value.removeEventListener('dragover', handleContentDragOver)
    }
})
</script>

<style lang="scss" scoped>
@import '../style/_responsive';
@import '../style/_variables';

.ehunter-more-settings-modal {
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

    > .ehunter-panel {
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

        > .ehunter-panel-header {
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

            > .ehunter-close-btn {
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

        > .ehunter-panel-body {
            flex: 1;
            min-height: 0;
            display: flex;

            > .ehunter-left-nav {
                margin: 0px;
                width: 210px;
                padding: 14px 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                border-right: 1px solid rgba(88, 113, 158, 0.16);
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(245, 250, 255, 0.72));

                > .ehunter-category {
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

                    &.ehunter-active {
                        background: #dff3e5;
                        color: #2a6142;
                        font-weight: 700;
                        box-shadow: inset 0 0 0 1px #8cc5a0;
                    }
                }
            }

            > .ehunter-content {
                flex: 1;
                min-width: 0;
                min-height: 0;
                overflow: auto;
                display: block;
                padding: 16px 18px;
                scroll-behavior: smooth;

                > .ehunter-group {
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

                    > .ehunter-row {
                        display: flex;
                        flex-direction: row;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 12px;
                        margin: 8px 0;
                        color: #2f415d;
                        min-height: 42px;
                        padding: 6px 0;

                        &:not(:last-child) {
                            border-bottom: 1px dashed rgba(128, 150, 186, 0.2);
                        }

                        > .ehunter-label-block {
                            min-width: 0;
                            flex: 1;
                            flex-shrink: 0;
                            display: flex;
                            flex-direction: column;
                            gap: 2px;

                            > .ehunter-label {
                                font-size: 14px;
                                color: #2f466d;
                                font-weight: 500;
                            }

                            > .ehunter-tip {
                                margin: 0;
                                font-size: 11px;
                                line-height: 1.3;
                                color: #7a879c;
                                white-space: normal;
                                overflow-wrap: anywhere;
                                word-break: break-word;
                            }
                        }

                        > .ehunter-label {
                            font-size: 14px;
                            color: #2f466d;
                            font-weight: 500;
                            min-width: 120px;
                            flex-shrink: 0;
                        }

                        > :not(.ehunter-label):not(.ehunter-label-block) {
                            margin-left: auto;
                        }

                        > .ehunter-value {
                            font-size: 13px;
                            color: #476088;
                        }

                        > .ehunter-link {
                            color: #2b5da5;
                            text-decoration: none;
                            font-size: 13px;
                            word-break: break-all;
                            text-align: right;
                            max-width: 66%;
                        }

                        > .ehunter-danger {
                            border: 1px solid #d9a5a5;
                            border-radius: 8px;
                            background: #fff4f4;
                            color: #8a4646;
                            font-size: 13px;
                            padding: 8px 12px;
                            cursor: pointer;

                            &:hover {
                                background: #ffe9e9;
                                border-color: #cf8e8e;
                            }
                        }

                        > .ehunter-action {
                            border: 1px solid #8bc7a0;
                            border-radius: 8px;
                            background: #f2fff6;
                            color: #2a5f41;
                            font-size: 13px;
                            padding: 8px 12px;
                            cursor: pointer;
                            font-weight: 600;

                            &:hover {
                                background: #e6f7ec;
                                border-color: #77b88f;
                            }
                        }
                    }

                    > .ehunter-quick-lanes {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        padding: 0 2px;

                        > .ehunter-lane-intro {
                            margin: 0;
                            font-size: 12px;
                            color: #5a6c8c;
                            line-height: 1.35;
                        }

                        > .ehunter-lane-divider {
                            width: 100%;
                            height: 1px;
                            background: linear-gradient(90deg, rgba(126, 146, 178, 0), rgba(126, 146, 178, 0.5), rgba(126, 146, 178, 0));
                            margin: 2px 0;
                        }

                        > .ehunter-quick-lane {
                            display: flex;
                            flex-direction: column;
                            align-items: stretch;
                            padding: 0 2px;

                            > .ehunter-lane-header {
                                margin: 0;
                                font-size: 12px;
                                color: #355a96;
                                font-weight: 700;
                            }

                            > .ehunter-lane-desc {
                                margin: 2px 0 5px;
                                font-size: 11px;
                                color: #6c7f9f;
                                line-height: 1.25;
                            }

                            > .ehunter-quick-item {
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
                                 user-select: none;
                                 -webkit-user-select: none;
                                 -webkit-touch-callout: none;
                                 touch-action: manipulation;

                                * {
                                    user-select: none;
                                    -webkit-user-select: none;
                                    -webkit-touch-callout: none;
                                }

                                &:hover {
                                    background: rgba(232, 243, 255, 0.92);
                                    border-color: rgba(82, 120, 184, 0.36);
                                }

                                > .ehunter-drag-handle {
                                    width: 10px;
                                    height: 10px;
                                    opacity: 0.8;
                                    background:
                                        radial-gradient(circle, #5f7498 1.1px, transparent 1.2px) 0 0 / 6px 6px,
                                        radial-gradient(circle, #5f7498 1.1px, transparent 1.2px) 3px 3px / 6px 6px;
                                }

                                > .ehunter-label {
                                    font-size: 13px;
                                    color: #2e4264;
                                    pointer-events: none;
                                }

                                > .ehunter-mode-tag {
                                    font-size: 11px;
                                    color: #6a7d9c;
                                    pointer-events: none;
                                }
                            }

                            &.ehunter-hidden {
                                > .ehunter-lane-header {
                                    color: #6d7a8e;
                                }

                                > .ehunter-quick-item {
                                    background: rgba(236, 240, 246, 0.92);
                                    border-color: rgba(141, 153, 174, 0.25);

                                    > .ehunter-drag-handle {
                                        opacity: 0.52;
                                        background:
                                            radial-gradient(circle, #8191a8 1.1px, transparent 1.2px) 0 0 / 6px 6px,
                                            radial-gradient(circle, #8191a8 1.1px, transparent 1.2px) 3px 3px / 6px 6px;
                                    }

                                    > .ehunter-label,
                                    > .ehunter-mode-tag {
                                        color: #7e889a;
                                    }
                                }
                            }
                        }
                    }

                    > .ehunter-shortcut-intro {
                        margin: 0 0 8px;
                        font-size: 12px;
                        line-height: 1.35;
                        color: #5c6e8d;
                    }
                }
            }
        }
    }
}

@include responsive($breakpoint-md) {
}

@media only screen and (max-width: 767px) {
    .ehunter-more-settings-modal {
        padding: 0;

        > .ehunter-panel {
            width: 100%;
            height: 100%;
            border-radius: 0;

            > .ehunter-panel-body {
                flex-direction: column;

                > .ehunter-left-nav {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid rgba(71, 89, 126, 0.15);
                    flex-direction: row;
                    overflow-x: auto;
                    white-space: nowrap;
                    gap: 6px;
                    padding: 10px;

                    > .ehunter-category {
                        flex-shrink: 0;
                        padding: 8px 10px;
                        font-size: 13px;
                    }
                }

                > .ehunter-content {
                    padding: 12px 14px;

                    > .ehunter-group {
                        > .ehunter-row {
                            > .ehunter-label-block {
                                min-width: 0;
                            }

                            > .ehunter-link {
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
    background: #f2fff6;
    border: 1px solid #86c59e;
    border-radius: 8px;
    color: #2a6042;
    font-weight: 600;
    padding: 4px 10px;
}

:deep(.drop-option > .icon-drop-down) {
    fill: #2a6042;
}

:deep(.drop-option .options) {
    background: #fff;
    border: 1px solid rgba(95, 124, 169, 0.28);
    border-radius: 10px;
    box-shadow: 0 10px 22px rgba(24, 44, 80, 0.16);
}

.ehunter-shortcut-editor {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    flex-wrap: wrap;
    max-width: 56%;
}

.ehunter-shortcut-chips {
    display: flex;
    flex-direction: row;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.ehunter-shortcut-chip {
    border: 1px solid #8bc7a0;
    border-radius: 999px;
    background: #f4fff7;
    color: #25543a;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 1;
    padding: 4px 8px;
    max-width: 180px;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover {
        background: #ecfaef;
        border-color: #6fb88b;
    }

    > .ehunter-chip-key {
        display: block;
        font-weight: 600;
        text-align: center;
    }

    > .ehunter-chip-remove {
        font-weight: 700;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 0;
        margin-left: 0;
        text-align: center;
        overflow: hidden;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: width 0.15s ease, margin-left 0.15s ease, opacity 0.15s ease;
    }

    &:hover > .ehunter-chip-remove,
    &:focus-visible > .ehunter-chip-remove {
        width: 10px;
        margin-left: 4px;
        opacity: 0.8;
    }
}

.ehunter-shortcut-chip-list-enter-active,
.ehunter-shortcut-chip-list-leave-active {
    transition: opacity 0.16s ease, transform 0.16s ease, max-width 0.16s ease, margin 0.16s ease, padding 0.16s ease;
}

.ehunter-shortcut-chip-list-move {
    transition: transform 0.16s ease;
}

.ehunter-shortcut-chip-list-enter-from,
.ehunter-shortcut-chip-list-leave-to {
    opacity: 0;
    transform: scale(0.88);
}

.ehunter-shortcut-chip-list-leave-to {
    max-width: 0;
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
    border-width: 0;
}

.ehunter-shortcut-add {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
}

.ehunter-shortcut-add-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #7fbe98;
    background: #effbf2;
    color: #2b6a47;
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    padding: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
        background: #e2f5e8;
        border-color: #69ae85;
    }
}

.ehunter-shortcut-add-icon {
    display: block;
    line-height: 1;
    transform: translateY(-1px);
    pointer-events: none;
}

.ehunter-shortcut-select {
    min-width: 110px;
    max-width: 150px;
    border: 1px solid #8bc7a0;
    border-radius: 7px;
    background: #f6fff8;
    color: #2b5d41;
    font-size: 11px;
    line-height: 1.2;
    padding: 4px 7px;
}
</style>
