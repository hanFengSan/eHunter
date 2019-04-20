// a service for limiting num of async requests, avoiding too many concurrent requests
import {MultiAsyncReq} from './MultiAsyncReq'

export class ReqQueue {
    private urls: Array<string> = [];
    private maxConcurrentedNum = 5;
    private resultMap: Map<string, string> = new Map();
    private fetchSetting = null;

    constructor(urls) {
        this.urls = urls;
    }

    setNumOfConcurrented(num: number) {
        this.maxConcurrentedNum = num;
        return this;
    }

    setFetchSetting(setting) {
        this.fetchSetting = setting;
        return this;
    }

    request(): Promise<Map<string, string>> {
        return new Promise((resolve, reject) => {
            let reqList = this._splitReqs();
            this._request(reqList, resolve, reject);
        });
    }

    _splitReqs() {
        if (this.urls.length < this.maxConcurrentedNum) {
            return [this.urls];
        }
        let results: Array<string> = [];
        let urls = JSON.parse(JSON.stringify(this.urls));
        while (true) {
            let list = urls.splice(0, this.maxConcurrentedNum);
            if (list.length > 0) {
                results.push(list);
            } else {
                return results;
            }
        }
    }

    _addMap(destMap, srcMap) {
        for (let item of srcMap) {
            destMap.set(item[0], item[1]);
        }
        return destMap;
    }

    _request(reqList, resolve, reject) {
        if (reqList.length > 0) {
            (new MultiAsyncReq(reqList[0]))
                .setFetchSetting(this.fetchSetting)
                .request()
                .then(map => {
                    this._addMap(this.resultMap, map);
                    reqList.splice(0, 1);
                    this._request(reqList, resolve, reject);
                }, err => { reject(err) });
        } else {
            resolve(this.resultMap);
        }
    }
}
