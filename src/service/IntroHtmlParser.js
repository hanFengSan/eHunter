// a parser for ablum's intro page
class IntroHtmlParser {
    constructor(html) {
        this.html = document.createElement('html');
        this.html.innerHTML = html;
        this.document = this.html.ownerDocument;
        return this;
    }

    getThumbKeyId() {
        let tmp = this.html.getElementsByClassName('gdtm')[0].children[0].getAttribute('style').match(/m\/.*?\//);
        return (tmp + '').replace(/(m|\/)/g, '');
    }

    getImgUrls() {
        return Array.prototype.slice.call(this.html.getElementsByClassName('gdtm'), 0).map(item => {
            return item.getElementsByTagName('a')[0].getAttribute('href').match(/\/s.*$/) + '';
        })
    }
}

export default IntroHtmlParser;