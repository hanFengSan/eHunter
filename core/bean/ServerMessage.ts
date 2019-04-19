import store from '../store/index'

interface MsgOperation {
    name: string;
    url: string;
}

interface UpdateMsg {
    title: string;
    version: string;
    text: string;
    operations: Array<MsgOperation>;
    time: number;
    always: boolean;
    duration: number;
}

interface I18nUpdateMsg {
    cn: UpdateMsg;
    en: UpdateMsg;
    jp: UpdateMsg;
}

export default class ServerMessage {
    title: string;
    version: string;
    text: string;
    operations: Array<MsgOperation>;
    time: number;
    always: boolean;
    duration: number;

    constructor(data: I18nUpdateMsg) {
        let message;
        switch (store.getters.string.lang) {
            case 'CN':
                message = data.cn;
                break;
            case 'JP':
                message = data.jp;
                break;
            case 'EN':
            default:
                message = data.en;
        }
        this.title = message.title;
        this.version = message.version;
        this.text = message.text;
        this.operations = message.operations;
        this.time = message.time;
        this.always = message.always;
        this.duration = message.duration;
    }
}
