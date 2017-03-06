// a parser for ablum's img page
class ImgHtmlParser {
    constructor(html) {
        this.html = document.createElement('html');
        this.html.innerHTML = html;
        this.document = this.html.ownerDocument;
        this._initI2Element();
        this._initImgSizeInfo();
        return this;
    }

    getTitle() {
        return this.document.getElementsByTagName('h1')[0].textContent;
    }

    getCurPageNum() {
        return this.i2.getElementsByTagName('span')[0].textContent * 1;
    }

    getSumOfPage() {
        return this.i2.getElementsByTagName('span')[1].textContent * 1;
    }

    getImgHeight() {
        return this.imgSizeInfo[0].trim();
    }

    getImgWidth() {
        return this.imgSizeInfo[1].trim();
    }

    getIntroUrl() {
        return this.document.getElementsByClassName('sb')[0].children[0].getAttribute('href')
            .replace(/^.*?org/g, '').replace(/\?p=.*?$/g, '');
    }

    getAlbumId() {
        return this.getIntroUrl().split('/')[2];
    }

    getImgId() {
        return window.location.pathname.split('/')[2];
    }

    getNextImgId() {
        return this.document.getElementById('i3').children[0].getAttribute('href').split('/')[4];
    }

    getImgUrl() {
        return this.document.getElementById('img').getAttribute('src');
    }

    getImgBaseUrl() {
        return window.location.pathname.replace(/-.*$/g, '');
    }

    getOriginalImg() {
        return this.document.getElementById('i7').children.length > 0 ?
            this.document.getElementById('i7').children[1].getAttribute('href') : ''
    }

    _initI2Element() {
        this.i2 = this.document.getElementById('i2');
    }

    _initImgSizeInfo() {
        this.imgSizeInfo = this.i2.children[1].textContent.split('::')[1].split('x');
    }
}

export default ImgHtmlParser;