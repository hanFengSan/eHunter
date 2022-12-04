import type { ImgPageInfo, ThumbInfo, PreviewThumbnailStyle, ImgSrcMode } from "core/model/model";
import type { AlbumService } from "core/service/AlbumService"
import Util from '../../../core/utils/Utils'

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
    constructor(imgHtml: string) {
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
    getPageCount(): number {
        return 64
    }
    getCurPageIndex(): number {
        return 0
    }

    async init(): Promise<Error | void> {
        return
    }

    getThumbInfos(isDisableCache: boolean): Array<ThumbInfo> {
        return mockThumbInfos
    }

    getImgPageInfos(): Array<ImgPageInfo> {
        return mockImgPageInfos
    }

    async getImgSrc(index: number, mode: ImgSrcMode): Promise<ImgPageInfo | Error> {
        // await Util.timeout(3000)
        mockImgPageInfos[index].src = mockImgPageInfos[index].pageUrl
        return mockImgPageInfos[index]
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
