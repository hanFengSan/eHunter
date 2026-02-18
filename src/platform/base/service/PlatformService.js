// a service for crossing platform
/* eslint-disable no-undef */

// hack for test
if (typeof chrome === 'undefined') {
    var chrome = { extension: null };
}

export default {
    storage: {
        get sync() {
            if (chrome && chrome.storage) {
                return chrome.storage.sync.QUOTA_BYTES ? chrome.storage.sync : chrome.storage.local;
            } else {
                return window.localStorage;
            }
        },
        local: window.localStorage
    },
    storageGet(key, defaultValue = null) {
        try {
            if (typeof GM_getValue === 'function') {
                return GM_getValue(key, defaultValue);
            }
        } catch (e) {
        }
        try {
            let val = window.localStorage.getItem(key);
            return val === null ? defaultValue : val;
        } catch (e) {
            return defaultValue;
        }
    },
    storageSet(key, value) {
        try {
            if (typeof GM_setValue === 'function') {
                GM_setValue(key, value);
                return true;
            }
        } catch (e) {
        }
        try {
            let val = value;
            if (typeof value !== 'string') {
                val = JSON.stringify(value);
            }
            window.localStorage.setItem(key, val);
            return true;
        } catch (e) {
            return false;
        }
    },
    getExtension() {
        return chrome.extension;
    },
    fetch(url, option) {
        /* eslint-disable camelcase */
        if (typeof GM_info !== 'undefined' && GM_info.version) { // the ENV is Tampermonkey
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: option.method,
                    url,
                    onload: x => {
                        let responseText = x.responseText;
                        x.text = async function() {
                            return responseText;
                        }
                        resolve(x);
                    },
                    onerror: e => {
                        reject(`GM_xhr error, ${e.status}`);
                    }
                });
            });
        } else { // the ENV is Chrome or Firefox
            return window.fetch(url, option);
        }
    }
};
