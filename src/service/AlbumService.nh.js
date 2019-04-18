import ImgHtmlParser from './parser/ImgHtmlParser.nh.js'
import IntroHtmlParser from './parser/IntroHtmlParser.nh.js'
import TextReqService from './request/TextReqService'
import BaseAlbumService from 'core/service/BaseAlbumService'
// import Logger from '../utils/Logger';

export class NHAlbumService extends BaseAlbumService {
    constructor(imgHtml) {
        super();
        this.imgHtmlParser = imgHtml ? new ImgHtmlParser(imgHtml) : {};
        this.thumbs = [];
    }

    async _getIntroParser() {
        return new Promise(async (resolve, reject) => {
            if (!this.introParser) {
                if (this.introParserResolves) {
                    this.introParserResolves.push(resolve);
                } else {
                    this.introParserResolves = [resolve];
                }
                if (!this._initIntroParserStatus) {
                    this._initIntroParserStatus = 'pending';
                    let text = await new TextReqService(this.getIntroUrl()).request();
                    this.introParser = new IntroHtmlParser(text);
                    this.introParserResolves.forEach(fn => fn(this.introParser));
                    this._initIntroParserStatus = 'done';
                    delete this.introParserResolves;
                }
            } else
                resolve(this.introParser);
        });
    }

    getPageCount() {
        if (!this.sumOfPage) {
            this.sumOfPage = this.imgHtmlParser.getPageCount();
        }
        return this.sumOfPage;
    }

    getBookScreenCount(screenSize) {
        // 2 is start page and end page
        return Math.ceil((this.getPageCount() + 2) / screenSize);
    }

    getIntroUrl() {
        if (!this.introUrl) {
            this.introUrl = this.imgHtmlParser.getIntroUrl();
        }
        return this.introUrl;
    }

    getAlbumId() {
        if (!this.albumId) {
            this.albumId = this.imgHtmlParser.getAlbumId();
        }
        return this.albumId;
    }

    getCurPageNum() {
        if (!this.curPageNum) {
            this.curPageNum = this.imgHtmlParser.getCurPageNum();
        }
        return this.curPageNum;
    }

    async getTitle() {
        if (!this.title) {
            this.title = (await this._getIntroParser()).getTitle();
        }
        return this.title;
    }

    async getImgInfos() {
        if (!this._imgInfos) {
            this._imgInfos = (await this._getIntroParser()).getImgUrls();
        }
        return this._imgInfos;
    }

    async getImgInfo(index) {
        return (await this.getImgInfos())[index];
    }

    async getImgSrc(index, mode) {
        return (await this.getImgInfo(index)).imgUrl;
    }

    async getNewImgSrc(index, mode) {
        return await this.getImgSrc(index, mode);
    }

    async getThumbs(cache = true) {
        if (!cache || this.thumbs.length === 0) {
            this.thumbs = (await this._getIntroParser()).getThumbObjList();
        }
        return this.thumbs;
    }

    async getThumb(index) {
        return (await this.getThumbs())[index];
    }

    getPreviewThumbnailStyle(index, imgInfo, thumb) {
        return {
            'background-image': `url(${thumb.url})`,
            'background-position': `0% 0%`,
            'background-size': 'cover'
        };
    }

    // avoiding the overflow of index
    getRealCurIndex(curIndex) {
        let index = curIndex.val;
        index = index > this.getPageCount() - 1 ? this.getPageCount() - 1 : index;
        return { val: index, updater: curIndex.updater };
    }

    supportOriginImg() {
        return false;
    }

    supportImgChangeSource() {
        return false;
    }
}

let instance = new NHAlbumService(window.location.pathname.split('/').length === 5 ? document.documentElement.innerHTML : null);
export default instance;
