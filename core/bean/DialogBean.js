import DialogOperation from './DialogOperation'

export default class DialogBean {
    constructor(type, title, text, ...operations) {
        this.id = new Date().getTime();
        this.type = type;
        this.title = title;
        this.text = text;
        operations.forEach(i => {
            if (!(i instanceof DialogOperation)) {
                throw new Error('Operation is not instance of DialogOperation');
            }
        });
        this.operations = operations;
    }
}
