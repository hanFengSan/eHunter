<template>
    <teleport to="#ehunter-app">
        <transition name="slow-opacity-fade" appear>
            <div v-if="store.showThumbExpandDialog" class="thumb-expand-modal" @click.self="onClose">
                <section class="panel" @click.stop>
                    <button class="close-btn" type="button" :aria-label="i18n.cancel" @click="onClose">×</button>
                    <div class="grid-wrap">
                        <button
                            v-for="item in segmentItems"
                            :key="item.pageNumber"
                            type="button"
                            class="thumb-item"
                            :class="{ active: item.pageNumber - 1 === store.curViewIndex }"
                            @click="onSelectPage(item.pageNumber)">
                            <div class="thumb-frame" :class="{ error: item.renderState === 'error' }">
                                <ThumbView :thumb-info="item.thumbInfo" :fallback-text="i18n.loadingFailed" />
                            </div>
                            <div class="page-label">{{ item.pageNumber }}</div>
                        </button>
                    </div>
                    <footer class="pager-row">
                        <Pagination :cur-index="segmentIndex" :page-sum="segmentCount" @change="onSegmentChange" />
                    </footer>
                </section>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { i18n } from '../../store/i18n'
import { store, storeAction } from '../../store/app'
import {
    buildThumbExpandItems,
    clampThumbExpandSegmentIndex,
    getThumbExpandSegmentByPage,
    getThumbExpandSegmentCount,
} from '../../model/thumbExpand'
import Pagination from '../widget/Pagination.vue'
import ThumbView from '../ThumbView.vue'

const segmentCount = computed(() => {
    return getThumbExpandSegmentCount(store.pageCount)
})

const segmentIndex = computed(() => {
    return clampThumbExpandSegmentIndex(store.thumbExpandSegmentIndex, store.pageCount)
})

const segmentItems = computed(() => {
    return buildThumbExpandItems(store.thumbInfos, store.pageCount, segmentIndex.value)
})

const emit = defineEmits<{
    (e: 'select-page', pageNumber: number): void
}>()

watch(() => store.showThumbExpandDialog, (open) => {
    if (open) {
        storeAction.setThumbExpandSegmentIndex(getThumbExpandSegmentByPage(store.curViewIndex))
    }
})

function onClose() {
    storeAction.closeThumbExpandDialog()
}

function onSegmentChange(next: number) {
    storeAction.setThumbExpandSegmentIndex(Number(next))
}

function onSelectPage(pageNumber: number) {
    emit('select-page', pageNumber)
}
</script>

<style lang="scss" scoped>
@import '../../style/_responsive';
@import '../../style/_variables';

.thumb-expand-modal {
    position: fixed;
    inset: 0;
    z-index: 10024;
    background:
        radial-gradient(1400px 800px at 15% 10%, rgba(99, 152, 255, 0.18), rgba(99, 152, 255, 0) 60%),
        radial-gradient(1200px 700px at 88% 92%, rgba(82, 205, 186, 0.15), rgba(82, 205, 186, 0) 58%),
        $thumb_expand_modal_overlay_bg;
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 24px;

    > .panel {
        position: relative;
        width: min(1200px, 100%);
        max-height: min(90vh, 900px);
        min-height: min(80vh, 760px);
        border-radius: 20px;

        @include responsive($breakpoint-xxl) {
            width: min(1400px, 100%);
        }

        background: linear-gradient(165deg, #ffffff 0%, #f5f8fc 48%, #eef3fa 100%);
        box-shadow:
            0 32px 80px rgba(8, 24, 48, 0.28),
            0 12px 32px rgba(8, 24, 48, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.85),
            inset 0 -1px 0 rgba(106, 132, 176, 0.08);
        border: 1px solid rgba(106, 132, 176, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;

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

        > .grid-wrap {
            flex: 1;
            min-height: 0;
            overflow: auto;
            padding: 48px 16px 12px;
            display: grid;
            // 使用 auto-fit 自动适应容器宽度，固定每个 item 的最小和最大宽度
            grid-template-columns: repeat(auto-fit, minmax(120px, 120px));
            gap: 12px;
            justify-content: space-between;
            min-height: 640px;

            > .thumb-item {
                border: 1px solid rgba(92, 119, 163, 0.18);
                border-radius: 12px;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(250, 252, 255, 0.93) 100%);
                box-shadow: 
                    0 3px 10px rgba(26, 45, 78, 0.05),
                    0 1px 3px rgba(26, 45, 78, 0.07);
                display: flex;
                flex-direction: column;
                align-items: stretch;
                justify-content: flex-start;
                padding: 8px;
                gap: 8px;
                cursor: pointer;
                transition: all 0.26s cubic-bezier(0.4, 0, 0.2, 1);

                &:hover {
                    transform: translateY(-2px);
                    border-color: hsl(145, 63%, 49%);
                    box-shadow: 
                        0 10px 24px hsla(145, 63%, 49%, 0.15),
                        0 4px 12px hsla(145, 63%, 49%, 0.1);
                    background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 255, 252, 0.98) 100%);
                }

                &.active {
                    border-color: hsl(145, 63%, 49%);
                    box-shadow: 
                        0 8px 20px hsla(145, 63%, 49%, 0.2),
                        0 0 0 2px hsla(145, 63%, 49%, 0.15);
                    background: linear-gradient(135deg, rgba(240, 255, 248, 0.98) 0%, rgba(235, 252, 245, 0.96) 100%);
                }

                > .thumb-frame {
                    width: 100%;
                    aspect-ratio: 100 / 144;
                    border-radius: 10px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;

                    &.error {
                        border: 1px dashed rgba(122, 136, 162, 0.4);
                        background: rgba(220, 227, 238, 0.5);
                    }

                    > :deep(.thumb-view) {
                        width: 100%;
                        height: 100%;

                        .thumb-fallback {
                            font-size: 12px;
                            color: #5d6f8f;
                        }
                    }
                }

                > .page-label {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    height: 24px;
                    border-radius: 7px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #2b4f86;
                    background: linear-gradient(135deg, rgba(220, 233, 255, 0.6) 0%, rgba(230, 240, 255, 0.5) 100%);
                    transition: all 0.22s ease;
                }

                &:hover > .page-label {
                    background: linear-gradient(135deg, hsla(145, 63%, 85%, 0.7) 0%, hsla(145, 63%, 90%, 0.6) 100%);
                    color: hsl(145, 63%, 30%);
                }

                &.active > .page-label {
                    background: linear-gradient(135deg, hsla(145, 63%, 75%, 0.85) 0%, hsla(145, 63%, 80%, 0.75) 100%);
                    color: hsl(145, 63%, 25%);
                    font-weight: 700;
                }
            }
        }

        > .pager-row {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            border-top: 1px solid rgba(78, 102, 146, 0.15);
            padding: 14px 16px 16px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(250, 252, 255, 0.88) 100%);
            backdrop-filter: blur(4px);
        }
    }
}

@media only screen and (max-width: 1023px) {
    .thumb-expand-modal {
        padding: 14px;

        > .panel {
            min-height: min(86vh, 840px);

            > .grid-wrap {
                padding: 44px 14px 12px;
                gap: 10px;
            }
        }
    }
}

@media only screen and (max-width: 767px) {
    .thumb-expand-modal {
        padding: 0;

        > .panel {
            width: 100%;
            height: 100%;
            max-height: none;
            min-height: 100%;
            border-radius: 0;

            > .grid-wrap {
                padding: 44px 0 10px;
                gap: 10px;

                > .thumb-item {
                    padding: 7px;
                    gap: 7px;

                    > .page-label {
                        height: 22px;
                        font-size: 11px;
                    }
                }
            }
        }
    }
}
</style>
