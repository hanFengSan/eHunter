import * as tags from './assets/value/tags'
import TextReqService from './service/request/TextReqService'
// a background script for background tasks
// import NotificationService from './service/NotificationService';

/* eslint-disable no-undef */
const isActivedPopView = chrome.extension.getViews().length === 2;

// If user open popupView, Chrome will run two background.js, so we need to avoid this.
if (!isActivedPopView) {
    // let notificationService = new NotificationService();
    // notificationService.run();
    console.log('run!!!');
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        switch (msg.type) {
            case tags.TYPE_PROXY:
                proxy(msg, sendResponse);
                break;
        }
    });
}

async function proxy(msg, sendResponse) {
    let data = await new TextReqService(msg.data).request();
    sendResponse(data);
}
