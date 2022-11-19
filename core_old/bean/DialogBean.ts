import { DialogOperation } from './DialogOperation'

export default class DialogBean {
    readonly id: number;
    type: string;
    title: string;
    text: string;
    operations: Array<DialogOperation>;
    constructor(type: string, title: string, text: string, ...operations: Array<DialogOperation>) {
        this.id = new Date().getTime();
        this.type = type;
        this.title = title;
        this.text = text;
        this.operations = operations;
    }
}
