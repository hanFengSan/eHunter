// a service for setting, getting and storing settings
/* eslint-disable no-undef */
import Platform from './PlatformService'

const singleton = Symbol();
const singletonEnforcer = Symbol();

class SettingListener {
    constructor(enforcer) {
        if (enforcer !== singletonEnforcer) throw new Error('throw cannot construct singleton');
    }

    static get instance() {
        if (!this[singleton]) {
            this[singleton] = new SettingListener(singletonEnforcer);
            this[singleton].eventBus = {};
            // default setting values
            this[singleton].initialSettings = {
                toggleEHunter: true,
                showPagination: true,
                toggleThumbView: true,
                toggleSyncScroll: true
            }
        }
        return this[singleton];
    }

    // listen setting's change, and send action to content's vuex
    listen(store) {
        this._initSettings(store);
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            switch (msg.settingName) {
                case 'setAlbumWidth':
                    store.dispatch('setAlbumWidth', msg.value);
                    break;
                case 'toggleEHunter':
                    if (document.getElementsByClassName('vue-container').length > 0) {
                        document.body.style.overflow = msg.value ? 'hidden' : '';
                        document.getElementsByClassName('vue-container')[0].style.top = msg.value ? '0' : '-100%';
                    }
                    break;
                case 'showPagination':
                    store.dispatch('showPagination', msg.value);
                    break;
                case 'toggleThumbView':
                    store.dispatch('toggleThumbView', msg.value);
                    break;
                case 'toggleSyncScroll':
                    store.dispatch('toggleSyncScroll', msg.value);
            }
            // eventBus
            if (this.eventBus[msg.settingName]) {
                this.eventBus[msg.settingName].forEach(callback => callback(msg.value));
            }
            response();
        });
    }

    setSettingItem(settingName, value, callback = () => {}) {
        Platform.storage.sync.set({
            [settingName]: value
        }, () => {
            this._sendSettingMsg(settingName, value, callback);
            console.log(`chrome saved ${settingName}`);
        });
    }

    getSettingItem(settingName, callback) {
        Platform.storage.sync.get(settingName, (value) => {
            if (typeof value[settingName] !== 'undefined') {
                callback(value[settingName]);
            } else if (typeof this.initialSettings[settingName] !== 'undefined') {
                callback(this.initialSettings[settingName]);
                // init is after first get in popupView
                if (chrome.tabs) {
                    this.setSettingItem(settingName, this.initialSettings[settingName]);
                }
            } else {
                return null;
            }
        });
    }

    onSettingChange(settingName, callback) {
        if (!this.eventBus[settingName]) {
            this.eventBus[settingName] = [];
        }
        this.eventBus[settingName].push(callback);
        console.log(this.eventBus);
    }

    _sendSettingMsg(settingName, value, callback = () => {}) {
        /* eslint-disable no-undef */
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id, { settingName, value },
                callback);
        });
    }

    _initSettings(store) {
        // viewScale
        this.getSettingItem('setAlbumWidth', (val) => store.dispatch('setAlbumWidth', val));
        this.getSettingItem('showPagination', (val) => store.dispatch('showPagination', val));
        this.getSettingItem('toggleThumbView', (val) => store.dispatch('toggleThumbView', val));
        this.getSettingItem('toggleSyncScroll', (val) => store.dispatch('toggleSyncScroll', val));
    }
}

export default SettingListener;
