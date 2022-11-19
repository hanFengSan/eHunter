export interface DOClick { (): void };
export class DialogOperation {
    name: string;
    type: string;
    onClick: DOClick;
    constructor(name: string, type: string, onClick: DOClick) {
        this.name = name;
        this.type = type;
        this.onClick = onClick;
    }
}
