import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import twemoji from 'twemoji';

class MdRenderer {
    constructor() {
        this.md = new MarkdownIt();
        this.md.use(emoji, []);
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
        this.md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
    }

    render(text) {
        return this.md.render(text);
    }
}

let instance = new MdRenderer();
export default instance;
