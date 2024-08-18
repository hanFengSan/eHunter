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
            return Array.prototype.slice.call(this.html.getElementsByClassName('gdtm'), 0).map(item => {
                item.children[0].getAttribute('style').match(/width:(.*?)px; height:(.*?)px;/g);
                const thumbHeight = Number(RegExp.$2);
                const thumbWidth = Number(RegExp.$1);
                let pageUrl = item.getElementsByTagName('a')[0].getAttribute('href').match(/\/s.*$/) + '';
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

    getThumbObjList(): Array<ThumbInfo> {
        if (this._isValidIntroPage()) {
            return Array.from(this.html.querySelectorAll('.gdtm>div')).map(div=>{
                let url_s = (div as HTMLDivElement).style.backgroundImage;
                let pos_s = (div as HTMLDivElement).style.backgroundPositionX;
                if(url_s && url_s.startsWith('url("') && pos_s && pos_s.endsWith('px')) {
                    let url = url_s.substring(5, url_s.length - 2);
                    let pos = parseInt(pos_s.substring(0, pos_s.length - 2));
                    return {
                        id: url+pos,
                        src: url,
                        mode: ThumbMode.SPIRIT,
                        offset: -pos,
                    };
                }
                else
                    return {
                        id: '',
                        src: '',
                        mode: ThumbMode.SPIRIT,
                    };
            }).filter(x=>x.src!=='');
        } else {
            return [];
        }
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
}