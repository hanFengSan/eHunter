export interface ImgPageInfo {
    id: number | string,
    index: number,
    pageUrl: string,
    src: string,
    heightOfWidth: number,
    thumbHeight?: number,
    thumbWidth?: number,
    preciseHeightOfWidth?: number
}

export enum ThumbMode {
    SPIRIT = 0,
    IMG
}

export interface ThumbInfo {
    id: string | number,
    src: string;
    mode: ThumbMode,
    offset?: number;
}

export interface PreviewThumbnailStyle {
    'background-image': string;
    'background-position': string;
    'background-size': string;
}

export enum ImgSrcMode {
    Default = 0,
    Fast = 1,
    Origin = 2,
    ChangeSource = 3
}