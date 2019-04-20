// a singleton service for caching img url
import { TextReq } from '../../base/request/TextReq.ts'
import { ImgHtmlParser } from '../parser/ImgHtmlParser.ts'
import { ImgUrlListParser } from '../parser/ImgUrlListParser.ts'
import { IntroHtmlParser } from '../parser/IntroHtmlParser'
import * as API from '../api.ts'
import storage from 'core/service/storage/LocalStorage'
import Logger from 'core/utils/Logger'
import InfoService from 'core/service/InfoService'
import SettingService from 'core/service/SettingService'
import store from 'core/store'
import * as tags from '../../../assets/value/tags'
import Utils from 'core/utils/Utils'

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

export class AlbumCacheService {
    constructor(albumService) {
        this.version = '2.0';
        this.storageName = 'AlbumCache';
        this.storageVersionName = 'AlbumCacheVersion';
        this._initStorage();
        this._migrate();
        this._isNormalMode = false; // make sure in 'Normal' mode
        this._isChangedMode = false;
        this.albumService = albumService;
    }

    async _migrate() {
        // remove version < 2.0
        // await Platform.storage.local.get('cache', async(value) => {
        //     if (typeof value['cache'] !== 'undefined') {
        //         await Platform.storage.local.remove('cache', () => {});
        //         await Platform.storage.local.remove('cacheVersion', () => {});
        //     }
        // });
        // remove old version >= 2.0
        let version = await storage.load({ key: this.storageVersionName });
        await storage.save({ key: this.storageVersionName, data: this.version });
        if (version !== this.version) {
            await storage.clearMapForKey(this.storageName);
            window.location.reload(); // TODO: need a notification
        }
    }

    _initStorage() {
        storage.sync[this.storageVersionName] = (params) => {
            let { resolve } = params;
            if (resolve) {
                return resolve(this.version);
            }
        };
    }

    async _getAlbum(albumId) {
        if (this._album) {
            return this._album;
        } else {
            try {
                this._album = await storage.load({ key: this.storageName, id: albumId });
            } catch (e) {
                this._album = {
                    title: '',
                    thumbs: [],
                    imgInfos: []
                };
            }
            return this._album;
        }
    }

    async _saveAlbum(albumId) {
        // L.o('save', this._album);
        await storage.save({ key: this.storageName, id: albumId, data: await this._getAlbum(albumId), expires: 1000 * 60 * 60 });
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
                try { // If in 'Normal' mode of thumbnails, this will be right
                    text = await new TextReq(API.getIntroHtml(introUrl, 1)).request();
                    new IntroHtmlParser(text).getThumbObjList(sumOfPage, albumId);
                    this._isNormalMode = true;
                    await SettingService.setNormalMode(true);
                } catch (e) { // In 'Large' mode
                    // Send a request to change to 'Normal' mode
                    try {
                        introUrl = (await window.fetch(`${window.location.origin}${introUrl}?inline_set=ts_m`, { method: 'GET', credentials: 'include' })).url;
                        text = await new TextReq(API.getIntroHtml(introUrl, 1)).request();
                        this.albumService.setIntroUrl(introUrl);
                        this._isNormalMode = true;
                        Logger.logText('Cache', 'switch to small');
                        this._isChangedMode = true;
                        await SettingService.setNormalMode(false);
                    } catch (e) {
                        InfoService.showReloadError(store.getters.string.changingToSmallFailed);
                        Logger.logObj('AlbumCache', e);
                    }
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
            if (!await SettingService.getNormalMode()) {
                while (!this._isNormalMode) {
                    await Utils.timeout(100);
                }
                introUrl = this.albumService.getIntroUrl(); // after changine mode, the introUrl maybe changed.
            }
            try {
                return await this._getImgInfos(albumId, introUrl, sumOfPage);
            } catch (e) {
                Logger.logText('CacheService', 'loading ImgInfos failed. It\'s large.');
                while (!this._isNormalMode) {
                    await Utils.timeout(100);
                    introUrl = this.albumService.getIntroUrl();
                }
                return await this._getImgInfos(albumId, introUrl, sumOfPage);
            }
        }
    }

    async _getImgInfos(albumId, introUrl, sumOfPage) {
        let album = await this._getAlbum(albumId);
        let imgInfos = await (new ImgUrlListParser(introUrl, sumOfPage)).request();
        album.imgInfos = imgInfos;
        await this._saveAlbum(albumId);
        if (this._isChangedMode) {
            window.fetch(`${introUrl}?inline_set=ts_l`, { method: 'GET', credentials: 'include' }); // change back
        }
        return JSON.parse(JSON.stringify(album.imgInfos));
    }

    async getImgSrc(albumId, index, mode, sourceId) {
        let album = await this._getAlbum(albumId);
        if (album.imgInfos[index].src) {
            return album.imgInfos[index].src;
        }
        try {
            let param = sourceId ? `?nl=${sourceId}` : ''; // change source 0f img
            let req = new TextReq(album.imgInfos[index].pageUrl + param);
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
