# Data Model: Platform-Based Injection System

**Feature**: 001-platform-injection  
**Date**: 2026-02-21  
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the data structures and relationships for the platform injection system. The system uses interface-based contracts to abstract platform-specific implementations.

## Core Entities

### Platform (Enum)

Represents the detected platform type.

**Fields**:
- `EH`: E-Hentai platform (e-hentai.org, exhentai.org)
- `NH`: NHentai platform (nhentai.net)
- `TEST`: Test platform (localhost, IP addresses)

**Validation Rules**:
- Must be one of the three defined values
- Cannot be null or undefined when platform is detected

**State Transitions**:
- N/A (immutable enum)

---

### PlatformDetectionResult

Represents the result of platform detection.

**Fields**:
- `platform: Platform | null` - Detected platform or null if no match
- `host: string` - Browser hostname
- `pathname: string` - Browser pathname
- `isAlbumPage: boolean` - Whether current page is an album view page

**Validation Rules**:
- `host` must be non-empty string
- `pathname` must start with `/`
- `isAlbumPage` is true only when platform is non-null and URL matches album patterns

**Relationships**:
- Used by `PlatformDetector` to return detection results
- Consumed by `PlatformInitializer` to determine initialization

---

### AlbumService (Interface)

Service contract for platform-specific album operations. Defined in `core/service/AlbumService.ts`.

**Methods**:

**Capability Queries**:
- `isSupportOriginImg(): boolean` - Whether platform supports original image loading
- `isSupportImgChangeSource(): boolean` - Whether platform supports source switching
- `isSupportThumbView(): boolean` - Whether platform supports thumbnail view

**Metadata Accessors**:
- `getTitle(): string` - Album title
- `getAlbumId(): string` - Platform-specific album identifier
- `getPageCount(): number` - Total number of pages
- `getCurPageIndex(): number` - Current page index (0-based)

**Async Operations**:
- `init(): Promise<Error | void>` - Initialize service (parse DOM, fetch metadata)
- `getThumbInfos(isDisableCache: boolean): Array<ThumbInfo>` - Get thumbnail information
- `getImgPageInfos(): Array<ImgPageInfo>` - Get image page information
- `getImgSrc(index: number, mode: ImgSrcMode): Promise<ImgPageInfo | Error>` - Get image source URL

**UI Helpers**:
- `getPreviewThumbnailStyle(index: number): PreviewThumbnailStyle` - Get thumbnail CSS styles

**Validation Rules**:
- `init()` must be called before any other methods
- `getPageCount()` must return value >= 1
- `getCurPageIndex()` must return value in range [0, getPageCount()-1]
- `getImgSrc()` index must be in range [0, getPageCount()-1]

**State Transitions**:
```
[Uninitialized] --init()--> [Initializing] --success--> [Ready]
                                          --failure--> [Error]
```

**Relationships**:
- Implemented by `EHAlbumServiceImpl`, `NHAlbumServiceImpl`, `TestAlbumService`
- Injected into Vue app via `NameAlbumService` symbol
- Consumed by reader components (book mode, scroll mode, thumbnail view)

---

### ThumbInfo

Thumbnail information for a single page.

**Fields**:
- `index: number` - Page index (0-based)
- `url: string` - Thumbnail image URL
- `width: number` - Thumbnail width in pixels
- `height: number` - Thumbnail height in pixels
- `offsetX?: number` - Sprite sheet X offset (optional)
- `offsetY?: number` - Sprite sheet Y offset (optional)

**Validation Rules**:
- `index` must be >= 0
- `url` must be valid HTTP(S) URL
- `width` and `height` must be > 0
- `offsetX` and `offsetY` must be >= 0 if present

**Relationships**:
- Returned by `AlbumService.getThumbInfos()`
- Used by thumbnail navigation component

---

### ImgPageInfo

Full-size image information for a single page.

**Fields**:
- `index: number` - Page index (0-based)
- `url: string` - Full-size image URL
- `width: number` - Image width in pixels
- `height: number` - Image height in pixels
- `heightOfWidth: number` - Aspect ratio (height/width) for placeholder
- `preciseHeightOfWidth?: number` - Precise aspect ratio after image loads (optional)

**Validation Rules**:
- `index` must be >= 0
- `url` must be valid HTTP(S) URL
- `width` and `height` must be > 0
- `heightOfWidth` must be > 0
- `preciseHeightOfWidth` must be > 0 if present

**State Transitions**:
```
[Placeholder] --image loads--> [Precise]
  (uses heightOfWidth)         (uses preciseHeightOfWidth)
```

**Relationships**:
- Returned by `AlbumService.getImgPageInfos()` and `AlbumService.getImgSrc()`
- Used by page rendering components (book mode, scroll mode)

---

### ImgSrcMode (Enum)

Image loading mode for `getImgSrc()` method.

**Fields**:
- `DEFAULT`: Default image source (same origin)
- `CHANGE_SOURCE`: Alternative source (if platform supports)
- `ORIGIN`: Original high-quality image (if platform supports)

**Validation Rules**:
- Must be one of the three defined values
- `CHANGE_SOURCE` only valid if `isSupportImgChangeSource()` returns true
- `ORIGIN` only valid if `isSupportOriginImg()` returns true

**Relationships**:
- Used as parameter to `AlbumService.getImgSrc()`
- Determines image loading strategy

---

### PreviewThumbnailStyle

CSS style object for thumbnail preview positioning.

**Fields**:
- `backgroundImage: string` - CSS background-image property
- `backgroundPosition: string` - CSS background-position property (for sprite sheets)
- `width: string` - CSS width property
- `height: string` - CSS height property

**Validation Rules**:
- All fields must be valid CSS property values
- `backgroundImage` must be `url(...)` format
- `width` and `height` must include units (px, %, etc.)

**Relationships**:
- Returned by `AlbumService.getPreviewThumbnailStyle()`
- Applied to thumbnail DOM elements

---

### InitializationError

Error information for platform initialization failures.

**Fields**:
- `message: string` - User-friendly error description
- `stack: string` - Stack trace for debugging
- `platform: Platform` - Platform that failed to initialize
- `url: string` - URL where error occurred
- `timestamp: number` - Error timestamp (milliseconds since epoch)

**Validation Rules**:
- `message` must be non-empty
- `stack` should include file/line information
- `url` must be valid URL
- `timestamp` must be > 0

**Relationships**:
- Created by `PlatformInitializer` on initialization failure
- Displayed by error UI component
- Logged to browser console

---

## Entity Relationships Diagram

```
┌─────────────────┐
│ PlatformDetector│
└────────┬────────┘
         │ produces
         ▼
┌──────────────────────┐
│PlatformDetectionResult│
└──────────┬───────────┘
           │ consumed by
           ▼
┌────────────────────┐
│PlatformInitializer │
└─────────┬──────────┘
          │ creates
          ▼
┌─────────────────┐      implements      ┌──────────────────────┐
│  AlbumService   │◄─────────────────────│ EHAlbumServiceImpl   │
│   (interface)   │                      │ NHAlbumServiceImpl   │
└────────┬────────┘                      │ TestAlbumService     │
         │                               └──────────────────────┘
         │ provides
         ▼
┌─────────────────┐
│  Vue App        │
│  (TestApp.vue)  │
└─────────┬───────┘
          │ injects
          ▼
┌─────────────────┐
│ Reader Components│
│ (Book/Scroll)   │
└─────────────────┘
```

## Data Flow

### 1. Platform Detection Flow

```
User navigates to page
  ↓
PlatformDetector.detect(window.location)
  ↓
Check host + pathname against patterns
  ↓
Return PlatformDetectionResult
  ↓
If platform detected and isAlbumPage:
  → Proceed to initialization
Else:
  → Do nothing (no initialization)
```

### 2. Platform Initialization Flow

```
PlatformDetectionResult received
  ↓
PlatformInitializer.initialize(platform)
  ↓
Create platform-specific AlbumService
  ↓
Call albumService.init() with 60s timeout
  ↓
Success:
  → Create Vue app
  → app.provide(NameAlbumService, albumService)
  → app.mount('#ehunter-app')
  → Show reader UI
Failure:
  → Create InitializationError
  → Log to console
  → Show error UI with details
```

### 3. Image Loading Flow

```
User views page in reader
  ↓
Component injects AlbumService
  ↓
Call albumService.getImgSrc(index, mode)
  ↓
Platform-specific parser fetches/parses
  ↓
Return ImgPageInfo with URL
  ↓
Component loads image
  ↓
On load success:
  → Update preciseHeightOfWidth
  → Trigger layout adjustment
On load failure:
  → Retry with different mode (if supported)
  → Show error placeholder
```

## Storage Considerations

**No persistent storage in this feature**. All data is ephemeral and exists only during page session:
- Platform detection result: in-memory only
- AlbumService instance: in-memory only
- Parsed metadata: in-memory only (may be cached by platform-specific implementation)

**Note**: Platform-specific implementations (EH/NH) may use localStorage for caching parsed data, but that is outside the scope of this feature.

## Concurrency Considerations

- **Multiple tabs**: Each tab has independent platform detection and initialization
- **Rapid navigation**: Platform detection runs on every page load; previous instance is discarded
- **Async operations**: `init()` and `getImgSrc()` are async; components must handle loading states
- **Timeout handling**: 60-second timeout on `init()` prevents indefinite hangs

## Migration Notes

**Breaking changes from old architecture**:
- Old: `core.launcher` pattern with method chaining
- New: Vue 3 `provide/inject` with interface-based services
- Old: Abstract class `AlbumService`
- New: Interface `AlbumService` (TypeScript interface, not class)
- Old: Direct instantiation in platform index.ts
- New: Factory function returns AlbumService implementation

**Compatibility**:
- Reader components (book mode, scroll mode) already use `inject(NameAlbumService)`
- No changes needed to reader components
- Only platform initialization code needs refactoring
