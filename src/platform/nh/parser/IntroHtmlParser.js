// a parser for album's intro page
class IntroHtmlParser {
    constructor(html, reqUrl) {
        this.html = document.createElement('html');
        this.reqUrl = reqUrl; // the request url. It's maybe different with introUrl in more thumbs mode
        this.html.innerHTML = html.replace(/src=/g, 'x-src='); // avoid load assets
        this.document = this.html.ownerDocument;
    }

    getTitle() {
        return this.html.querySelector('h1').innerHTML;
    }

    getImgUrls() {
        return Array.prototype.slice.call(this.html.querySelectorAll('.gallerythumb'), 0).map(i => {
            const thumbUrl = i.children[0].getAttribute('data-x-src');
            const thumbHeight = i.children[0].getAttribute('height') * 1;
            const thumbWidth = i.children[0].getAttribute('width') * 1;
            const pageUrl = i.getAttribute('href');
            const imgUrl = thumbUrl.replace('t.', 'i.').replace('t.', '.');
            return {
                pageUrl,
                thumbUrl,
                thumbHeight,
                thumbWidth,
                imgUrl,
                heightOfWidth: thumbHeight / thumbWidth
            };
        })
    }

    getThumbObjList() {
        return this.getImgUrls().map(i => {
            return {
                mode: 1,
                url: i.thumbUrl,
                heightOfWidth: i.heightOfWidth
            }
        });
    }
}

export default IntroHtmlParser;
