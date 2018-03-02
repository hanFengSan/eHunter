// a singleton service for caching img url
import TextReqService from '../request/TextReqService.js'
import ImgHtmlParser from '../parser/ImgHtmlParser.js'
import ImgUrlListParser from '../parser/ImgUrlListParser.js'
import IntroHtmlParser from '../parser/IntroHtmlParser.js'
import * as API from '../api.js'
import storage from 'src/service/storage/LocalStorage'
import Platform from 'src/service/PlatformService'
import Logger from 'src/utils/Logger'
import DateWrapper from '../../utils/DateWrapper'
import * as tags from '../tags'
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
        this.version = '2.0';
        this.storageName = 'AlbumCache';
        this.storageVersionName = 'AlbumCacheVersion';
        this._initStorage();
        this._migrate();
    }

    async _migrate() {
        // remove version < 2.0
        await Platform.storage.local.get('cache', async(value) => {
            if (typeof value['cache'] !== 'undefined') {
                await Platform.storage.local.remove('cache', () => {});
                await Platform.storage.local.remove('cacheVersion', () => {});
            }
        });
        // remove old version >= 2.0
        let version = await storage.load({ key: this.storageVersionName });
        await storage.save({ key: this.storageVersionName, data: this.version });
        if (version !== this.version) {
            await storage.clearMapForKey(this.storageName);
            window.location.reload(); // TODO: need a notification
        }
    }

    _initStorage() {
        storage.sync[this.storageName] = (params) => {
            let { resolve } = params;
            resolve({
                title: '',
                thumbs: [],
                imgInfos: []
            });
        };
        storage.sync[this.storageVersionName] = (params) => {
            let { resolve } = params;
            return resolve(this.version);
        };
    }

    async _getAlbum(albumId) {
        if (this._album) {
            return this._album;
        } else {
            this._album = await storage.load({ key: this.storageName, id: albumId });
            return this._album;
        }
    }

    async _saveAlbum(albumId) {
        // L.o('save', this._album);
        await storage.save({ key: this.storageName, id: albumId, data: await this._getAlbum(albumId) });
    }

    async getThumbs(albumId, introUrl, sumOfPage) {
        let album = await this._getAlbum(albumId);
        if (album.thumbs.length > 0) {
            Logger.logText('CacheService', 'read thumbs from cache');
            return JSON.parse(JSON.stringify(album.thumbs));
        } else {
            try {
                let text;
                // compatible with large mode
                if (document.cookie.includes('uconfig=dm_t-ts_l')) {
                    document.cookie = 'uconfig=dm_t; path=/; domain=.exhentai.org';
                    text = await new TextReqService(API.getIntroHtml(introUrl, 1)).request();
                    document.cookie = 'uconfig=dm_t-ts_l; path=/; domain=.exhentai.org; expires=' +
                        new DateWrapper().addYears(10).toGMTString();
                } else {
                    text = await new TextReqService(API.getIntroHtml(introUrl, 1)).request();
                }
                let introPage = new IntroHtmlParser(text);
                let thumbs = introPage.getThumbObjList(sumOfPage, albumId);
                album.thumbs = thumbs;
                this._album.thumbs = thumbs; // wired
                await this._saveAlbum(albumId);
                return JSON.parse(JSON.stringify(album.thumbs));
            } catch (e) {
                console.error(e);
                // TODO: show tips for the error
            }
        }
    }

    async getImgInfos(albumId, introUrl, sumOfPage) {
        let album = await this._getAlbum(albumId);
        if (album.imgInfos.length > 0) {
            Logger.logText('CacheService', 'read imgInfos from cache');
            return JSON.parse(JSON.stringify(album.imgInfos));
        } else {
            try {
                let imgInfos = await (new ImgUrlListParser(introUrl, sumOfPage)).request();
                album.imgInfos = imgInfos;
                await this._saveAlbum(albumId);
                return JSON.parse(JSON.stringify(album.imgInfos));
            } catch (e) {
                console.error(e);
                // TODO: show tips for the error
            }
        }
    }

    async getImgSrc(albumId, index, mode, sourceId) {
        let album = await this._getAlbum(albumId);
        if (album.imgInfos[index].src) {
            return album.imgInfos[index].src;
        }
        try {
            let param = sourceId ? `?nl=${sourceId}` : ''; // change source 0f img
            let req = new TextReqService(album.imgInfos[index].pageUrl + param);
            if (mode === tags.MODE_FAST) { // fast fetch
                req.setTimeOutTime(3);
            }
            let text = await req.request();
            let parser = new ImgHtmlParser(text);
            switch (mode) {
                case tags.MODE_ORIGIN: // if want to load original img
                    try {
                        album.imgInfos[index].src = parser.getOriginalImgUrl();
                    } catch (e) {
                        return Error(tags.ERROR_NO_ORIGIN);
                    }
                    break;
                case tags.MODE_CHANGE_SOURCE:
                    if (!sourceId) {
                        return await this.getImgSrc(albumId, index, null, parser.getSourceId());
                    }
                    break;
                default:
                    album.imgInfos[index].src = parser.getImgUrl();
            }
            await this._saveAlbum(albumId);
            return album.imgInfos[index].src;
        } catch (e) {
            console.error(e);
            // TODO: show tips for the error
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
