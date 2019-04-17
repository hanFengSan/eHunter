import Storage from 'react-native-storage';
import Logger from '../../../utils/Logger';

function wrapStorageArea(storageArea) {
    return {
        async getItem(key) {
            return new Promise((resolve, reject) => {
                Logger.logText('Storage', `get ${key}`);
                storageArea.get(key, (val) => {
                    if (typeof val[key] !== 'undefined') {
                        resolve(val[key]);
                    } else {
                        Logger.logText('Storage', `This key--${key} doesn't exist`);
                        resolve(null);
                    }
                })
            });
        },
        async setItem(key, val) {
            return new Promise((resolve, reject) => {
                if (key) {
                    storageArea.set({
                        [key]: val
                    }, () => {
                        Logger.logText('Storage', `chrome saved ${key}`);
                        resolve();
                    });
                } else {
                    Logger.logText('Storage', `ERROR: setItem, key is null, ${val}`);
                }
            });
        },
        async removeItem(key) {
            return new Promise((resolve, reject) => {
                storageArea.remove(key, () => {
                    Logger.logText('Storage', `chrome removed ${key}`);
                    resolve();
                })
            });
        }
    }
}

export default class UniStorage extends Storage {
    constructor(options = {}) {
        if (options.storageBackend.constructor.name === 'StorageArea') {
            options.storageBackend = wrapStorageArea(options.storageBackend);
        }
        super(options);
    }

}
