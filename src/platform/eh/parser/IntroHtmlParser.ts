import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo'
import { ThumbInfo, ThumbMode } from '../../../../core/bean/ThumbInfo'

// a parser for album's intro page
export class IntroHtmlParser {
    private html: HTMLElement;
    private reqUrl: string;

    constructor(html, reqUrl) {
        this.html = document.createElement('html');
        this.reqUrl = reqUrl; // the request url. It's maybe different with introUrl in more thumbs mode
        this.html.innerHTML = html.replace(/src=/g, 'x-src='); // avoid load assets
        // this.document = this.html.ownerDocument!;
    }

    getImgUrls(): Array<ImgPageInfo> {
        if (this._isValidIntroPage()) {
            return Array.prototype.slice.call(this.html.getElementsByClassName("gt200")[0].children, 0).map(item => {
                item.getElementsByTagName("div")[0].getAttribute('style').match(/width:(.*?)px;height:(.*?)px;/g);
                const thumbHeight = Number(RegExp.$2);
                const thumbWidth = Number(RegExp.$1);
                let pageUrl = item.getAttribute('href').match(/\/s.*$/) + '';
                return {
                    id: pageUrl,
                    index: 0,
                    pageUrl,
                    src: '',
                    thumbHeight,
                    thumbWidth,
                    heightOfWidth: thumbHeight / thumbWidth
                };
            })
        } else {
            return [];
        }
    }

    getThumbObjList(sumOfPage, albumId): Array<ThumbInfo> {
        return this._computeThumbList(this._getThumbImgList(albumId, sumOfPage), sumOfPage);
    }

    _getThumbKeyId() {
        let tmp = this.html.getElementsByClassName('gt200')![0].children![0].getElementsByTagName("div")![0].getAttribute('style')!.match(/m\/.*?\//);
        return (tmp + '').replace(/(m|\/)/g, '');
    }

    _getThumbPageCount(sumOfPage) {
        // 20 is the img sum per spirit in small thumb model
        if (sumOfPage < 20) {
            return 1;
        }
        let reminder = sumOfPage % 20;
        if (reminder > 1) {
            return (sumOfPage - reminder) / 20 + 1;
        } else {
            return sumOfPage / 20;
        }
    }

    _getThumbImgList(albumId, sumOfPage): string[] {
        let thumbKeyId = this._getThumbKeyId();
        let imgList: string[] = [];
        for (let i = 0; i < this._getThumbPageCount(sumOfPage); i++) {
            if (window.location.hostname === 'e-hentai.org') {
                imgList.push(`https://ehgt.org/m/${thumbKeyId}/${albumId}-${i < 10 ? '0' + i : i}.jpg`);
            } else {
                imgList.push(`https://s.exhentai.org/m/${thumbKeyId}/${albumId}-${i < 10 ? '0' + i : i}.jpg`);
            }
        }
        return imgList;
    }

    _getTruePageIndex() {
        return Number(this.html.getElementsByClassName('ptds')[0].textContent) - 1;
    }

    _isValidIntroPage() {
        // In more thumbs mode, it will have many repeated intro page requests because the error of count of intro pages.
        // For the speed first, I don't fix the bug of the error, but discard the repeated intro page requests by validating
        // index.
        if (this.reqUrl && this.reqUrl.includes('?p=')) {
            let reqIndex = Number(this.reqUrl!.match(/\?p=[0-9]+/g)![0].replace('?p=', ''));
            if (this._getTruePageIndex() !== reqIndex) {
                return false;
            }
        }
        return true;
    }

    _computeThumbList(imgList, sumOfPage): Array<ThumbInfo> {
        let thumbObjList: Array<ThumbInfo> = [];
        for (let i = 0; i < imgList.length; i++) {
            for (let t = 0; t < 20; t++) {
                if (i !== imgList.length - 1 ||
                    (t < (sumOfPage % 20 || 20))
                ) {
                    thumbObjList.push({
                        id: imgList[i] + t,
                        src: imgList[i],
                        mode: ThumbMode.SPIRIT,
                        offset: t * 100
                    })
                }
            }
        }
        return thumbObjList;
    }
}