/**
 * EH Album Service Implementation
 * 
 * Full implementation for E-Hentai/ExHentai platform
 * No caching - real-time parsing on each request
 */

import type { AlbumService } from '../../../../core/service/AlbumService'
import type { ImgPageInfo, ThumbInfo, PreviewThumbnailStyle } from '../../../../core/model/model'
import { ThumbMode, ImgSrcMode } from '../../../../core/model/model'
import { ImgHtmlParser } from '../parser/ImgHtmlParser'
import { IntroHtmlParser } from '../parser/IntroHtmlParser'
import { ImgUrlListParser } from '../parser/ImgUrlListParser'
import { TextReq } from '../../base/request/TextReq'

export class EHAlbumServiceImpl implements AlbumService {
  private imgHtmlParser: ImgHtmlParser
  private thumbInfos: Array<ThumbInfo> = []
  private imgPageInfos: Array<ImgPageInfo> = []
  private pageCount: number = 0
  private introUrl: string = ''
  private albumId: string = ''
  private curPageIndex: number = 0
  private title: string = ''
  private isInitialized: boolean = false

  constructor() {
    // Parse current image page HTML
    const htmlText = document.documentElement.outerHTML
    this.imgHtmlParser = new ImgHtmlParser(htmlText)
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
    return this.title
  }

  getAlbumId(): string {
    return this.albumId
  }

  getPageCount(): number {
    return this.pageCount
  }

  getCurPageIndex(): number {
    return this.curPageIndex
  }

  async init(): Promise<Error | void> {
    try {
      // Parse basic info from current image page
      this.title = this.imgHtmlParser.getTitle()
      this.pageCount = this.imgHtmlParser.getPageCount()
      this.albumId = this.imgHtmlParser.getAlbumId()
      this.introUrl = this.imgHtmlParser.getIntroUrl()
      this.curPageIndex = this.imgHtmlParser.getCurPageNum() - 1 // Convert to 0-based index

      // Parse thumbnail and image page info from intro pages
      const imgUrlListParser = new ImgUrlListParser(this.introUrl, this.pageCount)
      this.imgPageInfos = await imgUrlListParser.request()

      // Generate thumbnail info from imgPageInfos
      this.thumbInfos = this.imgPageInfos.map((imgPageInfo, index) => {
        // If thumbStyle exists, use it (new layout with sprite backgrounds)
        if (imgPageInfo.thumbStyle) {
          // Extract src URL and offset from thumbStyle
          // Format: "background:transparent url(https://...) -0px 0 no-repeat"
          const urlMatch = imgPageInfo.thumbStyle.match(/url\(([^)]+)\)/)
          const offsetMatch = imgPageInfo.thumbStyle.match(/-(\d+)px/)
          
          const src = urlMatch ? urlMatch[1] : ''
          const offset = offsetMatch ? parseInt(offsetMatch[1], 10) : 0
          
          return {
            id: imgPageInfo.id,
            src: src,
            mode: ThumbMode.SPIRIT,
            style: imgPageInfo.thumbStyle,
            height: imgPageInfo.thumbHeight || 0,
            width: imgPageInfo.thumbWidth || 0,
            offset: offset
          }
        } else {
          // Old layout or fallback
          return {
            id: imgPageInfo.id,
            src: '',
            mode: ThumbMode.IMG,
            height: imgPageInfo.thumbHeight || 0,
            width: imgPageInfo.thumbWidth || 0
          }
        }
      })

      this.isInitialized = true
      console.log('EH Platform initialized successfully', {
        title: this.title,
        pageCount: this.pageCount,
        albumId: this.albumId,
        curPageIndex: this.curPageIndex,
        thumbCount: this.thumbInfos.length,
        imgPageCount: this.imgPageInfos.length
      })
    } catch (error) {
      console.error('EH Platform initialization failed:', error)
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

      // If image source already loaded, return it
      if (imgPageInfo.src) {
        return imgPageInfo
      }

      // Fetch and parse the image page
      const req = new TextReq(imgPageInfo.pageUrl)
      const htmlText = await req.request()
      const parser = new ImgHtmlParser(htmlText)

      // Get image URL based on mode
      switch (mode) {
        case ImgSrcMode.Origin:
          try {
            imgPageInfo.src = parser.getOriginalImgUrl()
          } catch (e) {
            return new Error('Original image not available')
          }
          break
        
        case ImgSrcMode.ChangeSource:
          // TODO: Implement source change logic
          return new Error('Change source not yet implemented')
        
        default:
          imgPageInfo.src = parser.getImgUrl()
      }

      // Update precise aspect ratio
      imgPageInfo.preciseHeightOfWidth = parser.getPreciseHeightOfWidth()

      return imgPageInfo
    } catch (error) {
      console.error('Failed to get image source:', error)
      return error instanceof Error ? error : new Error(String(error))
    }
  }

  getPreviewThumbnailStyle(index: number): PreviewThumbnailStyle {
    const thumbInfo = this.thumbInfos[index]
    if (!thumbInfo || !thumbInfo.style) {
      return {
        'background-image': '',
        'background-position': '',
        'background-size': ''
      }
    }

    // Parse the style string from IntroHtmlParser
    // Format: "background:transparent url(...) -0px 0 no-repeat"
    const styleObj: PreviewThumbnailStyle = {
      'background-image': '',
      'background-position': '',
      'background-size': ''
    }

    // Extract background URL and position
    const bgMatch = thumbInfo.style.match(/url\(([^)]+)\)\s*([-0-9px\s]+)/)
    if (bgMatch) {
      styleObj['background-image'] = `url(${bgMatch[1]})`
      styleObj['background-position'] = bgMatch[2].trim()
    }

    return styleObj
  }

  // Helper methods
  getIntroUrl(): string {
    return this.introUrl
  }

  setIntroUrl(url: string): void {
    this.introUrl = url
  }
}
