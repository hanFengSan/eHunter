import ImgHtmlParser from './parser/ImgHtmlParser';
import AlbumCacheService from './storage/AlbumCacheService';

class AlbumService {
    constructor(imgHtml) {
        this.imgHtmlParser = new ImgHtmlParser(imgHtml);
        this.cacheService = AlbumCacheService;
    }

    getSumOfPage() {
        if (!this.sumOfPage) {
            this.sumOfPage = this.imgHtmlParser.getSumOfPage();
        }
        return this.sumOfPage;
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

    getTitle() {
        if (!this.title) {
            this.title = this.imgHtmlParser.getTitle();
        }
        return this.title;
    }

    getCacheService() {
        return this.cacheService;
    }

    getImgInfos() {
        return this.cacheService.getImgInfos(this.getAlbumId(), this.getIntroUrl(), this.getSumOfPage());
    }

    getImgSrc(index) {
        return this.cacheService.getImgSrc(this.getAlbumId(), index);
    }

    getNewImgSrc(index, mode) {
        return this.cacheService.getNewImgSrc(this.getAlbumId(), index, mode);
    }

    getThumbs() {
        return this.cacheService.getThumbs(this.getAlbumId(), this.getIntroUrl(), this.getSumOfPage());
    }
}

let instance = new AlbumService(document.documentElement.innerHTML);
export default instance;
