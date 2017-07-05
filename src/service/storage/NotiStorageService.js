// a storage service for comparison of tag's search results and messages
const singleton = Symbol();
const singletonEnforcer = Symbol();

class NotiStorageService {
    constructor(enforcer) {
        if (enforcer !== singletonEnforcer) throw new Error('throw cannot construct singleton');
    }

    static get instance() {
        return new Promise((resolve, reject) => {
            if (!this[singleton]) {
                this[singleton] = new NotiStorageService(singletonEnforcer);
                this[singleton].storage = window.chrome.storage.local;
                this[singleton].storage.get('noti', i => {
                    let noti = i['noti'];
                    this[singleton].storage.get('notiVersion', t => {
                        let notiVersion = t['notiVersion'];
                        if (noti == null || notiVersion !== NotiStorageService.version) {
                            this[singleton].noti = {};
                            this[singleton].storage.set({
                                noti: {},
                                notiVersion: NotiStorageService.version
                            }, () => resolve(this[singleton]));
                        } else {
                            this[singleton].noti = noti;
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
        return '1.0';
    }

    getResultsByName(name) {
        return JSON.parse(JSON.stringify(this.noti[name] || []));
    }

    putItem(name, results, callback = () => {}) {
        this.noti[name] = JSON.parse(JSON.stringify(results));
        this._save(callback);
    }

    _save(callback = () => {}) {
        this.storage.set({ noti: this.noti }, () => callback());
    }

    getMsgList() {
        return JSON.parse(JSON.stringify(this.noti.msg || []));
    }

    pushMsg(item, callback) {
        if (!this.noti.msg) {
            this.noti.msg = [];
        }
        // cut down size if too big
        if (this.noti.msg.length > 100) {
            this.noti.msg.splice(0, 50);
            console.log('cut down size of noti cache');
        }
        this.noti.msg.push(item);
        this._save(callback);
    }

    clearMsg(callback) {
        this.noti.msg = [];
        this._save(callback);
    }
}

export default NotiStorageService;
