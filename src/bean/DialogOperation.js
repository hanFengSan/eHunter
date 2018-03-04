export default class DialogOperation {
    constructor(name, type, onClick) {
        this.init(name, type, onClick);
    }

    init(name, type, onClick) {
        this.name = name;
        this.type = type;
        this.onClick = onClick;
    }
}
