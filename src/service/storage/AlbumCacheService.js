// a singleton service for caching img url
import TextReqService from '../request/TextReqService.js'
import ImgHtmlParser from '../parser/ImgHtmlParser.js'
import ImgUrlListParser from '../parser/ImgUrlListParser.js'
import IntroHtmlParser from '../parser/IntroHtmlParser.js'
import * as API from '../api.js'

const singleton = Symbol();
const singletonEnforcer = Symbol();

class AlbumCacheService {
    constructor(enforcer) {
        if (enforcer !== singletonEnforcer) throw new Error('throw cannot construct singleton');
    }

    static get instance() {
        if (!this[singleton]) {
            this[singleton] = new AlbumCacheService(singletonEnforcer);
            this[singleton].storage = window.localStorage;
            if (this[singleton].storage.getItem('cache') == null ||
                this[singleton].storage.getItem('cacheVersion') !== AlbumCacheService.version) {
                this[singleton].storage.setItem('cacheVersion', AlbumCacheService.version);
                this[singleton].storage.setItem('cache', '{}');
            }
            this[singleton].cache = JSON.parse(this[singleton].storage.getItem('cache'));
        }
        return this[singleton];
    }

    static get version() {
        return '1.1';
    }

    hasAlbumCache(albumId) {
        return this.cache.hasOwnProperty(albumId);
    }

    save() {
        this.storage.setItem('cache', JSON.stringify(this.cache));
    }

    checkAlbum(albumId) {
        if (!this.hasAlbumCache(albumId)) {
            this.cache[albumId] = {
                title: '',
                thumbs: [],
                imgInfos: []
            };
        }
    }

    getThumbs(albumId, introUrl, sumOfPage) {
        return new Promise((resolve, reject) => {
            this.checkAlbum(albumId);
            if (this.cache[albumId].thumbs.length > 0) {
                console.log('read thumbs from cache');
                resolve(this.cache[albumId].thumbs);
            } else {
                (new TextReqService(API.getIntroHtml(introUrl, 1)))
                .request()
                    .then(text => {
                        let introPage = new IntroHtmlParser(text);
                        this.cache[albumId].thumbs = introPage.getThumbObjList(sumOfPage, albumId);
                        this.save();
                        resolve(this.cache[albumId].thumbs);
                    }, err => {
                        console.log(err);
                        // TODO: show tips for the error
                    });
            }
        });
    }

    getImgInfos(albumId, introUrl, sumOfPage) {
        return new Promise((resolve, reject) => {
            this.checkAlbum(albumId);
            if (this.cache[albumId].imgInfos.length > 0) {
                console.log('read imgInfos from cache');
                resolve(this.cache[albumId].imgInfos);
            } else {
                (new ImgUrlListParser(introUrl, sumOfPage))
                .request()
                    .then(imgInfos => {
                        this.cache[albumId].imgInfos = imgInfos;
                        this.save();
                        resolve(this.cache[albumId].imgInfos);
                    }, err => {
                        console.log(err)
                    });
            }
        });
    }

    getImgSrc(albumId, index) {
        return new Promise((resolve, reject) => {
            this.checkAlbum(albumId);
            if (this.cache[albumId].imgInfos[index].src) {
                console.log(`read img ${index} from cache`);
                resolve(resolve(this.cache[albumId].imgInfos[index].src));
            } else {
                (new TextReqService(this.cache[albumId].imgInfos[index].pageUrl))
                .request()
                    .then(text => {
                        this.cache[albumId].imgInfos[index].src = new ImgHtmlParser(text).getImgUrl();
                        this.save();
                        resolve(this.cache[albumId].imgInfos[index].src);
                    });
            }
        });
    }

    getNewImgSrc(albumId, index) {
        this.cache[albumId].imgInfos[index].src = null;
        this.save();
        return this.getImgSrc(albumId, index);
    }

}

export default AlbumCacheService;
