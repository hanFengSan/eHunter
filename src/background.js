// a background script for background tasks
import NotificationService from './service/NotificationService'

/* eslint-disable no-undef */
const isActivedPopView = chrome.extension.getViews().length === 2;

// If user open popupView, Chrome will run two background.js, so we need to avoid this.
if (!isActivedPopView) {
    let notificationService = new NotificationService();
    notificationService.run();
}
