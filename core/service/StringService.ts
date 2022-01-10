import string from '../assets/value/String'
import instruction from '../assets/value/instruction'
import bookInstruction from '../assets/value/bookInstruction'
import version from '../assets/value/version'

class StringService {
    cn = {};
    en = {};
    jp = {};

    constructor() {
        this.initString();
    }

    initString() {
        for (let key in string) {
            this.cn[key] = string[key].cn;
            this.en[key] = string[key].en;
            this.jp[key] = string[key].jp;
        }
        this.cn['p_instruction'] = instruction.cn;
        this.en['p_instruction'] = instruction.en;
        this.jp['p_instruction'] = instruction.jp;
        this.cn['p_bookInstruction'] = bookInstruction.cn;
        this.en['p_bookInstruction'] = bookInstruction.en;
        this.jp['p_bookInstruction'] = bookInstruction.jp;
        this.cn['p_version'] = version.cn;
        this.en['p_version'] = version.en;
        this.jp['p_version'] = version.jp;
    }
}

let instance = new StringService();
export default instance;
