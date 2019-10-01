// a parser for search page
class SearchHtmlParser {
    constructor(html) {
        this.htmlText = html;
        this.html = document.createElement('html');
        this.html.innerHTML = html.replace(/src=/g, 'x-src=').replace(/stylesheet/g, 'x-stylesheet'); // avoid load assets
        this.document = this.html.ownerDocument;
        return this;
    }

    getType() {
      const classList = this.html.querySelector('.itg').classList;
      if (classList.contains('gltm')) {
        return 'Minimal';
      }
      if (classList.contains('gltc')) {
        return 'Compact';
      }
      if (classList.contains('glte')) {
        return 'Extended';
      }
      if (classList.contains('glte')) {
        return 'Extended';
      }
      if (classList.contains('gld')) {
        return 'Thumbnail';
      }
      throw new Error('cannot get type');
    }

    getResults() {
      const type = this.getType();
      let items;
      switch (type) {
        case 'Minimal':
        case 'Compact':
          items = [...this.html.querySelectorAll('.glink')];
          return items.map(i => ({
            title: i.textContent + '_test',
            url: i.parentElement.getAttribute('href'),
          }));
        case 'Extended':
        case 'Thumbnail':
          items = [...this.html.querySelectorAll('.glname')];
          return items.map(i => ({
            title: i.textContent,
            url: i.parentElement.getAttribute('href'),
          }));
      }
    }
}

export default SearchHtmlParser;
