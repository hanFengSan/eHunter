// a storage service for tag's notification
const singleton = Symbol();
const singletonEnforcer = Symbol();

class SubsStorageService {
    constructor(enforcer) {
        if (enforcer !== singletonEnforcer) throw new Error('throw cannot construct singleton');
    }

    static get instance() {
        // WTF
        return new Promise((resolve, reject) => {
            if (!this[singleton]) {
                this[singleton] = new SubsStorageService(singletonEnforcer);
                this[singleton].storage = window.chrome.storage.local;
                this[singleton].storage.get('subs', i => {
                    let subs = i['subs'];
                    this[singleton].storage.get('subsVersion', t => {
                        let subsVersion = t['subsVersion'];
                        if (subs == null || subsVersion !== SubsStorageService.version) {
                            this[singleton].subs = {};
                            this[singleton].storage.set({
                                subs: {},
                                subsVersion: SubsStorageService.version
                            }, () => resolve(this[singleton]));
                        } else {
                            this[singleton].subs = subs;
                            resolve(this[singleton]);
                        }
                    });
                });
            } else {
                resolve(this[singleton]);
            }
        });
    }

    static get version() {
        return '1.1';
    }

    getSubsList() {
        return JSON.parse(JSON.stringify(this.subs.list || []));
    }

    getNewSubsList() {
        return new Promise((resolve, reject) => {
            this.storage.get('subs', i => {
                resolve(i['subs'] || []);
            });
        });
    }

    addSubsItem(item, callback = () => {}) {
        if (!this.subs.list) {
            this.subs.list = [];
        }
        this.subs.list.push(item);
        this._save(callback);
    }

    delSubsItemByName(name, callback) {
        if (!this.subs.list) {
            this.subs.list = [];
        }
        let target = this.subs.list.find(i => i.name === name);
        if (target) {
            this.subs.list.splice(this.subs.list.indexOf(target), 1);
        }
        this._save(callback);
    }

    _save(callback = () => {}) {
        this.storage.set({ subs: this.subs }, () => callback());
    }

}

export default SubsStorageService;
