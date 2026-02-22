# Quickstart: Platform-Based Injection System

**Feature**: 001-platform-injection  
**Date**: 2026-02-21  
**For**: Developers implementing or maintaining platform injection

## Overview

This guide provides a quick reference for understanding and working with the platform injection system. The system detects the current platform (EH, NH, or Test) based on the browser URL and initializes the appropriate reader implementation.

## Architecture at a Glance

```
Browser URL → Platform Detection → Platform Initialization → Vue App Mount
                                                            ↓
                                                    AlbumService Injection
                                                            ↓
                                                    Reader Components
```

## Key Files

| File | Purpose |
|------|---------|
| `src/main.ts` | Entry point - platform detection and initialization |
| `core/service/AlbumService.ts` | Service interface contract |
| `src/platform/eh/service/AlbumServiceImpl.ts` | EH platform implementation |
| `src/platform/nh/service/AlbumServiceImpl.ts` | NH platform implementation |
| `src/platform/test/AlbumService.ts` | Test platform (reference implementation) |
| `src/platform/base/` | Shared utilities (request, retry, storage) |

## Platform Detection Logic

### URL Patterns

| Platform | Host | Pathname Pattern | Example |
|----------|------|------------------|---------|
| EH | `e-hentai.org` | `/g/*` or `/s/*` | `e-hentai.org/g/1234567/abcdef/` |
| EH | `exhentai.org` | `/g/*` or `/s/*` | `exhentai.org/s/abcdef1234/1-234567` |
| NH | `nhentai.net` | `/g/[id]/[page]/` | `nhentai.net/g/631366/1/` |
| Test | `localhost` | Any | `localhost:5173` |
| Test | IP address | Any | `127.0.0.1:5173`, `192.168.1.100:8080` |

### Detection Code

```typescript
function detectPlatform(): Platform | null {
  const host = window.location.host;
  const pathname = window.location.pathname;
  
  // EH platform
  if ((host === 'e-hentai.org' || host === 'exhentai.org') && 
      (pathname.startsWith('/g/') || pathname.startsWith('/s/'))) {
    return Platform.EH;
  }
  
  // NH platform
  if (host === 'nhentai.net' && /^\/g\/\d+\/\d+\/$/.test(pathname)) {
    return Platform.NH;
  }
  
  // Test platform
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
    return Platform.TEST;
  }
  
  return null; // No platform detected (don't initialize)
}
```

## Platform Initialization Flow

### 1. Detection Phase (<100ms)

```typescript
const platform = detectPlatform();
if (!platform) {
  // Not an album page - exit silently
  return;
}
```

### 2. Service Creation

```typescript
let albumService: AlbumService;

switch (platform) {
  case Platform.EH:
    albumService = new EHAlbumServiceImpl();
    break;
  case Platform.NH:
    albumService = new NHAlbumServiceImpl();
    break;
  case Platform.TEST:
    albumService = new TestAlbumService('');
    break;
}
```

### 3. Vue App Setup

```typescript
const app = createApp(TestApp);
app.provide(NameAlbumService, albumService);
```

### 4. Initialization with Timeout

```typescript
const initPromise = albumService.init();
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Initialization timeout')), 60000)
);

try {
  await Promise.race([initPromise, timeoutPromise]);
  app.mount('#ehunter-app');
} catch (error) {
  // Show error UI with technical details
  showInitializationError(error);
}
```

## AlbumService Interface

### Capability Queries

```typescript
// Check platform capabilities before using features
if (albumService.isSupportOriginImg()) {
  // Can load original high-quality images
}

if (albumService.isSupportImgChangeSource()) {
  // Can switch to alternative sources
}

if (albumService.isSupportThumbView()) {
  // Can show thumbnail navigation
}
```

### Metadata Access

```typescript
const title = albumService.getTitle();           // "Sample Gallery [English]"
const albumId = albumService.getAlbumId();       // "1234567/abcdef1234"
const pageCount = albumService.getPageCount();   // 64
const currentPage = albumService.getCurPageIndex(); // 0
```

### Thumbnail Loading

```typescript
// Get all thumbnails (cached by default)
const thumbs = albumService.getThumbInfos(false);

// Force refresh from server
const freshThumbs = albumService.getThumbInfos(true);

// Access individual thumbnail
const thumb = thumbs[0];
// { index: 0, url: "...", width: 100, height: 150, offsetX: 0, offsetY: 0 }
```

### Image Loading

```typescript
// Get placeholder image info (synchronous)
const pages = albumService.getImgPageInfos();
const page = pages[0];
// { index: 0, url: "...", width: 800, height: 1200, heightOfWidth: 1.5 }

// Load full-size image (asynchronous)
const result = await albumService.getImgSrc(0, ImgSrcMode.DEFAULT);
if (result instanceof Error) {
  console.error('Failed to load image:', result);
} else {
  // result is ImgPageInfo with precise dimensions
  console.log('Image loaded:', result.url);
}
```

### Image Loading Modes

```typescript
// Default source (same origin)
await albumService.getImgSrc(index, ImgSrcMode.DEFAULT);

// Alternative source (if supported)
if (albumService.isSupportImgChangeSource()) {
  await albumService.getImgSrc(index, ImgSrcMode.CHANGE_SOURCE);
}

// Original high-quality (if supported)
if (albumService.isSupportOriginImg()) {
  await albumService.getImgSrc(index, ImgSrcMode.ORIGIN);
}
```

## Error Handling

### Initialization Errors

```typescript
const result = await albumService.init();
if (result instanceof Error) {
  // Log to console
  console.error('Initialization failed:', {
    message: result.message,
    stack: result.stack,
    platform: platform,
    url: window.location.href
  });
  
  // Show user-facing error
  showError({
    message: 'Failed to initialize eHunter reader',
    details: {
      error: result.message,
      stack: result.stack,
      platform: platform,
      url: window.location.href
    }
  });
}
```

### Image Loading Errors

```typescript
const result = await albumService.getImgSrc(index, mode);
if (result instanceof Error) {
  // Retry with different mode
  if (mode === ImgSrcMode.DEFAULT && albumService.isSupportImgChangeSource()) {
    const retryResult = await albumService.getImgSrc(index, ImgSrcMode.CHANGE_SOURCE);
    if (retryResult instanceof Error) {
      // Show error to user
      showImageLoadError(index, retryResult);
    }
  }
}
```

## Adding a New Platform

### Step 1: Add Platform Enum

```typescript
// src/platform/types.ts
export enum Platform {
  EH = 'eh',
  NH = 'nh',
  TEST = 'test',
  NEW_PLATFORM = 'new_platform' // Add here
}
```

### Step 2: Add Detection Logic

```typescript
// src/main.ts
function detectPlatform(): Platform | null {
  // ... existing detection ...
  
  // New platform
  if (host === 'new-platform.com' && pathname.startsWith('/gallery/')) {
    return Platform.NEW_PLATFORM;
  }
  
  return null;
}
```

### Step 3: Create Platform Directory

```
src/platform/new-platform/
├── index.ts                 # Platform initialization
├── service/
│   └── AlbumServiceImpl.ts  # AlbumService implementation
└── parser/
    ├── GalleryParser.ts     # Gallery metadata parser
    └── ImageParser.ts       # Image URL parser
```

### Step 4: Implement AlbumService

```typescript
// src/platform/new-platform/service/AlbumServiceImpl.ts
import type { AlbumService } from '../../../../core/service/AlbumService';

export class NewPlatformAlbumServiceImpl implements AlbumService {
  // Implement all interface methods
  isSupportOriginImg(): boolean { return false; }
  isSupportImgChangeSource(): boolean { return false; }
  isSupportThumbView(): boolean { return true; }
  
  // ... implement remaining methods ...
}
```

### Step 5: Add to Initialization

```typescript
// src/main.ts
switch (platform) {
  // ... existing cases ...
  case Platform.NEW_PLATFORM:
    albumService = new NewPlatformAlbumServiceImpl();
    break;
}
```

## Testing Checklist

### Manual Testing (Required per Constitution Principle III)

1. **Run development server**:
   ```bash
   npm run dev
   ```

2. **Test each platform** using `chrome-devtools-mcp`:
   - [ ] EH: Navigate to `e-hentai.org/g/[gallery-id]`
   - [ ] EH: Navigate to `exhentai.org/s/[page-id]`
   - [ ] NH: Navigate to `nhentai.net/g/[gallery-id]/1/`
   - [ ] Test: Navigate to `localhost:5173`

3. **Verify loading states**:
   - [ ] Loading animation appears during initialization
   - [ ] Reader UI appears after successful initialization
   - [ ] Error message appears on initialization failure

4. **Verify reader features**:
   - [ ] Book mode works correctly
   - [ ] Scroll mode works correctly
   - [ ] Thumbnail navigation works
   - [ ] Page flipping works
   - [ ] Image loading works (default, change source, original)

5. **Verify error handling**:
   - [ ] Initialization timeout (>60s) shows error
   - [ ] Network errors show appropriate messages
   - [ ] Close button dismisses error UI
   - [ ] Technical details are visible in error message

6. **Verify edge cases**:
   - [ ] Non-album pages don't initialize
   - [ ] Multiple tabs work independently
   - [ ] Switching between EH/exhentai works

## Common Issues

### Issue: Platform not detected

**Symptom**: Reader doesn't initialize on album page

**Solution**: Check URL pattern in `detectPlatform()`. Verify host and pathname match expected patterns.

### Issue: Initialization timeout

**Symptom**: Error message after 60 seconds

**Solution**: Check network requests in DevTools. Verify DOM selectors in parsers match current page structure.

### Issue: Images not loading

**Symptom**: Blank pages or error icons

**Solution**: Check `getImgSrc()` implementation. Verify image URLs are correct and accessible.

### Issue: TypeScript errors

**Symptom**: Build fails with type errors

**Solution**: Ensure AlbumService implementation matches interface exactly. Check import paths.

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Platform detection | <100ms | Time from page load to detection complete |
| Initialization | <60s | Time from init() call to completion |
| Thumbnail loading | <5s | Time to load all thumbnails |
| Image loading | <10s | Time to load single full-size image |

## References

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [AlbumService Contract](./contracts/AlbumService.ts)
- [Research Document](./research.md)
