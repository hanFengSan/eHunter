// a service for limiting num of async requests, avoiding too many concurrent requests
import MultiAsyncReqService from './MultiAsyncReqService.js'

class ReqQueueService {
    constructor(urls) {
        this.urls = urls;
        this.maxConcurrentedNum = 5;
    }

    setNumOfConcurrented(num) {
        this.maxConcurrentedNum = num;
    }

    request() {
        let reqList = this._splitReqs();
    }

    _splitReqs() {
        if (this.urls.length < this.maxConcurrentedNum) {
            return this.urls;
        }
        let results = [];
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

    _request() {

    }
}