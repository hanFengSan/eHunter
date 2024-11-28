import { ImgPageInfo } from "../bean/ImgPageInfo";
import { ThumbInfo } from "../bean/ThumbInfo";

export interface PreviewThumbnailStyle {
    'background-image': string;
    'background-position': string;
    'background-size': string;
}

export interface IndexInfo {
    val: number;
    updater: string;
}

export abstract class AlbumService {
    abstract getPageCount(): Promise<number>;
    abstract getCurPageNum(): Promise<number>;
    abstract getTitle(): Promise<string>;
    abstract getImgPageInfos(): Promise<Array<ImgPageInfo>>;
    abstract getImgPageInfo(index: number): Promise<ImgPageInfo>;
    abstract getImgSrc(index: number, mode): Promise<ImgPageInfo | Error>;
    abstract getNewImgSrc(index: number, mode): Promise<ImgPageInfo | Error>;
    abstract getThumbInfos(noCache?: boolean): Promise<Array<ThumbInfo>>;
    abstract getThumbInfo(index: number): Promise<ThumbInfo>;
    abstract getAlbumId(): Promise<string>;
    abstract getPreviewThumbnailStyle(index: number, imgPageInfo: ImgPageInfo, thumbInfo: ThumbInfo, width: number, height: number): Promise<PreviewThumbnailStyle> | Promise<string>;
    abstract supportOriginImg(): boolean;
    abstract supportImgChangeSource(): boolean;
    abstract supportThumbView(): boolean;

    getBookScreenCount(pageCount: number, screenSize: number): number {
        // 2 is start page and end page
        return Math.ceil((pageCount + 2) / screenSize);
    }

    getRealCurIndexInfo(pageCount: number, curIndex: IndexInfo): IndexInfo {
        let index = curIndex.val;
        index = index >= pageCount ? pageCount - 1 : index;
        return { val: index, updater: curIndex.updater };
    }
}
