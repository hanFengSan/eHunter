//  a service for sync multi asynchronous text requests
import { TextReq } from './TextReq'

export class MultiAsyncReq {
    private urls: Array<string> = [];
    private resultMap: Map<string, string> = new Map();
    private fetchSetting = null;
    private gen;

    constructor(urls) {
        this.urls = urls;
        this.fetchSetting = null;
    }

    request(): Promise<Map<string, string>> {
        return new Promise((resolve, reject) => {
            this._initGenerator(resolve, reject);
            this._request();
        });
    }

    setFetchSetting(setting) {
        this.fetchSetting = setting;
        return this;
    }

    _initGenerator(resolve, reject) {
        let self = this;
        this.gen = (function* () {
            try {
                for (let url of self.urls) {
                    let item = yield url;
                    self.resultMap.set(item.url, item.html);
                }
                resolve(self.resultMap);
            } catch (err) {
                reject(err);
            }
        })();
        this.gen.next(); // run to first yield
    }

    _request() {
        for (let url of this.urls) {
            (new TextReq(url))
                .setFetchSetting(this.fetchSetting)
                .request()
                .then(html => this.gen.next({ url: url, html: html },
                    err => this.gen.throw(err)));
        }
    }

}
