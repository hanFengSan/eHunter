import { ImgHtmlParser } from '../parser/ImgHtmlParser'
import { AlbumCacheService } from './AlbumCacheService'
import { AlbumService } from '../../../../core/service/AlbumService';
import { ThumbInfo } from '../../../../core/bean/ThumbInfo';
import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo';
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
        return this.cacheService.getImgInfos(await this.getAlbumId(), await this.getIntroUrl(), await this.getPageCount());
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
            this.thumbInfos = this.cacheService.getThumbs(await this.getAlbumId(), await this.getIntroUrl(), await this.getPageCount());
        }
        return this.thumbInfos;
    }

    async getThumbInfo(index): Promise<ThumbInfo> {
        return (await this.getThumbInfos())[index];
    }

    /* Calculate thumbnail size and return style
    1. When heightOfWidth = 1.44, the height of thumbnail equals height of sprite and width of thumbnail equals sprites/sum . Considering tolerance, there uses 1.43.
    2. the width of all thumbnails in sprite is 100px.
    3. Using percentage in 'background-position', equals {-[(container_size - image-size) * percentage]px} in 'background-position'.
    4. Using percentage in 'background-size', stretches the image in the corresponding dimension to the specified percentage of the background positioning area.
    SO:
    (1) Real size of sprite: x * y
    (2) Stretched size of sprite: c * d
    (3) Size of current page image: a * b
    (4) Let count of thumbnails in current sprite be n.
    # When the height of thumbnail equals height of sprite
    Using stye: 'background-size: cover', so d equals b.
    So, stretched size of sprite: c * b.
    Let the scale of stretching be u.So: uy = b, ux = c => u = b / y.
    Let the percentage of moving out a thumbnail in 'background-position' be p.
    We can get a mathematical equation:
    (a - c) * p = -(c / n)
    => 1/p = n * (1 - a / c)
    => 1/p = n * (1 - a / ux)
    => 1/p = n * {1 - a / [(b / y)x]}
    => 1/p = n * {1 - (a / b) * (y / x)}
    So:
    formula_1: p = 1 / {n * {1 - (a / b) * (y / x)}}
    # When the height of thumbnail doesn't equal height of sprite, and the width of thumbnail is 100px.
    In this situation, formula_1 would figure out a false result.
    Using style: 'background-size: n*100%'.
    => The width of thumbnail equals the width of current page image.
    => n * a = x. n * a = c.
    => n = c / a.
    We can get the mathematical equation again:
    (a - c) * p = -(c / n).
    => 1/p = n * (1 - a / c)
    => 1/p = n * (1 - 1 / n)
    => p = 1 / (sum - 1)
    So:
    formula_2: p = 1 / (sum - 1).
    */
    async getPreviewThumbnailStyle(index: number, imgPageInfo: ImgPageInfo, thumbInfo: ThumbInfo) {
        const indexInThumbSprite = index % 20;
        const sumOfThumbInSprite = (await this.getPageCount() - (index + 1)) >= await this.getPageCount() % 20 ?
            20 : (await this.getPageCount() % 20);
        let percentage;
        if (imgPageInfo.heightOfWidth >= 1.43) {
            percentage = 1 / (sumOfThumbInSprite * (1 - (1 / imgPageInfo.heightOfWidth) * (imgPageInfo.thumbHeight! / (sumOfThumbInSprite * 100))));
        } else {
            percentage = 1 / (sumOfThumbInSprite - 1);
        }
        let offsetPercentage = indexInThumbSprite * percentage;
        return {
            'background-image': `url(${thumbInfo.src})`,
            'background-position': `${offsetPercentage * 100}% 0`,
            'background-size': imgPageInfo.heightOfWidth >= 1.43 ? 'cover' : `${sumOfThumbInSprite * 100}%`
        };
    }

    supportOriginImg() {
        return true;
    }

    supportImgChangeSource() {
        return true;
    }
}
