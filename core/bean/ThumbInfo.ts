export enum ThumbMode {
    SPIRIT = 0,
    IMG
}

export interface ThumbInfo {
    id: string | number,
    src: string;
    mode: ThumbMode,
    offset?: number,
    style: string,
    height: number,
    width: number,
}