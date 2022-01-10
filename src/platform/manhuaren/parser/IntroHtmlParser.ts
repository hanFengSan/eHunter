import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo'
import { ThumbInfo, ThumbMode } from '../../../../core/bean/ThumbInfo'

// a parser for album's intro page
export class IntroHtmlParser {
    private html: HTMLElement;
    private imgPageInfos: Array<ImgPageInfo> = [];
    private thumbInfos: Array<ThumbInfo> = [];
    private imgList: Array<string>;

    constructor(html, imgList) {
        this.html = document.createElement('html');
        this.html.innerHTML = html.replace(/src=/g, 'x-src='); // avoid load assets
        this.imgList = imgList;
        this.parseData();
    }

    getTitle(): string {
        let titleDOM = <HTMLElement>this.html.querySelector('.view-fix-top-bar-title')
        return titleDOM!.innerText.split("-")[0];
    }

    private parseData() {
        this.imgList.forEach(async i => {
            const thumbSrc = i;
            var thumbHeight;
            var thumbWidth;
            await new Promise<void>((resolve, reject) => {
                let img = document.createElement("img")
                img.src = thumbSrc
                img.onload = function () {
                    thumbWidth = img.width
                    thumbHeight = img.height
                    resolve()
                }
            })
            const pageUrl = i;
            const imgSrc = i;
            this.imgPageInfos.push({
                id: pageUrl,
                index: this.imgPageInfos.length, // set id to index
                pageUrl,
                thumbHeight,
                thumbWidth,
                src: imgSrc,
                heightOfWidth: thumbHeight / thumbWidth
            });
            this.thumbInfos.push({
                id: pageUrl,
                mode: ThumbMode.IMG,
                src: thumbSrc
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
