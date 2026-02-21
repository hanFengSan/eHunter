import { ImgHtmlParser } from '../parser/ImgHtmlParser'
import { AlbumCacheService } from './AlbumCacheService'
import { AlbumService } from '../../../../core/service/AlbumService'
import { ThumbInfo } from '../../../../core/bean/ThumbInfo'
import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo'
// import Logger from '../utils/Logger';

export class AlbumServiceImpl extends AlbumService {
    protected imgHtmlParser: ImgHtmlParser;
    protected cacheService: any;
    protected thumbInfos: Array<ThumbInfo> = [];
    protected sumOfPage: number | undefined;
    protected introUrl: string = '';
    protected albumId: string = '';
    protected curPageNum: number | undefined;
    protected title: string = '';
    protected imgPageInfos: Array<ImgPageInfo> = [];

    constructor(imgHtml: string) {
        super();
        this.imgHtmlParser = new ImgHtmlParser(imgHtml);
        this.cacheService = new AlbumCacheService(this);
    }

    async getPageCount(): Promise<number> {
        if (!this.sumOfPage) {
            this.sumOfPage = this.imgHtmlParser.getPageCount();
        }
        return this.sumOfPage;
    }

    getIntroUrl() {
        if (!this.introUrl) {
            this.introUrl = this.imgHtmlParser.getIntroUrl();
        }
        return this.introUrl;
    }

    setIntroUrl(val) {
        this.introUrl = val;
    }

    async getAlbumId(): Promise<string> {
        if (!this.albumId) {
            this.albumId = this.imgHtmlParser.getAlbumId();
        }
        return this.albumId;
    }

    async getCurPageNum(): Promise<number> {
        if (!this.curPageNum) {
            this.curPageNum = this.imgHtmlParser.getCurPageNum();
        }
        return this.curPageNum;
    }

    async getTitle(): Promise<string> {
        if (!this.title) {
            this.title = this.imgHtmlParser.getTitle();
        }
        return this.title;
    }

    getCacheService() {
        return this.cacheService;
    }

    async getImgPageInfos(): Promise<Array<ImgPageInfo>> {
        return this.cacheService.getImgPageInfos(await this.getAlbumId(), await this.getIntroUrl(), await this.getPageCount());
    }

    async getImgPageInfo(index: number): Promise<ImgPageInfo> {
        return (await this.getImgPageInfos())[index];
    }

    getImgSrc(index, mode) {
        return this.cacheService.getImgSrc(this.getAlbumId(), index, mode);
    }

    getNewImgSrc(index, mode) {
        return this.cacheService.getNewImgSrc(this.getAlbumId(), index, mode);
    }

    async getThumbInfos(cache = true): Promise<Array<ThumbInfo>> {
        if (!cache || this.thumbInfos.length === 0) {
            this.thumbInfos = this.cacheService.getThumbInfos(await this.getAlbumId(), await this.getIntroUrl(), await this.getPageCount());
        }
        return this.thumbInfos;
    }

    async getThumbInfo(index): Promise<ThumbInfo> {
        return (await this.getThumbInfos())[index];
    }

    async getPreviewThumbnailStyle(index: number, imgPageInfo: ImgPageInfo, thumbInfo: ThumbInfo, width: number, height: number) {
        let common = `${thumbInfo.style}; height: ${thumbInfo.height}px; width: ${thumbInfo.width}px; position: absolute; left: 50%; top: 50%;`
        if (thumbInfo.height > thumbInfo.width) {
            return `${common}; transform: translate(-50%, -50%) scale(${height / thumbInfo.height})`
        } else {
            return `${common}; transform: translate(-50%, -50%) scale(${width / thumbInfo.width})`
        }
    }

    supportOriginImg(): boolean {
        return true;
    }

    supportImgChangeSource(): boolean {
        return true;
    }

    supportThumbView(): boolean {
        return true;
    }
}
