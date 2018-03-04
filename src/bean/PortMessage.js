export default class PortMessage {
    constructor(type, data) {
        this.init(type, data);
    }

    init(type, data) {
        this.type = type;
        this.data = data;
    }
}
