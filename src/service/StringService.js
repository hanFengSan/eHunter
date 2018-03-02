import string from '../assets/value/String'

class StringService {
    constructor() {
        this.initString();
    }

    initString() {
        this.cn = {};
        this.en = {};
        this.jp = {};
        for (let key in string) {
            this.cn[key] = string[key].cn;
            this.en[key] = string[key].en;
            this.jp[key] = string[key].jp;
        }
    }
}

let instance = new StringService();
export default instance;
