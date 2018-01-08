import Storage from 'react-native-storage';

function wrapStorageArea(storageArea) {
    return {
        async getItem(key) {
            return new Promise((resolve, reject) => {
                console.log(`get ${key}`);
                storageArea.get(key, (val) => {
                    if (typeof val[key] !== 'undefined') {
                        resolve(val[key]);
                    } else {
                        console.log(`This key--${key} doesn't exist`);
                        resolve(null);
                    }
                })
            });
        },
        async setItem(key, val) {
            return new Promise((resolve, reject) => {
                storageArea.set({
                    [key]: val
                }, () => {
                    console.log(`chrome saved ${key}`);
                    resolve();
                });
            });
        },
        async removeItem(key) {
            return new Promise((resolve, reject) => {
                storageArea.remove(key, () => {
                    console.log(`chrome removed ${key}`);
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
