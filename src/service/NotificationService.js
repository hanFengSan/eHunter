// a background service for notifying tag's update
import SubsStorageService from './storage/SubsStorageService'
import NotiStorageService from './storage/NotiStorageService'
import ReqQueueService from './request/ReqQueueService'
import SearchHtmlParser from './parser/SearchHtmlParser'

class NotificationService {
    constructor() {
        this.time = 0; // record the duration of running
        this.subscribedTagList = [];
        this.requestList = [];
        this.notiList = []; // gather together notifications to show
    }

    run() {
        /* eslint-disable no-undef */
        console.log('background ok');
        window.setInterval(() => {
            this.time += 10;
            this._syncSubs()
                .then(() => {
                    this._initRequestUrl();
                    this._request();
                });
        }, 10 * 60 * 1000); // 10 mins
        // this.time += 10;
        // this._syncSubs()
        //     .then(() => {
        //         this._initRequestUrl();
        //         this._request();
        //     });
    }

    _syncSubs() {
        return new Promise((resolve, reject) => {
            SubsStorageService
                .instance
                .then(instance => {
                    this.subscribedTagList = instance.getSubsList().filter(item => {
                        return this.time % item.time === 0
                        // return this.time > 0
                    });
                    resolve();
                });
        });
    }

    _initRequestUrl() {
        this.requestList = this.subscribedTagList.map(item => {
            let url = '';
            if (item.site.length > 0) {
                switch (item.site[0]) {
                    case 'e-hentai':
                        url += 'https://e-hentai.org/';
                        break;
                    case 'exhentai':
                        url += 'https://exhentai.org/';
                        break;
                }
            }
            if (item.type.length > 0) {
                url += item.type.reduce((sum, val) => {
                    val = val.replace('-', '').toLowerCase();
                    return `${sum}f_${val}=1&`;
                }, '?');
            } else {
                url += '?f_doujinshi=1&f_manga=1&f_artistcg=1&f_gamecg=1&f_western=1&f_non-h=1&f_imageset=1&f_cosplay=1&f_asianporn=1&f_misc=1&';
            }
            url += `f_search="${item.name}$"+`;
            if (item.lang.length > 0) {
                url += `language:"${item.lang[0]}$"+`;
            }
            url += '&f_apply=Apply+Filter';
            return encodeURI(url);
        });
    }

    _request() {
        (new ReqQueueService(this.requestList))
            .setNumOfConcurrented(1)
            .request()
            .then(map => {
                NotiStorageService
                    .instance
                    .then(notiStorage => {
                        this.requestList.forEach(url => this._compare(notiStorage, url, map.get(url)));
                        this._noti();
                    });
            }, err => console.log(err));
    }

    _compare(notiStorage, url, html) {
        console.log('compare');
        const tag = this.subscribedTagList[this.requestList.indexOf(url)];
        let oldResults = notiStorage.getResultsByName(tag.name);
        let newResults = new SearchHtmlParser(html).getResultTitles();
        console.log('old, new');
        console.log(oldResults);
        console.log(newResults);
        let diffs = [];
        // get new items
        if (oldResults.length > 0) {
            newResults.forEach(i => {
                if (oldResults.indexOf(i) === -1) {
                    diffs.push(i);
                }
            })
        } else {
            diffs = newResults;
        }
        // restore new results
        if (diffs.length > 0) {
            NotiStorageService
                .instance
                .then(instance => {
                    instance.putItem(tag.name, newResults);
                })
        }
        console.log('diff');
        console.log(diffs);
        // create notification
        if (diffs.length > 0) {
            this.notiList.push({
                name: tag.name,
                message: `更新数量: ${diffs.length}`,
                time: new Date().getTime(),
                updatedNum: diffs.length,
                url,
                type: tag.type
            });
        }
    }

    _noti() {
        if (this.notiList.length > 0) {
            chrome.notifications.create('EHUNTER_UPDATED_NOTI', {
                type: 'list',
                title: 'TAG更新通知',
                iconUrl: './img/ehunter_icon.png',
                message: `共有${this.notiList.length}个TAG有更新, 详细内容请在通知中心中查看`,
                items: this.notiList.map(i => {
                    return {
                        title: i.name,
                        message: i.message
                    }
                })
            }, () => {
                NotiStorageService
                    .instance
                    .then(notiStorage => {
                        this.notiList.forEach(i => notiStorage.pushMsg(i));
                        this.notiList = [];
                    });
            });
        }
    }
}

export default NotificationService;
