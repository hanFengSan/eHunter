/**
 * AlbumService Contract
 * 
 * This interface defines the contract that all platform-specific album service
 * implementations must follow. It provides a unified API for accessing album
 * metadata, thumbnails, and full-size images across different manga platforms.
 * 
 * Implementation Requirements:
 * - Must implement all methods defined in this interface
 * - Must call init() before any other methods
 * - Must handle errors gracefully and return Error objects where specified
 * - Must support platform-specific capabilities (original images, source switching)
 * - Must provide accurate metadata (title, page count, current page)
 * 
 * Platform Implementations:
 * - EH: src/platform/eh/service/AlbumServiceImpl.ts
 * - NH: src/platform/nh/service/AlbumServiceImpl.ts
 * - Test: src/platform/test/AlbumService.ts
 */

import type { ImgPageInfo, ThumbInfo, PreviewThumbnailStyle, ImgSrcMode } from '../../../core/model/model'

export const NameAlbumService = 'album_service'

export interface AlbumService {
    /**
     * Capability: Original Image Support
     * 
     * Returns whether this platform supports loading original high-quality images.
     * 
     * @returns true if platform supports original images, false otherwise
     * 
     * Example:
     * - EH: true (supports original image loading)
     * - NH: false (no original image support)
     */
    isSupportOriginImg(): boolean

    /**
     * Capability: Source Switching Support
     * 
     * Returns whether this platform supports switching to alternative image sources.
     * 
     * @returns true if platform supports source switching, false otherwise
     * 
     * Example:
     * - EH: true (can switch between different CDN sources)
     * - NH: false (single source only)
     */
    isSupportImgChangeSource(): boolean

    /**
     * Capability: Thumbnail View Support
     * 
     * Returns whether this platform supports thumbnail preview navigation.
     * 
     * @returns true if platform supports thumbnails, false otherwise
     * 
     * Example:
     * - EH: true (provides thumbnail sprites)
     * - NH: true (provides individual thumbnails)
     */
    isSupportThumbView(): boolean

    /**
     * Metadata: Album Title
     * 
     * Returns the title of the current album/gallery.
     * 
     * @returns Album title string
     * @throws Error if called before init() completes
     * 
     * Example: "Sample Gallery [English]"
     */
    getTitle(): string

    /**
     * Metadata: Album ID
     * 
     * Returns the platform-specific identifier for this album.
     * 
     * @returns Album ID string
     * @throws Error if called before init() completes
     * 
     * Example:
     * - EH: "1234567/abcdef1234"
     * - NH: "631366"
     */
    getAlbumId(): string

    /**
     * Metadata: Page Count
     * 
     * Returns the total number of pages in this album.
     * 
     * @returns Total page count (>= 1)
     * @throws Error if called before init() completes
     * 
     * Example: 64
     */
    getPageCount(): number

    /**
     * Metadata: Current Page Index
     * 
     * Returns the current page index (0-based).
     * 
     * @returns Current page index in range [0, getPageCount()-1]
     * @throws Error if called before init() completes
     * 
     * Example: 0 (first page)
     */
    getCurPageIndex(): number

    /**
     * Initialization
     * 
     * Initializes the album service by parsing DOM, fetching metadata, and
     * preparing thumbnail/image information. Must be called before any other
     * methods.
     * 
     * @returns Promise that resolves to void on success, or Error on failure
     * @timeout 60 seconds (per FR-020)
     * 
     * Error Conditions:
     * - DOM parsing failure (missing required elements)
     * - Network timeout (>60s)
     * - Invalid album data (malformed HTML, missing metadata)
     * 
     * Example:
     * ```typescript
     * const service = new EHAlbumServiceImpl();
     * const result = await service.init();
     * if (result instanceof Error) {
     *   console.error('Initialization failed:', result);
     * }
     * ```
     */
    init(): Promise<Error | void>

    /**
     * Thumbnails: Get Thumbnail Information
     * 
     * Returns an array of thumbnail information for all pages in the album.
     * 
     * @param isDisableCache - Whether to bypass cache and fetch fresh data
     * @returns Array of ThumbInfo objects (one per page)
     * @throws Error if called before init() completes
     * 
     * Example:
     * ```typescript
     * const thumbs = service.getThumbInfos(false);
     * // thumbs[0] = { index: 0, url: "...", width: 100, height: 150, ... }
     * ```
     */
    getThumbInfos(isDisableCache: boolean): Array<ThumbInfo>

    /**
     * Images: Get Image Page Information
     * 
     * Returns an array of image page information for all pages in the album.
     * This provides placeholder data (estimated aspect ratios) before images load.
     * 
     * @returns Array of ImgPageInfo objects (one per page)
     * @throws Error if called before init() completes
     * 
     * Example:
     * ```typescript
     * const pages = service.getImgPageInfos();
     * // pages[0] = { index: 0, url: "...", width: 800, height: 1200, heightOfWidth: 1.5, ... }
     * ```
     */
    getImgPageInfos(): Array<ImgPageInfo>

    /**
     * Images: Get Image Source URL
     * 
     * Fetches the full-size image URL for a specific page with the specified loading mode.
     * This is an async operation that may involve network requests.
     * 
     * @param index - Page index (0-based, must be in range [0, getPageCount()-1])
     * @param mode - Image loading mode (DEFAULT, CHANGE_SOURCE, ORIGIN)
     * @returns Promise that resolves to ImgPageInfo on success, or Error on failure
     * 
     * Error Conditions:
     * - Invalid index (out of range)
     * - Network failure (timeout, 404, etc.)
     * - Unsupported mode (e.g., ORIGIN when isSupportOriginImg() is false)
     * 
     * Example:
     * ```typescript
     * const result = await service.getImgSrc(0, ImgSrcMode.DEFAULT);
     * if (result instanceof Error) {
     *   console.error('Failed to load image:', result);
     * } else {
     *   console.log('Image URL:', result.url);
     * }
     * ```
     */
    getImgSrc(index: number, mode: ImgSrcMode): Promise<ImgPageInfo | Error>

    /**
     * UI: Get Preview Thumbnail Style
     * 
     * Returns CSS style object for rendering a thumbnail preview at the specified index.
     * Handles sprite sheet positioning for platforms that use sprite-based thumbnails.
     * 
     * @param index - Page index (0-based, must be in range [0, getPageCount()-1])
     * @returns PreviewThumbnailStyle object with CSS properties
     * @throws Error if called before init() completes or index out of range
     * 
     * Example:
     * ```typescript
     * const style = service.getPreviewThumbnailStyle(0);
     * // style = {
     * //   backgroundImage: "url(...)",
     * //   backgroundPosition: "-100px -200px",
     * //   width: "100px",
     * //   height: "150px"
     * // }
     * ```
     */
    getPreviewThumbnailStyle(index: number): PreviewThumbnailStyle
}
