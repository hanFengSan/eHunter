//  a service for sync multi asynchronous text requests
import TextReqService from './TextReqService.js'

class MultiAsyncReqService {
    constructor(urls) {
        this.urls = urls;
        this.resultMap = new Map();
    }

    request() {
        return new Promise((resolve, reject) => {
            this._initGenerator(resolve, reject);
            this._request();
        });
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
            (new TextReqService(url))
                .request()
                .then(html => this.gen.next({ url: url, html: html },
                    err => this.gen.throw(err)));
        }
    }

}

export default MultiAsyncReqService;
