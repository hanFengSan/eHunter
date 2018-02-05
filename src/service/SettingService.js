import storage from './storage/LocalStorage';
import store from '../store/index.inject';

class SettingService {
    constructor() {
        this.version = '2.1';
        this.storageName = 'Settings';
        this.storageVersionName = 'SettingsVersion';
        this._initStorage();
        this._migrate();
    }

    _getDefaultSettings() {
        return {
            albumWidth: { eventName: 'setAlbumWidth', val: 80 }, // eventName is action name of vuex
            toggleEHunter: { eventName: 'toggleEHunter', val: true },
            toggleThumbView: { eventName: 'toggleThumbView', val: true },
            loadNum: { eventName: 'setLoadNum', val: 3 },
            volumeSize: { eventName: 'setVolumeSize', val: 50 }
        }
    }

    async _migrate() {
        // // remove version < 2.0
        // await Platform.storage.local.get('cache', async(value) => {
        //     if (typeof value['cache'] !== 'undefined') {
        //         await Platform.storage.local.remove('cache', () => {});
        //         await Platform.storage.local.remove('cacheVersion', () => {});
        //     }
        // });
        // remove old version >= 2.0
        let version = await storage.load({ key: this.storageVersionName });
        await storage.save({ key: this.storageVersionName, data: this.version });
        if (version !== this.version) {
            await storage.remove({ key: this.storageName });
        }
    }

    _initStorage() {
        storage.sync[this.storageName] = (params) => {
            let { resolve } = params;
            resolve(this._getDefaultSettings());
        };
        storage.sync[this.storageVersionName] = (params) => {
            let { resolve } = params;
            return resolve(this.version);
        };
    }

    async _setSettingItem(key, val) {
        // store change
        let settings = await storage.load({ key: this.storageName });
        settings[key].val = val;
        await storage.save({ key: this.storageName, data: settings });
        // send change to vuex
        if (key !== 'toggleEHunter') { // the 'toggleEHunter' don't exist in vuex
            store.dispatch(settings[key].eventName, val);
        }
    }

    async _getSettingItem(key) {
        let settings = await storage.load({ key: this.storageName });
        return settings[key].val;
    }

    async initSettings() {
        let settings = await storage.load({ key: this.storageName });
        for (let key in settings) {
            if (key !== 'toggleEHunter') {
                store.dispatch(settings[key].eventName, settings[key].val);
            }
        }
    }

    async setAlbumWidth(val) {
        await this._setSettingItem('albumWidth', val);
    }

    async getAlbumWidth() {
        return await this._getSettingItem('albumWidth');
    }

    async toggleEHunter(val) {
        await this._setSettingItem('toggleEHunter', val);
    }

    async getEHunterStatus() {
        return await this._getSettingItem('toggleEHunter');
    }

    async toggleThumbView(val) {
        await this._setSettingItem('toggleThumbView', val);
    }

    async getThumbViewStatus() {
        return await this._getSettingItem('toggleThumbView');
    }

    async setLoadNum(val) {
        await this._setSettingItem('loadNum', val);
    }

    async getLoadNum() {
        return await this._getSettingItem('loadNum');
    }

    async setVolumeSize(val) {
        await this._setSettingItem('volumeSize', val);
    }

    async getVolumeSize() {
        return await this._getSettingItem('volumeSize');
    }
}

let instance = new SettingService();
export default instance;
