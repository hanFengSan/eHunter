import type { ImgPageInfo, ThumbInfo, PreviewThumbnailStyle, ImgSrcMode } from '../model/model'

export const NameAlbumService = 'album_service'

export interface AlbumService {
    isSupportOriginImg(): boolean
    isSupportImgChangeSource(): boolean
    isSupportThumbView(): boolean

    getTitle(): string
    getAlbumId(): string
    getIntroUrl(): string
    getPageCount(): number  
    getCurPageIndex(): number

    init(): Promise<Error | void>

    getThumbInfos(isDisableCache: boolean): Array<ThumbInfo>
    getImgPageInfos(): Array<ImgPageInfo>
    getImgSrc(index: number, mode: ImgSrcMode): Promise<ImgPageInfo | Error>
    
    getPreviewThumbnailStyle(index: number): PreviewThumbnailStyle 
}
