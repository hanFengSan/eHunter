// a good resolution for poor network

class TextReqService {
    constructor(url) {
        this.url = url;
        this.method = 'GET';
        this.credentials = 'include';
        this.retryTimes = 5;
        this.curRetryTimes = -1;
        this.retryInterval = 1; // secs
        this.enabledLog = true;
    }

    setMethod(method) {
        this.method = method;
        return this;
    }

    setCredentials(credential) {
        this.credentials = credential;
        return this;
    }

    setRetryTimes(times) {
        this.retryTimes = times;
    }

    setRetryInterval(secs) {
        this.retryInterval = secs;
    }

    request() {
        return new Promise((resolve, reject) => {
            this._request(res => {
                res.text().then(text => resolve(text));
            }, err => {
                reject(err);
            });
        });
    }

    _printErrorLog(err) {
        console.log(`TextReqService: request error in ${this.url}, retry:(${this.curRetryTimes}/${this.retryTimes}), error: ${err}`);
    }

    _request(successCallback, failureCallback) {
        this.curRetryTimes++;
        window.fetch(this.url, {
            method: this.method,
            credentials: this.credentials
        }).then(res => {
            successCallback(res);
        }, err => {
            this._printErrorLog(err);
            if (this.curRetryTimes < this.retryTimes) {
                setTimeout(() => {
                    this._request(successCallback, failureCallback);
                }, this.retryInterval * 1000);
            } else {
                failureCallback(err);
            }
        });
    }
}

export default TextReqService;
