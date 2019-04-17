import store from '../store/index.inject'

export default class ServerMessage {
    constructor(data) {
        this.init(data);
    }

    init(data) {
        let message;
        switch (store.getters.string.lang) {
            case 'CN':
                message = data.cn;
                break;
            case 'EN':
                message = data.en;
                break;
            case 'JP':
                message = data.jp;
                break;
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
