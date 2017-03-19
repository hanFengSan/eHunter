// a parser for search page
class SearchHtmlParser {
    constructor(html) {
        this.htmlText = html;
        this.html = document.createElement('html');
        this.html.innerHTML = html.replace(/src=/g, 'x-src='); // avoid load assets
        this.document = this.html.ownerDocument;
        return this;
    }

    getResultTitles() {
        if (this.html.querySelectorAll('.id2').length > 0) {
            return Array.prototype.slice.call(this.html.querySelectorAll('.id2'), 0).map(i => i.textContent);
        } else {
            return Array.prototype.slice.call(this.html.querySelectorAll('.it5'), 0).map(i => i.textContent);
        }
    }
}

export default SearchHtmlParser;
