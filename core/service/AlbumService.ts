export interface ImgInfo {
    id: number;
    pageUrl: string;
    src: string;
    heightOfWidth: number;
}

export interface ThumbInfo {
    id: number;
    src: string;
    offset?: number;
}

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
    protected sumOfPage: number | undefined;

    abstract async getPageCount(): Promise<number>;
    abstract async getCurPageNum(): Promise<number>;
    abstract async getTitle(): Promise<string>;
    abstract async getImgInfos(): Promise<Array<ImgInfo>>;
    abstract async getImgInfo(index): Promise<ImgInfo>;
    abstract async getImgSrc(index, mode): Promise<string>;
    abstract async getNewImgSrc(index, mode): Promise<string>;
    abstract async getThumbInfos(noCache?: boolean): Promise<Array<ThumbInfo>>;
    abstract async getThumbInfo(index): Promise<ThumbInfo>;
    abstract async getAlbumId(): Promise<string>;
    abstract async getPreviewThumbnailStyle(index, imgInfo, thumb): Promise<PreviewThumbnailStyle>;
    abstract supportOriginImg(): boolean;
    abstract supportImgChangeSource(): boolean;

    async getBookScreenCount(screenSize: number): Promise<number> {
        // 2 is start page and end page
        return Math.ceil((await this.getPageCount() + 2) / screenSize);
    }

    async getRealCurIndexInfo(curIndex): Promise<IndexInfo> {
        let index = curIndex.val;
        let pageCount = await this.getPageCount();
        index = index > pageCount ? pageCount - 1 : index;
        return { val: index, updater: curIndex.updater };
    }
    getRealCurIndex(index) { }
}
