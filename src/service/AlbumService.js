import ImgHtmlParser from './parser/ImgHtmlParser';
import AlbumCacheService from './storage/AlbumCacheService';
import Logger from '../utils/Logger';

class AlbumService {
    constructor(imgHtml) {
        this.imgHtmlParser = imgHtml ? new ImgHtmlParser(imgHtml) : {};
        this.cacheService = AlbumCacheService;
        this.thumbs = [];
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

    async getImgInfo(index) {
        return await this.getImgInfos()[index];
    }

    getImgSrc(index) {
        return this.cacheService.getImgSrc(this.getAlbumId(), index);
    }

    getNewImgSrc(index, mode) {
        return this.cacheService.getNewImgSrc(this.getAlbumId(), index, mode);
    }

    getThumbs(cache = true) {
        if (!cache || this.thumbs.length === 0) {
            this.thumbs = this.cacheService.getThumbs(this.getAlbumId(), this.getIntroUrl(), this.getSumOfPage());
        }
        return this.thumbs;
    }

    async getThumb(index) {
        return (await this.getThumbs())[index];
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
    getPreviewThumbnailStyle(index, imgInfo, thumb) {
        const indexInThumbSprite = index % 20;
        const sumOfThumbInSprite = (this.getSumOfPage() - (index + 1)) >= this.getSumOfPage() % 20
                                    ? 20 : (this.getSumOfPage() % 20);
        let percentage;
        if (imgInfo.heightOfWidth >= 1.43) {
            percentage = 1 / (sumOfThumbInSprite * (1 - (1 / imgInfo.heightOfWidth) * (imgInfo.height / (sumOfThumbInSprite * 100))));
        } else {
            percentage = 1 / (sumOfThumbInSprite - 1);
        }
        let offsetPercentage = indexInThumbSprite * percentage;
        return {
            'background-image': `url(${thumb.url})`,
            'background-position': `${offsetPercentage * 100}% 0`,
            'background-size': imgInfo.heightOfWidth >= 1.43 ? 'cover' : `${sumOfThumbInSprite * 100}%`
        };
    }
}

let instance = new AlbumService(document.location.pathname.includes('/s/') ? document.documentElement.innerHTML : null);
export default instance;
