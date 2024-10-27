// a parser for album's img page
export class ImgHtmlParser {
    private htmlText: string;
    private html: HTMLElement;
    private document: Document | null;
    private i2: HTMLElement | undefined;
    private imgSizeInfo: Array<string> | undefined;

constructor(html) {
        this.htmlText = html.replace(/src=/g, 'x-src='); // avoid load assets
        this.html = document.createElement('html');
        this.html.innerHTML = this.htmlText;
        this.document = this.html.ownerDocument;
        this._initI2Element();
        this._initImgSizeInfo();
        return this;
    }

    private _initI2Element() {
        this.i2 = <HTMLElement>this.html.querySelector('#i2');
        if (!this.i2) {
            throw new Error('ImgHtmlParser: i2 is undefined');
        }
    }

    private _initImgSizeInfo() {
        this.imgSizeInfo = this.i2!.children[1]!.textContent!.split('::')[1].split('x');
    }

    getTitle(): string {
        let elem = this.html.querySelector('h1');
        return elem ? (elem.textContent || '') : '';
    }

    getCurPageNum(): number {
        return Number(this.i2!.getElementsByTagName('span')[0]!.textContent!);
    }

    getPageCount(): number {
        return Number(this.i2!.getElementsByTagName('span')[1]!.textContent);
    }

    getImgHeight(): number {
        return Number(this.imgSizeInfo![1].trim());
    }

    getImgWidth(): number {
        return Number(this.imgSizeInfo![0].trim());
    }

    getPreciseHeightOfWidth(): number {
        return Number(this.getImgHeight() / this.getImgWidth());
    }

    getIntroUrl(): string {
        let url = this.html!.querySelectorAll('.sb')![0].children![0].getAttribute('href')!
            .replace(/^.*?org/g, '').replace(/\?p=.*?$/g, '');
        return url;
    }

    getAlbumId(): string {
        return this.getIntroUrl().match(/g\/\d+(?=\/)/)![0].replace('g/', '');
    }

    getImgId(): string {
        return window.location.pathname.split('/')[2];
    }

    getNextImgId(): string {
        return this.document!.getElementById('i3')!.children![0].getAttribute('href')!.split('/')[4];
    }

    getImgUrl(): string {
        this.htmlText.match('id="img" x-src="(.*?)"');
        return RegExp.$1;
    }

    getOriginalImgUrl(): string {
        let items = this.html.querySelector('#i6')!.children
        return items[items.length - 1].children[1]!.getAttribute('href')!
    }

    getSourceId(): string {
        this.html!.querySelector('#loadfail')!.attributes['onclick'].value.match(/nl\('(.*?)'\)/g);
        return RegExp.$1;
    }
}
