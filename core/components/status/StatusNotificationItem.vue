<template>
    <article :class="['status-notification-item', `phase-${item.phase}`, `severity-${item.severity}`]">
        <header>
            <strong>{{ item.title }}</strong>
            <button type="button" class="close" @click="$emit('dismiss', item.notificationId)">×</button>
        </header>
        <p>{{ item.message }}</p>
        <footer v-if="typeof item.progressCurrent === 'number' && typeof item.progressTotal === 'number'">
            <span>{{ `${item.progressCurrent} / ${item.progressTotal}` }}</span>
            <div class="bar">
                <i :style="{ width: `${progressPercent}%` }"></i>
            </div>
        </footer>
        <div class="actions" v-if="item.actions && item.actions.length > 0">
            <button
                v-for="action in item.actions"
                :key="action.id"
                type="button"
                :class="['action-btn', action.variant || 'plain']"
                @click="$emit('action', item.notificationId, action.id)">
                {{ action.label }}
            </button>
        </div>
    </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DownloadStatusNotification } from '../../store/app'

const props = defineProps<{ item: DownloadStatusNotification }>()
defineEmits(['dismiss', 'action'])

const progressPercent = computed(() => {
    if (typeof props.item.progressCurrent !== 'number' || typeof props.item.progressTotal !== 'number' || props.item.progressTotal <= 0) {
        return 0
    }
    return Math.max(0, Math.min(100, Math.round((props.item.progressCurrent / props.item.progressTotal) * 100)))
})
</script>

<style lang="scss" scoped>
article, header, footer, p, span, div {
    display: flex;
}

.status-notification-item {
    flex-direction: column;
    width: 320px;
    padding: 12px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(28, 32, 40, 0.96), rgba(20, 22, 28, 0.96));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
    color: #f8fbff;
    gap: 8px;

    > header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 8px;

        > strong {
            font-size: 13px;
            line-height: 16px;
            letter-spacing: 0.2px;
        }

        > .close {
            border: 0;
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            display: flex;
            font-size: 14px;
            line-height: 14px;
        }
    }

    > p {
        margin: 0;
        font-size: 12px;
        line-height: 16px;
        color: rgba(245, 250, 255, 0.92);
    }

    > .actions {
        flex-direction: row;
        gap: 8px;

        > .action-btn {
            border: 0;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 11px;
            line-height: 14px;
            cursor: pointer;
            color: #f6fbff;
            background: rgba(255, 255, 255, 0.16);

            &.danger {
                background: rgba(255, 92, 92, 0.26);
                border: 1px solid rgba(255, 140, 140, 0.6);
            }
        }
    }

    > footer {
        flex-direction: column;
        gap: 4px;

        > span {
            font-size: 11px;
            color: rgba(245, 250, 255, 0.8);
        }

        > .bar {
            position: relative;
            width: 100%;
            height: 5px;
            border-radius: 999px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.16);

            > i {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                background: linear-gradient(90deg, #45d483, #9df39d);
            }
        }
    }

    &.severity-error {
        border-color: rgba(255, 124, 124, 0.5);
        > footer > .bar > i {
            background: linear-gradient(90deg, #ff7c7c, #ffb6b6);
        }
    }

    &.severity-warning {
        border-color: rgba(255, 199, 94, 0.55);
        > footer > .bar > i {
            background: linear-gradient(90deg, #ffc75e, #ffe59d);
        }
    }
}

@media only screen and (max-width: 767px) {
    .status-notification-item {
        width: min(88vw, 320px);
        padding: 10px;
    }
}
</style>
