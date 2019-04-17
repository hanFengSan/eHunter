export default {
    replaceKey(str, options) {
        for (let key in options) {
            let re = new RegExp("\\$\\$" + key + "\\$\\$", "g");
            str = str.replace(re, options[key]);
        }
        return str;
    }
}
