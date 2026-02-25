import type { ImgPageInfo, ThumbInfo, PreviewThumbnailStyle, ImgSrcMode } from "core/model/model";
import type { AlbumService } from "core/service/AlbumService"
import Util from '../../../core/utils/Utils'
import { isTestEnvironment } from '../../../core/utils/runtimeEnv'

let mockThumbInfos: Array<ThumbInfo> = []
let srcMap: any = { 0: '/2195608-00.jpg', 1: '/2195608-01.jpg', 2: '/2195608-02.jpg', 3: '/2195608-03.jpg' }
for (let i = 0; i < 64; i++) {
    mockThumbInfos.push({
        id: String(i),
        src: srcMap[Math.floor(i / 20)],
        mode: 0,
        offset: (i % 20) * 100
    })
}

let mockImgPageInfos: Array<ImgPageInfo> = []
for (let i = 0; i < 64; i++) {
    mockImgPageInfos.push({
        id: i,
        index: i,
        pageUrl: '/' + (i+1 + "").padStart(2, "0") + ".jpg",
        src: '',
        // src: '/' + (i+1 + "").padStart(2, "0") + ".jpg",
        heightOfWidth: 1.4,
    })
}

export class TestAlbumService implements AlbumService {
    private pageCount: number
    private thumbInfos: Array<ThumbInfo>
    private imgPageInfos: Array<ImgPageInfo>

    constructor(imgHtml: string) {
        const params = new URLSearchParams(window.location.search)
        const requestedPageTotal = Number.parseInt(params.get('pageTotal') || '', 10)
        const hasValidPageTotal = Number.isFinite(requestedPageTotal) && requestedPageTotal > 0
        const defaultPageCount = mockImgPageInfos.length

        this.pageCount = isTestEnvironment() && hasValidPageTotal
            ? requestedPageTotal
            : defaultPageCount

        this.thumbInfos = buildMockThumbInfos(this.pageCount)
        this.imgPageInfos = buildMockImgPageInfos(this.pageCount)
    }

    isSupportOriginImg(): boolean {
        return true
    }
    isSupportImgChangeSource(): boolean {
        return true
    }
    isSupportThumbView(): boolean {
        return true
    }

    getTitle(): string {
        return 'title'
    }
    getAlbumId(): string {
        return 'id'
    }
    getIntroUrl(): string {
        return '/g/id/test/'
    }
    getPageCount(): number {
        return this.pageCount
    }
    getCurPageIndex(): number {
        return 0
    }

    async init(): Promise<Error | void> {
        return
    }

    getThumbInfos(isDisableCache: boolean): Array<ThumbInfo> {
        return this.thumbInfos
    }

    getImgPageInfos(): Array<ImgPageInfo> {
        return this.imgPageInfos
    }

    async getImgSrc(index: number, mode: ImgSrcMode): Promise<ImgPageInfo | Error> {
        // await Util.timeout(30000)
        this.imgPageInfos[index].src = this.imgPageInfos[index].pageUrl
        return this.imgPageInfos[index]
    }

    getPreviewThumbnailStyle(index: number): PreviewThumbnailStyle {
        let imgPageInfo = this.getImgPageInfos()[index]
        let thumbInfo = this.getThumbInfos(false)[index]
        const indexInThumbSprite = index % 20
        const sumOfThumbInSprite = (this.getPageCount() - (index + 1)) >= this.getPageCount() % 20 ?
            20 : (this.getPageCount() % 20)
        let percentage
        if (imgPageInfo.heightOfWidth >= 1.43) {
            percentage = 1 / (sumOfThumbInSprite * (1 - (1 / imgPageInfo.heightOfWidth) * (imgPageInfo.thumbHeight! / (sumOfThumbInSprite * 100))))
        } else {
            percentage = 1 / (sumOfThumbInSprite - 1)
        }
        let offsetPercentage = indexInThumbSprite * percentage
        return {
            'background-image': `url(${thumbInfo.src})`,
            'background-position': `${offsetPercentage * 100}% 0`,
            'background-size': imgPageInfo.heightOfWidth >= 1.43 ? 'cover' : `${sumOfThumbInSprite * 100}%`
        };
    }
}

function buildMockThumbInfos(pageCount: number): Array<ThumbInfo> {
    const result: Array<ThumbInfo> = []
    const baseCount = mockThumbInfos.length
    for (let i = 0; i < pageCount; i++) {
        const source = mockThumbInfos[i % baseCount]
        result.push({
            ...source,
            id: String(i),
        })
    }
    return result
}

function buildMockImgPageInfos(pageCount: number): Array<ImgPageInfo> {
    const result: Array<ImgPageInfo> = []
    const baseCount = mockImgPageInfos.length
    for (let i = 0; i < pageCount; i++) {
        const source = mockImgPageInfos[i % baseCount]
        result.push({
            ...source,
            id: i,
            index: i,
            src: '',
        })
    }
    return result
}
