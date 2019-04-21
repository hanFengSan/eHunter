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
    abstract async getPageCount(): Promise<number>;
    abstract async getCurPageNum(): Promise<number>;
    abstract async getTitle(): Promise<string>;
    abstract async getImgPageInfos(): Promise<Array<ImgPageInfo>>;
    abstract async getImgPageInfo(index: number): Promise<ImgPageInfo>;
    abstract async getImgSrc(index: number, mode): Promise<string>;
    abstract async getNewImgSrc(index: number, mode): Promise<string>;
    abstract async getThumbInfos(noCache?: boolean): Promise<Array<ThumbInfo>>;
    abstract async getThumbInfo(index: number): Promise<ThumbInfo>;
    abstract async getAlbumId(): Promise<string>;
    abstract async getPreviewThumbnailStyle(index: number, imgPageInfo: ImgPageInfo, thumbInfo: ThumbInfo): Promise<PreviewThumbnailStyle>;
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
