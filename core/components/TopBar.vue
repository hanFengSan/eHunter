<template>
    <nav class="top-bar">
        <div class="float-content" ref="floatContentRef">
            <div class="more-button-wrapper">
                <CircleIconButton class="button tips tips-left tips-down" icon-type="more"
                    :title-content="i18n.more" @click="toggleMoreMenu" size="normal"/>
                <MoreMenuPopover 
                    :active="showMoreMenu"
                    @close="showMoreMenu = false"
                    @more-settings="storeAction.openMoreSettingsDialog()"
                    @quick-preview="storeAction.openThumbExpandDialog()"
                    @download="storeAction.openDownloadConfirmDialog()" />
            </div>
            <CircleIconButton class="button tips tips-left tips-down" icon-type="menu"
                :title-content="i18n.toggleTopBar" :rotate="store.showTopBar" @click="storeAction.toggleShowTopBar()" size="normal"/>
            <CircleIconButton class="button tips tips-left tips-down" icon-type="close"
                :title-content="i18n.closeEHunter" @click="closeEHunter" size="normal"/>
        </div>
        <div :class="['inner-content', { hide: !store.showTopBar }]" ref="innerContentRef">
            <div class="item" v-for="(field, index) in topBarFields" :key="field.id" 
                :class="{ 'less-margin': field.id === 'lang' }"
                :style="getItemStyle(index)">
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
        <DownloadConfirmDialog />
    </nav>
</template>

<script setup lang="ts">
/// <reference types="vite-svg-loader" />
import DropOption from './widget/DropOption.vue'
import NumDropOption from './widget/NumDropOption.vue'
import SimpleSwitch from './widget/SimpleSwitch.vue'
import CircleIconButton from './widget/CircleIconButton.vue'
import MoreMenuPopover from './widget/MoreMenuPopover.vue'
import { i18n } from '../store/i18n'
import { store, storeAction, computedVisibleQuickSettingIds, settingFieldMap } from '../store/app'
import MoreSettingsDialog from './MoreSettingsDialog.vue'
import DownloadConfirmDialog from './dialog/DownloadConfirmDialog.vue'
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { getFieldValue, setFieldValue, getDropList, getNumList, getNumSuffix } from '../store/settingFieldRuntime'

const emit = defineEmits(['closeEHunter'])

const showMoreMenu = ref(false)
const innerContentRef = ref<HTMLElement | null>(null)
const floatContentRef = ref<HTMLElement | null>(null)
const itemVisibility = ref<boolean[]>([])
const isMeasuring = ref(false)

// 防抖定时器
let checkOverlapTimer: number | null = null

// 获取元素的样式
function getItemStyle(index: number) {
    if (isMeasuring.value) {
        // 测量阶段：使用 visibility: hidden 保持布局但不可见
        return { visibility: 'hidden' }
    }
    // 正常阶段：根据 itemVisibility 决定是否显示
    if (itemVisibility.value[index] === false) {
        return { display: 'none' }
    }
    return {}
}

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

function toggleMoreMenu() {
    showMoreMenu.value = !showMoreMenu.value
}

function closeEHunter() {
    emit('closeEHunter')
}

function checkOverlap() {
    if (!innerContentRef.value || !floatContentRef.value) {
        return
    }

    // 如果 TopBar 被隐藏，不进行检查（避免闪烁）
    if (!store.showTopBar) {
        return
    }

    // 进入测量模式：显示所有元素但使用 visibility: hidden
    isMeasuring.value = true
    itemVisibility.value = new Array(topBarFields.value.length).fill(true)

    // 使用 nextTick 确保 DOM 更新后再测量
    nextTick(() => {
        const items = innerContentRef.value?.querySelectorAll('.item')
        if (!items || items.length === 0) {
            isMeasuring.value = false
            return
        }

        const floatRect = floatContentRef.value?.getBoundingClientRect()
        if (!floatRect) {
            isMeasuring.value = false
            return
        }

        const floatLeft = floatRect.left

        // 检查每个元素是否与 float-content 重叠
        const visibility: boolean[] = []
        for (let i = 0; i < items.length; i++) {
            const itemRect = items[i].getBoundingClientRect()
            const itemRight = itemRect.right
            
            // 如果元素右边界超过了 float-content 的左边界（留 10px 间距），则隐藏
            visibility[i] = itemRight + 10 <= floatLeft
        }

        // 退出测量模式，应用真实的可见性
        isMeasuring.value = false
        itemVisibility.value = visibility
    })
}

let resizeObserver: ResizeObserver | null = null

// 防抖版本的 checkOverlap
function debouncedCheckOverlap(immediate = false) {
    if (checkOverlapTimer) {
        clearTimeout(checkOverlapTimer)
    }
    
    if (immediate) {
        checkOverlap()
    } else {
        checkOverlapTimer = window.setTimeout(() => {
            checkOverlap()
            checkOverlapTimer = null
        }, 100)
    }
}

// 保存事件处理器引用，用于正确移除监听器
const handleResize = () => debouncedCheckOverlap()

onMounted(() => {
    nextTick(() => {
        checkOverlap()
    })

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)

    // 使用 ResizeObserver 监听内容变化
    if (innerContentRef.value) {
        resizeObserver = new ResizeObserver(() => {
            debouncedCheckOverlap()
        })
        resizeObserver.observe(innerContentRef.value)
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeObserver) {
        resizeObserver.disconnect()
    }
    if (checkOverlapTimer) {
        clearTimeout(checkOverlapTimer)
    }
})

// 监听 topBarFields 变化，重新检查重叠
watch(topBarFields, () => {
    nextTick(() => {
        checkOverlap()
    })
}, { deep: true })

// 监听 showTopBar 变化，当显示时重新检查
watch(() => store.showTopBar, (newVal) => {
    if (newVal) {
        // 使用 setTimeout 确保动画完成后再检查
        setTimeout(() => {
            checkOverlap()
        }, 350) // 动画时间是 0.3s，加上一点缓冲
    }
})

// 监听 readingMode 变化，重新检查重叠（切换阅读模式时触发）
watch(() => store.readingMode, () => {
    // 使用 setTimeout 确保 DOM 完全更新后再检查
    setTimeout(() => {
        checkOverlap()
    }, 500)
})

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

        >.more-button-wrapper {
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
        }

        >.button, >.more-button-wrapper {
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
