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
import type { InitializationStepUpdate } from '../../types'
import {
  NH_INITIALIZATION_STEPS,
  createStepMap,
  createStepUpdate,
  markCurrentPendingStepFailed
} from '../../init-steps'

export class NHAlbumServiceImpl implements AlbumService {
  private imgHtmlParser: ImgHtmlParser
  private thumbInfos: Array<ThumbInfo> = []
  private imgPageInfos: Array<ImgPageInfo> = []
  private pageCount: number = 0
  private introUrl: string = ''
  private albumId: string = ''
  private curPageIndex: number = 0
  private title: string = ''
  private reportInitializationStep: (step: InitializationStepUpdate) => void = () => {}
  private initializationStepStatus: Record<string, InitializationStepUpdate['status']> = {}
  private readonly initializationStepOrder = NH_INITIALIZATION_STEPS.map(step => step.id)
  private readonly initializationStepMap = createStepMap(NH_INITIALIZATION_STEPS)

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

  setInitializationStepReporter(reporter: (step: InitializationStepUpdate) => void): void {
    this.reportInitializationStep = reporter
  }

  private updateInitializationStep(step: InitializationStepUpdate): void {
    this.initializationStepStatus[step.id] = step.status
    this.reportInitializationStep(step)
  }

  private failCurrentInitializationStep(reason: string): void {
    markCurrentPendingStepFailed(
      this.initializationStepOrder,
      this.initializationStepStatus,
      this.initializationStepMap,
      reason,
      step => this.updateInitializationStep(step)
    )
  }

  async init(): Promise<Error | void> {
    this.initializationStepStatus = {}
    NH_INITIALIZATION_STEPS.forEach(step => {
      this.updateInitializationStep(createStepUpdate(step, 'pending'))
    })

    try {
      this.pageCount = this.imgHtmlParser.getPageCount()
      this.albumId = this.imgHtmlParser.getAlbumId()
      this.introUrl = this.imgHtmlParser.getIntroUrl()
      this.curPageIndex = this.imgHtmlParser.getCurPageNum() - 1
      this.updateInitializationStep(
        createStepUpdate(
          this.initializationStepMap.parseImagePageMetadata,
          'success',
          `${this.pageCount} pages detected`
        )
      )

      const introHtml = await new TextReq(this.introUrl).request()
      this.updateInitializationStep(
        createStepUpdate(
          this.initializationStepMap.fetchIntroPage,
          'success',
          'Intro page loaded'
        )
      )
      const introParser = new IntroHtmlParser(introHtml)

      this.title = introParser.getTitle()
      if (!this.title || !this.title.trim()) {
        throw new Error('Title is empty')
      }
      this.updateInitializationStep(
        createStepUpdate(
          this.initializationStepMap.extractTitle,
          'success',
          'Title extracted successfully'
        )
      )

      this.imgPageInfos = introParser.getImgPageInfos()
      this.thumbInfos = introParser.getThumbInfos()
      this.updateInitializationStep(
        createStepUpdate(
          this.initializationStepMap.extractImagePagesAndThumbnails,
          'success',
          `${this.imgPageInfos.length} image pages and ${this.thumbInfos.length} thumbnails extracted`
        )
      )
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      this.failCurrentInitializationStep(reason)
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
