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
    getExtension() {
        return chrome.extension;
    },
    fetch(url, option) {
        /* eslint-disable camelcase */
        if (typeof GM_info !== 'undefined' && GM_info.version) { // the ENV is Tampermonkey
            return new Promise((resolve, reject) => {
                const httpRequest = (typeof GM_xmlhttpRequest === 'undefined') ? GM.xmlHttpRequest : GM_xmlhttpRequest;
                httpRequest({
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
