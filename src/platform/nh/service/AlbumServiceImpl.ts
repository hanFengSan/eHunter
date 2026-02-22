/**
 * NH Album Service Implementation
 *
 * Ported from legacy NH service behavior and adapted to the current
 * AlbumService interface.
 */

import type { AlbumService } from '../../../../core/service/AlbumService'
import type { ImgPageInfo, ThumbInfo, PreviewThumbnailStyle, ImgSrcMode } from '../../../../core/model/model'
import { ImgHtmlParser } from '../parser/ImgHtmlParser'
import { IntroHtmlParser } from '../parser/IntroHtmlParser'
import { TextReq } from '../../base/request/TextReq'

export class NHAlbumServiceImpl implements AlbumService {
  private imgHtmlParser: ImgHtmlParser
  private thumbInfos: Array<ThumbInfo> = []
  private imgPageInfos: Array<ImgPageInfo> = []
  private pageCount: number = 0
  private introUrl: string = ''
  private albumId: string = ''
  private curPageIndex: number = 0
  private title: string = ''

  constructor() {
    const htmlText = document.documentElement.outerHTML
    this.imgHtmlParser = new ImgHtmlParser(htmlText)
  }

  isSupportOriginImg(): boolean {
    return false
  }

  isSupportImgChangeSource(): boolean {
    return false
  }

  isSupportThumbView(): boolean {
    return true
  }

  getTitle(): string {
    return this.title
  }

  getAlbumId(): string {
    return this.albumId
  }

  getIntroUrl(): string {
    return this.introUrl
  }

  getPageCount(): number {
    return this.pageCount
  }

  getCurPageIndex(): number {
    return this.curPageIndex
  }

  async init(): Promise<Error | void> {
    try {
      this.pageCount = this.imgHtmlParser.getPageCount()
      this.albumId = this.imgHtmlParser.getAlbumId()
      this.introUrl = this.imgHtmlParser.getIntroUrl()
      this.curPageIndex = this.imgHtmlParser.getCurPageNum() - 1

      const introHtml = await new TextReq(this.introUrl).request()
      const introParser = new IntroHtmlParser(introHtml)

      this.title = introParser.getTitle()
      this.imgPageInfos = introParser.getImgPageInfos()
      this.thumbInfos = introParser.getThumbInfos()
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error))
    }
  }

  getThumbInfos(isDisableCache: boolean): Array<ThumbInfo> {
    return this.thumbInfos
  }

  getImgPageInfos(): Array<ImgPageInfo> {
    return this.imgPageInfos
  }

  async getImgSrc(index: number, mode: ImgSrcMode): Promise<ImgPageInfo | Error> {
    try {
      const imgPageInfo = this.imgPageInfos[index]
      if (!imgPageInfo) {
        return new Error(`Image page info not found for index ${index}`)
      }

      if (imgPageInfo.src) {
        return { ...imgPageInfo }
      }

      const req = new TextReq(imgPageInfo.pageUrl)
      req.setTimeOutTime(5)

      const htmlText = await req.request()
      const parser = new ImgHtmlParser(htmlText)

      const imgUrl = parser.getImgUrl()
      const imgHeight = parser.getImgHeight()
      const imgWidth = parser.getImgWidth()

      this.imgPageInfos[index].src = imgUrl
      if (imgHeight > 0 && imgWidth > 0) {
        this.imgPageInfos[index].preciseHeightOfWidth = imgHeight / imgWidth
      }

      return { ...this.imgPageInfos[index] }
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error))
    }
  }

  getPreviewThumbnailStyle(index: number): PreviewThumbnailStyle {
    const thumbInfo = this.thumbInfos[index]

    return {
      'background-image': thumbInfo?.src ? `url(${thumbInfo.src})` : '',
      'background-position': '0% 0%',
      'background-size': 'cover'
    }
  }
}
