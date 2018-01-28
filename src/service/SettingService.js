import storage from './storage/LocalStorage';
import store from '../store/index.inject';

class SettingService {
    constructor() {
        this.version = '2.0';
        this.storageName = 'Settings';
        this.storageVersionName = 'SettingsVersion';
        this._initStorage();
        this._migrate();
    }

    _getDefaultSettings() {
        return {
            setAlbumWidth: 80,
            toggleEHunter: true,
            toggleThumbView: true
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
            await storage.clearMapForKey(this.storageName);
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
        // send change to vuex
        if (key !== 'toggleEHunter') { // the 'toggleEHunter' don't exist in vuex
            store.dispatch(key, val);
        }
        // store change
        let settings = await storage.load({ key: this.storageName });
        settings[key] = val;
        await storage.save({ key: this.storageName, data: settings });
    }

    async _getSettingItem(key) {
        let settings = await storage.load({ key: this.storageName });
        return settings[key];
    }

    async initSettings() {
        let settings = await storage.load({ key: this.storageName });
        for (let key in settings) {
            if (key !== 'toggleEHunter') {
                store.dispatch(key, settings[key]);
            }
        }
    }

    async setAlbumWidth(val) {
        await this._setSettingItem('setAlbumWidth', val);
    }

    async getAlbumWidth(val) {
        return await this._getSettingItem('setAlbumWidth');
    }

    async toggleEHunter(val) {
        await this._setSettingItem('toggleEHunter', val);
    }

    async getEHunterStatus(val) {
        return await this._getSettingItem('toggleEHunter');
    }

    async toggleThumbView(val) {
        await this._setSettingItem('toggleThumbView', val);
    }

    async getThumbViewStatus(val) {
        return await this._getSettingItem('toggleThumbView');
    }

}

let instance = new SettingService();
export default instance;
