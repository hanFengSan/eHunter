import MarkdownIt from 'markdown-it';

class MdRenderer {
    constructor() {
        this.md = new MarkdownIt();
        let defaultRender =
            this.md.renderer.rules.link_open ||
            function(tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options);
            };
        this.md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
            // If you are sure other plugins can't add `target` - drop check below
            var aIndex = tokens[idx].attrIndex('target');

            if (aIndex < 0) {
                tokens[idx].attrPush(['target', '_blank']); // add new attribute
            } else {
                tokens[idx].attrs[aIndex][1] = '_blank'; // replace value of existing attr
            }
            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        };
    }

    render(text) {
        return this.md.render(text);
    }
}

let instance = new MdRenderer();
export default instance;
