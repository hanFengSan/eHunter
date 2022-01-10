import { ImgHtmlParser } from '../parser/ImgHtmlParser'
import { IntroHtmlParser } from '../parser/IntroHtmlParser'
import { TextReq } from '../../base/request/TextReq'
import { ThumbInfo } from '../../../../core/bean/ThumbInfo'
import { AlbumService, PreviewThumbnailStyle, IndexInfo } from '../../../../core/service/AlbumService'
import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo'
// import Logger from '../utils/Logger';

interface IntroParserResolve {
    (introHtmlParser: IntroHtmlParser): void;
}

export class AlbumServiceImpl extends AlbumService {
    protected imgHtmlParser: ImgHtmlParser;
    protected thumbInfos: Array<ThumbInfo> = [];
    protected introParser: IntroHtmlParser | undefined;
    protected introParserResolves: Array<IntroParserResolve> = [];
    protected initIntroParserStatus: string = 'ready';
    protected sumOfPage: number | undefined;
    protected introUrl: string = '';
    protected albumId: string = '';
    protected curPageNum: number | undefined;
    protected title: string = '';
    protected imgPageInfos: Array<ImgPageInfo> = [];

    constructor(imgHtml: string, imgList: Array<string>) {
        super();
        this.imgHtmlParser = new ImgHtmlParser(imgHtml);
        this.introParser = new IntroHtmlParser(imgHtml, imgList);
    }

    async _getIntroParser(): Promise<IntroHtmlParser> {
        return new Promise(async (resolve, reject) => {
            if (!this.introParser) {
                if (this.introParserResolves) {
                    this.introParserResolves.push(resolve);
                } else {
                    this.introParserResolves = [resolve];
                }
                if (this.initIntroParserStatus === 'ready') {
                    this.initIntroParserStatus = 'pending';
                    this.initIntroParserStatus = 'done';
                    this.introParserResolves = [];
                }
            } else
                resolve(this.introParser);
            document.querySelector(".view-fix-top-bar")!.remove()
        });
    }

    getIntroUrl(): string {
        if (!this.introUrl) {
            this.introUrl = this.imgHtmlParser.getIntroUrl();
        }
        return this.introUrl;
    }

    async getPageCount(): Promise<number> {
        if (!this.sumOfPage) {
            this.sumOfPage = this.imgHtmlParser.getPageCount();
        }
        return this.sumOfPage;
    }

    async getAlbumId(): Promise<string> {
        if (this.albumId === '') {
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
            this.title = (await this._getIntroParser()).getTitle();
        }
        return this.title;
    }

    async getImgPageInfos(): Promise<Array<ImgPageInfo>> {
        if (this.imgPageInfos.length === 0) {
            this.imgPageInfos = (await this._getIntroParser()).getImgPageInfos();
        }
        return this.imgPageInfos;
    }

    async getImgPageInfo(index: number): Promise<ImgPageInfo> {
        return (await this.getImgPageInfos())[index];
    }

    async getImgSrc(index: number, mode): Promise<string> {
        return (await this.getImgPageInfo(index)).src;
    }

    async getNewImgSrc(index: number, mode): Promise<string> {
        return await this.getImgSrc(index, mode);
    }

    async getThumbInfos(noCache = false): Promise<Array<ThumbInfo>> {
        if (noCache || this.thumbInfos.length === 0) {
            this.thumbInfos = (await this._getIntroParser()).getThumbInfos();
        }
        return this.thumbInfos;
    }

    async getThumbInfo(index): Promise<ThumbInfo> {
        return (await this.getThumbInfos())[index];
    }

    async getPreviewThumbnailStyle(index: number, imgPageInfo: ImgPageInfo, thumbInfo: ThumbInfo): Promise<PreviewThumbnailStyle> {
        return {
            'background-image': `url(${thumbInfo.src})`,
            'background-position': `0% 0%`,
            'background-size': 'cover'
        };
    }

    supportOriginImg() {
        return false;
    }

    supportImgChangeSource() {
        return false;
    }

    supportThumbView(): boolean {
        return true;
    }
}
