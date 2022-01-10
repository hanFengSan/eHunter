// a parser for album's img page
export class ImgHtmlParser {
    private htmlText: string;
    private html: HTMLElement;
    
    constructor(html) {
        this.htmlText = html.replace(/src=/g, 'x-src='); // avoid load assets
        this.html = document.createElement('html');
        this.html.innerHTML = this.htmlText;
        return this;
    }

    getCurPageNum(): number {
        return Number(this.html.querySelector('#lbcurrentpage')!.textContent);
    }

    getPageCount(): number {
        return Number(this.html.querySelector("body > div:nth-child(1) > div > p")!.textContent!.split("/")[1]);
    }

    getImgHeight(): number {
        return Number((<HTMLImageElement>this.html.querySelector("img.lazy")).height);
    }

    getImgWidth(): number {
        return Number((<HTMLImageElement>this.html.querySelector("img.lazy")).width);
    }

    getIntroUrl(): string {
        return <string>document.querySelector("body > div.view-fix-bottom-bar > a:nth-child(1)")!.getAttribute("href");
    }

    getAlbumId(): string {
        return <string>document.querySelector("body > div.view-fix-bottom-bar > a:nth-child(1)")!.getAttribute("href");
    }

    getImgUrl(): string {
        return this.html.querySelector('#image-container')!.querySelector('.fit-horizontal')!.getAttribute('x-src')!;
    }
}
