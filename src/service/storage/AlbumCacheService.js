// a singleton service for caching img url
import TextReqService from '../request/TextReqService.js'
import ImgHtmlParser from '../parser/ImgHtmlParser.js'
import ImgUrlListParser from '../parser/ImgUrlListParser.js'
import IntroHtmlParser from '../parser/IntroHtmlParser.js'
import * as API from '../api.js'
import storage from 'src/service/storage/LocalStorage'
// import Platform from 'src/service/PlatformService'

/*
storage
  |-albumId
    |-title :string
    |-thumbs :array
        |-Object
          |-url
          |-offset // the relative location
    |-imgInfos :array
      |-Object
        |-pageUrl // eh page url
        |-src // img src url
        |-heightOfWidth // the ratio of height / width
 */

class AlbumCacheService {
    constructor() {
        this.version = '2.4';
        this.storageName = 'AlbumCache';
        this.storageVersionName = 'AlbumCacheVersion';
        this.initStorage();
        // TODO: migrate
    }

    // async migrate() {
    //     // remove version < 2.0
    //     await Platform.storage.local.get('cache', async(value) => {
    //         if (typeof value['cache'] !== 'undefined') {
    //             await Platform.storage.local.remove('cache', () => {});
    //             await Platform.storage.local.remove('cacheVersion', () => {});
    //         }
    //     });
    //     // remove old version >= 2.0
    //     console.log('migrate1');
    //     let version = await storage.load({ key: this.storageVersionName });
    //     await storage.save({ key: this.storageVersionName, data: this.version });
    //     if (version !== this.version) {
    //         await storage.clearMapForKey(this.storageName);
    //         console.log('migrate2');
    //     }
    // }

    initStorage() {
        console.log('fuck init');
        storage.sync[this.storageName] = (params) => {
            console.log('sync');
            let { resolve } = params;
            resolve({
                title: '',
                thumbs: [],
                imgInfos: []
            });
        };
        storage.sync[this.storageVersionName] = (params) => {
            console.log('sync');
            let { resolve } = params;
            return resolve(this.version);
        };
    }

    async _getAlbum(albumId) {
        if (this._album) {
            return this._album;
        } else {
            this._album = await storage.load({ key: this.storageName, id: albumId });
            console.log('fuck album');
            console.log(this._album);
            return this._album;
        }
    }

    async _saveAlbum(albumId) {
        await storage.save({ key: this.storageName, id: albumId, data: this._getAlbum(albumId) });
    }

    async getThumbs(albumId, introUrl, sumOfPage) {
        let album = await this._getAlbum(albumId);
        console.log('album');
        console.log(album);
        if (album.thumbs.length > 0) {
            console.log('read thumbs from cache');
            return album.thumbs;
        } else {
            try {
                let text = await (new TextReqService(API.getIntroHtml(introUrl, 1))).request();
                let introPage = new IntroHtmlParser(text);
                album.thumbs = introPage.getThumbObjList(sumOfPage, albumId);
                await this._saveAlbum(albumId);
                console.log('get thumbs');
                return album.thumbs;
            } catch (e) {
                console.log(e);
                // TODO: show tips for the error
            }
        }
    }

    async getImgInfos(albumId, introUrl, sumOfPage) {
        let album = await this._getAlbum(albumId);
        if (album.imgInfos.length > 0) {
            console.log('read imgInfos from cache');
            return album.imgInfos;
        } else {
            try {
                let imgInfos = await (new ImgUrlListParser(introUrl, sumOfPage)).request();
                album.imgInfos = imgInfos;
                await this._saveAlbum(albumId);
                return album.imgInfos;
            } catch (e) {
                console.log(e);
                // TODO: show tips for the error
            }
        }
    }

    async getImgSrc(albumId, index, mode) {
        let album = await this._getAlbum(albumId);
        if (album.imgInfos[index].src) {
            return album.imgInfos[index].src;
        } else {
            try {
                let text = await (new TextReqService(album.imgInfos[index].pageUrl)).request();
                if (mode) {
                    switch (mode) {
                        case 'origin': // if want to load original img
                            album.imgInfos[index].src = new ImgHtmlParser(text).getOriginalImgUrl();
                    }
                } else {
                    // default img
                    album.imgInfos[index].src = new ImgHtmlParser(text).getImgUrl();
                }
                await this._saveAlbum(albumId);
                return album.imgInfos[index].src;
            } catch (e) {
                console.log(e);
                // TODO: show tips for the error
            }
        }
    }

    async getNewImgSrc(albumId, index, mode) {
        let album = await this._getAlbum(albumId);
        album.imgInfos[index].src = null;
        await this._saveAlbum(albumId);
        return await this.getImgSrc(albumId, index, mode);
    }
}

let instance = new AlbumCacheService();
export default instance;

// const singleton = Symbol();
// const singletonEnforcer = Symbol();

// class AlbumCacheService {
//     constructor(enforcer) {
//         if (enforcer !== singletonEnforcer) throw new Error('throw cannot construct singleton');
//     }

//     static get instance() {
//         if (!this[singleton]) {
//             this[singleton] = new AlbumCacheService(singletonEnforcer);
//             this[singleton].storage = window.localStorage;
//             if (this[singleton].storage.getItem('cache') == null ||
//                 this[singleton].storage.getItem('cacheVersion') !== AlbumCacheService.version) {
//                 this[singleton].storage.setItem('cacheVersion', AlbumCacheService.version);
//                 this[singleton].storage.setItem('cache', '{}');
//             }
//             this[singleton].cache = JSON.parse(this[singleton].storage.getItem('cache'));
//         }
//         return this[singleton];
//     }

//     static get version() {
//         return '1.1';
//     }

//     hasAlbumCache(albumId) {
//         return this.cache.hasOwnProperty(albumId);
//     }

//     save() {
//         try {
//             this.storage.setItem('cache', JSON.stringify(this.cache));
//         } catch (e) {
//             this.cutDownSize();
//         }
//     }

//     cutDownSize() {
//         this.cache = {};
//         this.storage.setItem('cache', JSON.stringify(this.cache));
//         alert('已清洁不必要缓存,请刷新页面');
//     }

//     // make sure that album is existed
//     checkAlbum(albumId) {
//         if (!this.hasAlbumCache(albumId)) {
//             this.cache[albumId] = {
//                 title: '',
//                 thumbs: [],
//                 imgInfos: []
//             };
//         }
//     }

//     getThumbs(albumId, introUrl, sumOfPage) {
//         return new Promise((resolve, reject) => {
//             this.checkAlbum(albumId);
//             if (this.cache[albumId].thumbs.length > 0) {
//                 console.log('read thumbs from cache');
//                 resolve(this.cache[albumId].thumbs);
//             } else {
//                 (new TextReqService(API.getIntroHtml(introUrl, 1)))
//                 .request()
//                     .then(text => {
//                         let introPage = new IntroHtmlParser(text);
//                         this.cache[albumId].thumbs = introPage.getThumbObjList(sumOfPage, albumId);
//                         this.save();
//                         resolve(this.cache[albumId].thumbs);
//                     }, err => {
//                         console.log(err);
//                         // TODO: show tips for the error
//                     });
//             }
//         });
//     }

//     getImgInfos(albumId, introUrl, sumOfPage) {
//         return new Promise((resolve, reject) => {
//             this.checkAlbum(albumId);
//             if (this.cache[albumId].imgInfos.length > 0) {
//                 console.log('read imgInfos from cache');
//                 resolve(this.cache[albumId].imgInfos);
//             } else {
//                 (new ImgUrlListParser(introUrl, sumOfPage))
//                 .request()
//                     .then(imgInfos => {
//                         this.cache[albumId].imgInfos = imgInfos;
//                         this.save();
//                         resolve(this.cache[albumId].imgInfos);
//                     }, err => {
//                         console.log(err)
//                     });
//             }
//         });
//     }

//     getImgSrc(albumId, index, mode) {
//         return new Promise((resolve, reject) => {
//             this.checkAlbum(albumId);
//             if (this.cache[albumId].imgInfos[index].src) {
//                 resolve(resolve(this.cache[albumId].imgInfos[index].src));
//             } else {
//                 (new TextReqService(this.cache[albumId].imgInfos[index].pageUrl))
//                 .request()
//                     .then(text => {
//                         console.log(mode);
//                         if (mode) {
//                             switch (mode) {
//                                 case 'origin': // if want to load original img
//                                     this.cache[albumId].imgInfos[index].src = new ImgHtmlParser(text).getOriginalImgUrl();
//                             }
//                         } else {
//                             // default img
//                             this.cache[albumId].imgInfos[index].src = new ImgHtmlParser(text).getImgUrl();
//                         }
//                         this.save();
//                         resolve(this.cache[albumId].imgInfos[index].src);
//                     });
//             }
//         });
//     }

//     getNewImgSrc(albumId, index, mode) {
//         this.cache[albumId].imgInfos[index].src = null;
//         this.save();
//         return this.getImgSrc(albumId, index, mode);
//     }

// }

// export default AlbumCacheService;
