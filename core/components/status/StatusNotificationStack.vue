<template>
    <div class="status-notification-stack" v-if="store.downloadNotifications.length > 0">
        <transition-group name="vertical-list" tag="div" class="list">
            <StatusNotificationItem
                v-for="item in store.downloadNotifications"
                :key="item.notificationId"
                :item="item"
                @dismiss="dismiss"
                @action="onAction" />
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import StatusNotificationItem from './StatusNotificationItem.vue'
import { store, storeAction } from '../../store/app'

function dismiss(notificationId: string) {
    storeAction.dismissDownloadNotification(notificationId)
}

function onAction(notificationId: string, actionId: string) {
    storeAction.triggerDownloadNotificationAction(notificationId, actionId)
}
</script>

<style lang="scss" scoped>
div {
    display: flex;
}

.status-notification-stack {
    position: fixed;
    right: 8px;
    bottom: 28px;
    z-index: 10020;
    pointer-events: none;

    > .list {
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        pointer-events: auto;
    }
}

@media only screen and (max-width: 767px) {
    .status-notification-stack {
        right: 6px;
        bottom: 32px;
    }
}
</style>
