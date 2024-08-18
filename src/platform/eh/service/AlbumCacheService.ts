// a singleton service for caching img url
import { TextReq } from '../../base/request/TextReq'
import { ImgHtmlParser } from '../parser/ImgHtmlParser'
import { ImgUrlListParser } from '../parser/ImgUrlListParser'
import { IntroHtmlParser } from '../parser/IntroHtmlParser'
import * as API from '../api'
import storage from '../../../../core/service/storage/LocalStorage'
import Logger from '../../../../core/utils/Logger'
import InfoService from '../../../../core/service/InfoService'
import SettingService from '../../../../core/service/SettingService'
import store from '../../../../core/store'
import * as tags from '../../../../core/assets/value/tags'
import Utils from '../../../../core/utils/Utils'
import { AlbumServiceImpl } from './AlbumServiceImpl'
import { ThumbInfo } from '../../../../core/bean/ThumbInfo'
import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo'

/*
storage
  |-key: (albumId: string); value: AlbumCache
 */
interface AlbumCache {
    title: string;
    thumbInfos: Array<ThumbInfo>;
    imgPageInfos: Array<ImgPageInfo>;
}

export class AlbumCacheService {
    private version = '2.2';
    private storageName = 'AlbumCache';
    private storageVersionName = 'AlbumCacheVersion';
    private _isNormalMode = false; // make sure in 'Normal' mode
    private albumService: AlbumServiceImpl;
    private _album: AlbumCache | undefined;
    private _parseAlbumPromise: Promise<[Array<ThumbInfo>, Array<ImgPageInfo>]> | undefined;

    constructor(albumService) {
        this._initStorage();
        this._migrate();
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

    async _getAlbum(albumId: string): Promise<AlbumCache> {
        if (this._album) {
            return this._album;
        } else {
            try {
                this._album = await storage.load({ key: this.storageName, id: albumId });
            } catch (e) {
                this._album = {
                    title: '',
                    thumbInfos: [],
                    imgPageInfos: []
                };
            }
            return this._album!;
        }
    }

    async _saveAlbum(albumId: string): Promise<void> {
        // L.o('save', this._album);
        await storage.save({ key: this.storageName, id: albumId, data: await this._getAlbum(albumId), expires: 1000 * 60 * 60 });
    }

    async getThumbInfos(albumId: string, introUrl, sumOfPage): Promise<Array<ThumbInfo>> {
        let album = await this._getAlbum(albumId);
        if (album.thumbInfos.length > 0) {
            Logger.logText('CacheService', 'read thumbInfos from cache');
            return JSON.parse(JSON.stringify(album.thumbInfos));
        } else {
            try {
                let thumbInfos = (await this._getThumbAndImgPageInfos(albumId, introUrl, sumOfPage))[0];
                await this._saveAlbum(albumId);
                return thumbInfos;
            } catch (e) {
                // TODO: show tips for the error
                console.error(e);
                return [];
            }
        }
    }

    async getImgPageInfos(albumId: string, introUrl: string, sumOfPage: number): Promise<Array<ImgPageInfo>> {
        let album = await this._getAlbum(albumId);
        if (album.imgPageInfos.length > 0) {
            Logger.logText('CacheService', 'read imgPageInfos from cache');
            return JSON.parse(JSON.stringify(album.imgPageInfos));
        } else {
            if (!await SettingService.getNormalMode()) {
                while (!this._isNormalMode) {
                    await Utils.timeout(100);
                }
                introUrl = this.albumService.getIntroUrl(); // after changine mode, the introUrl maybe changed.
            }
            try {
                return (await this._getThumbAndImgPageInfos(albumId, introUrl, sumOfPage))[1];
            } catch (e) {
                Logger.logText('CacheService', 'loading ImgPageInfos failed. It\'s large.');
                while (!this._isNormalMode) {
                    await Utils.timeout(100);
                    introUrl = this.albumService.getIntroUrl();
                }
                return (await this._getThumbAndImgPageInfos(albumId, introUrl, sumOfPage))[1];
            }
        }
    }

    async _parseAlbum(introUrl: string, sumOfPage: number) {
        return await (new ImgUrlListParser(introUrl, sumOfPage)).request();
    }

    async _getThumbAndImgPageInfos(albumId: string, introUrl: string, sumOfPage: number): Promise<[Array<ThumbInfo>, Array<ImgPageInfo>]> {
        if(!this._parseAlbumPromise)
            this._parseAlbumPromise = this._parseAlbum(introUrl, sumOfPage);
        let [thumbInfos, imgPageInfos] = await this._parseAlbumPromise;
        this._parseAlbumPromise = undefined;

        this._album!.thumbInfos = thumbInfos;
        this._album!.imgPageInfos = imgPageInfos
        await this._saveAlbum(albumId);

        return [
            JSON.parse(JSON.stringify(thumbInfos)),
            JSON.parse(JSON.stringify(imgPageInfos)),
        ];
    }

    async getImgSrc(albumId, index, mode, sourceId?): Promise<ImgPageInfo | Error> {
        let album = await this._getAlbum(albumId);
        if (album.imgPageInfos[index].src) {
            return {...album.imgPageInfos[index]};
        }
        try {
            let param = sourceId ? `?nl=${sourceId}` : ''; // change source 0f img
            let req = new TextReq(album.imgPageInfos[index].pageUrl + param);
            if (mode === tags.MODE_FAST) { // fast fetch
                req.setTimeOutTime(3);
            }
            let text = await req.request();
            let parser = new ImgHtmlParser(text);
            switch (mode) {
                case tags.MODE_ORIGIN: // if want to load original img
                    try {
                        album.imgPageInfos[index].src = parser.getOriginalImgUrl();
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
                    album.imgPageInfos[index].src = parser.getImgUrl();
            }
            album.imgPageInfos[index].preciseHeightOfWidth = parser.getPreciseHeightOfWidth();
            await this._saveAlbum(albumId);
            return {...album.imgPageInfos[index]};
        } catch (e) {
            console.error(e);
            return new Error(tags.STATE_ERROR);
            // TODO: show tips for the error
        }
    }

    async getNewImgSrc(albumId: string, index: number, mode): Promise<ImgPageInfo | Error> {
        let album = await this._getAlbum(albumId);
        album.imgPageInfos[index].src = '';
        await this._saveAlbum(albumId);
        return await this.getImgSrc(albumId, index, mode);
    }
}
