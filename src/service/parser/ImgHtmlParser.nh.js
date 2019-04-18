// a parser for album's img page
class ImgHtmlParser {
    constructor(html) {
        this.htmlText = html.replace(/src=/g, 'x-src='); // avoid load assets
        this.html = document.createElement('html');
        this.html.innerHTML = this.htmlText;
        this.document = this.html.ownerDocument;
        return this;
    }

    getCurPageNum() {
        return this.html.querySelector('.current').textContent * 1;
    }

    getPageCount() {
        return this.html.querySelector('.num-pages').textContent * 1;
    }

    getImgHeight() {
        return this.html.querySelector('#image-container').querySelector('.fit-horizontal').getAttribute('height') * 1;
        return this.imgSizeInfo[0].trim();
    }

    getImgWidth() {
        return this.html.querySelector('#image-container').querySelector('.fit-horizontal').getAttribute('width') * 1;
    }

    getIntroUrl() {
        let url = this.html.querySelector('.back-to-gallery').children[0].getAttribute('href');
        return process.env.NODE_ENV !== 'testing' ? url : 'https://e-hentai.org' + url;
    }

    getAlbumId() {
        return this.html.querySelector('.back-to-gallery').children[0].getAttribute('href').replace(/(\/|g)/g, '');
    }

    getImgUrl() {
        this.html.querySelector('#image-container').querySelector('.fit-horizontal').getAttribute('x-src');
    }
}

export default ImgHtmlParser;
