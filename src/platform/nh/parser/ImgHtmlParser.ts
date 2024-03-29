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
        return Number(this.html.querySelector('.current')!.textContent);
    }

    getPageCount(): number {
        return Number(this.html.querySelector('.num-pages')!.textContent);
    }

    getImgHeight(): number {
        return Number(this.html.querySelector('#image-container')!.children[0]!.children[0]!.getAttribute('height'));
    }

    getImgWidth(): number {
        return Number(this.html.querySelector('#image-container')!.children[0]!.children[0]!.getAttribute('width'));
    }

    getIntroUrl(): string {
        return this.html.querySelector('.go-back')!.getAttribute('href')!;
    }

    getAlbumId(): string {
        return this.getIntroUrl().replace(/(\/|g)/g, '');
    }

    getImgUrl(): string {
        return this.html.querySelector('#image-container')!.children[0]!.children[0]!.getAttribute('x-src')!;
    }
}
