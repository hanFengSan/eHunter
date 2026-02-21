import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo'
import { ThumbInfo, ThumbMode } from '../../../../core/bean/ThumbInfo'

// a parser for album's intro page
export class IntroHtmlParser {
    private html: HTMLElement;
    private imgPageInfos: Array<ImgPageInfo> = [];
    private thumbInfos: Array<ThumbInfo> = [];


    constructor(html) {
        this.html = document.createElement('html');
        this.html.innerHTML = html.replace(/src=/g, 'x-src='); // avoid load assets
        this.parseData();
    }

    getTitle(): string {
        return this.html.querySelector('h1')!.textContent!;
    }

    private parseData() {
        Array.prototype.slice.call(this.html.querySelectorAll('.gallerythumb'), 0).forEach(i => {
            const thumbSrc = i.children[0].getAttribute('data-x-src');
            const thumbHeight = i.children[0].getAttribute('height') * 1;
            const thumbWidth = i.children[0].getAttribute('width') * 1;
            const pageUrl = i.getAttribute('href');
            this.imgPageInfos.push({
                id: pageUrl,
                index: this.imgPageInfos.length, // set id to index
                pageUrl,
                thumbHeight,
                thumbWidth,
                thumbStyle: '',
                src: '',
                heightOfWidth: thumbHeight / thumbWidth
            });
            this.thumbInfos.push({
                id: pageUrl,
                mode: ThumbMode.IMG,
                src: thumbSrc,
                style: '',
                height: 0,
                width: 0,
            })
        });
    }

    getImgPageInfos(): Array<ImgPageInfo> {
        return this.imgPageInfos;
    }

    getThumbInfos(): Array<ThumbInfo> {
        return this.thumbInfos;
    }
}
