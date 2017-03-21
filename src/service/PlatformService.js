// a service for crossing platform
/* eslint-disable no-undef */
export default {
    storage: {
        sync: chrome.storage.sync.QUOTA_BYTES ? chrome.storage.sync : chrome.storage.local,
        local: chrome.storage.local
    }
};

