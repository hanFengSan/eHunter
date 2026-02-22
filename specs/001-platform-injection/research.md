# Research: Platform-Based Injection System

**Feature**: 001-platform-injection  
**Date**: 2026-02-21  
**Phase**: 0 (Outline & Research)

## Research Questions

### 1. URL Pattern Detection Strategy

**Question**: What is the most reliable way to detect album pages across EH and NH platforms given their different URL structures?

**Decision**: Use combined host + pathname regex matching with early return pattern

**Rationale**:
- EH uses two URL patterns: `/g/[gallery-id]` (gallery view) and `/s/[page-id]` (single page view)
- NH uses pattern: `/g/[gallery-id]/[page-number]/`
- Localhost/IP detection needs to handle various formats (localhost, 127.0.0.1, 192.168.x.x, etc.)
- Early return pattern (check and return immediately) is more performant than switch/case for URL matching
- Regex provides flexibility for future URL pattern changes

**Alternatives considered**:
- **Switch/case on hostname only**: Rejected because it doesn't handle non-album pages (homepage, search)
- **Full URL parsing with URL API**: Rejected as overkill; simple regex is sufficient and faster
- **Pathname-only matching**: Rejected because it doesn't distinguish between platforms

**Implementation approach**:
```typescript
function detectPlatform(url: string): Platform | null {
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
  
  // Test platform (localhost or IP)
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
    return Platform.TEST;
  }
  
  return null; // No platform detected
}
```

---

### 2. Vue 3 Dependency Injection Pattern

**Question**: How should platform-specific services be provided to Vue components using Vue 3's provide/inject API?

**Decision**: Use `provide()` at app level with symbol-based injection keys

**Rationale**:
- Vue 3's `provide/inject` is the recommended pattern for dependency injection
- Symbol-based keys (e.g., `NameAlbumService`) prevent naming collisions
- App-level provide ensures service is available to all components
- Type-safe with TypeScript when using `InjectionKey<T>`
- Matches existing test platform implementation pattern

**Alternatives considered**:
- **Props drilling**: Rejected due to deep component hierarchy and maintenance burden
- **Vuex/Pinia store**: Rejected as overkill for simple service injection
- **Global singleton**: Rejected because it prevents multi-instance scenarios and testing

**Implementation approach**:
```typescript
// main.ts
import { createApp } from 'vue';
import TestApp from '../core/TestApp.vue';
import { NameAlbumService } from '../core/service/AlbumService';
import type { AlbumService } from '../core/service/AlbumService';

const platform = detectPlatform(window.location.href);

if (platform) {
  const app = createApp(TestApp);
  const albumService: AlbumService = createPlatformService(platform);
  app.provide(NameAlbumService, albumService);
  app.mount('#ehunter-app');
}
```

---

### 3. Parser Rewrite Strategy

**Question**: What is the best approach to rewrite EH/NH parsers from scratch while ensuring correctness?

**Decision**: Test-driven migration with side-by-side comparison

**Rationale**:
- Parsers are critical path; errors break the entire reader
- Side-by-side comparison allows validation against old implementation
- Test-driven approach: capture expected outputs from old parsers, verify new parsers match
- Incremental migration reduces risk (one parser at a time)
- Manual browser testing required per Constitution Principle III

**Alternatives considered**:
- **Big bang rewrite**: Rejected due to high risk of breaking changes
- **Adapter pattern wrapping old parsers**: Rejected per clarification (rewrite from scratch required)
- **Automated unit tests**: Rejected because DOM parsing requires real browser environment

**Implementation approach**:
1. For each parser (ImgHtmlParser, IntroHtmlParser, ImgUrlListParser):
   - Document expected inputs/outputs from old implementation
   - Write new parser implementing AlbumService interface
   - Test on real EH/NH pages using `chrome-devtools-mcp`
   - Compare outputs with old implementation
   - Verify edge cases (missing elements, malformed HTML, network errors)

---

### 4. Error Handling and Loading States

**Question**: How should loading animation and error display be implemented to match old version behavior?

**Decision**: Use Vue component-based loading/error states with slot-based composition

**Rationale**:
- Old version shows loading animation during init, error message on failure
- Vue components provide reactive state management
- Slot-based composition allows platform-specific error details
- Persistent error display (not auto-dismiss) per clarification
- Close button in top-right corner per clarification

**Alternatives considered**:
- **DOM manipulation**: Rejected because it bypasses Vue's reactivity
- **Toast notifications**: Rejected because errors must persist until dismissed
- **Modal dialogs**: Rejected because they block interaction with host page

**Implementation approach**:
```vue
<!-- LoadingErrorWrapper.vue -->
<template>
  <div v-if="isLoading" class="ehunter-loading">
    <LoadingAnimation />
  </div>
  <div v-else-if="error" class="ehunter-error">
    <div class="error-header">
      <h3>Initialization Error</h3>
      <button @click="onClose" class="close-button">×</button>
    </div>
    <p class="error-message">{{ error.message }}</p>
    <details class="error-details">
      <summary>Technical Details</summary>
      <pre>{{ error.stack }}</pre>
      <p>Platform: {{ error.platform }}</p>
      <p>URL: {{ error.url }}</p>
    </details>
  </div>
  <slot v-else />
</template>
```

---

### 5. Initialization Timeout Implementation

**Question**: How should the 60-second initialization timeout be implemented without blocking the main thread?

**Decision**: Use Promise.race() with setTimeout wrapper

**Rationale**:
- `Promise.race()` allows racing initialization against timeout
- Non-blocking: doesn't freeze UI during initialization
- Clean error handling: timeout rejection can be caught and displayed
- Matches async/await patterns used in AlbumService interface

**Alternatives considered**:
- **setInterval polling**: Rejected due to unnecessary overhead and complexity
- **AbortController**: Rejected because it requires modifying all async operations
- **Worker threads**: Rejected as overkill for simple timeout

**Implementation approach**:
```typescript
async function initializeWithTimeout(
  service: AlbumService, 
  timeoutMs: number = 60000
): Promise<void> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Initialization timeout')), timeoutMs);
  });
  
  try {
    await Promise.race([service.init(), timeoutPromise]);
  } catch (error) {
    console.error('Platform initialization failed:', error);
    throw error;
  }
}
```

---

### 6. Platform Service Factory Pattern

**Question**: How should platform-specific AlbumService instances be created in a maintainable way?

**Decision**: Use factory function with platform enum

**Rationale**:
- Factory pattern centralizes service creation logic
- Enum-based dispatch is type-safe and exhaustive (TypeScript checks all cases)
- Easy to extend for new platforms (add enum value + factory case)
- Matches "clean abstraction" goal from User Story 3

**Alternatives considered**:
- **Class-based factory**: Rejected as unnecessary complexity
- **Dynamic import()**: Rejected because it adds async complexity to already-async init
- **Registry pattern**: Rejected as overkill for 3 platforms

**Implementation approach**:
```typescript
enum Platform {
  EH = 'eh',
  NH = 'nh',
  TEST = 'test'
}

function createPlatformService(platform: Platform): AlbumService {
  switch (platform) {
    case Platform.EH:
      return new EHAlbumService();
    case Platform.NH:
      return new NHAlbumService();
    case Platform.TEST:
      return new TestAlbumService('');
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
```

---

### 7. Shared Utilities Reuse Strategy

**Question**: How should existing shared utilities (TextReq, ReqQueue, MultiAsyncReq, PlatformService) be integrated into new parsers?

**Decision**: Import and use directly; document dependencies in parser files

**Rationale**:
- Existing utilities are stable and tested (per assumptions)
- Direct import is simplest and most maintainable
- No need for wrapper/adapter since utilities already match new architecture
- Documentation ensures future maintainers understand dependencies

**Alternatives considered**:
- **Dependency injection for utilities**: Rejected as overkill; utilities are stateless/singleton
- **Rewrite utilities**: Rejected because they're already working and tested
- **Facade pattern**: Rejected as unnecessary abstraction layer

**Implementation approach**:
```typescript
// EHAlbumService.ts
import { TextReq } from '../../base/request/TextReq';
import { ReqQueue } from '../../base/request/ReqQueue';
import { PlatformService } from '../../base/service/PlatformService';

export class EHAlbumService implements AlbumService {
  private textReq = new TextReq();
  private reqQueue = new ReqQueue();
  
  async init(): Promise<void | Error> {
    // Use shared utilities
    const html = await this.textReq.request(url);
    // ...
  }
}
```

---

## Best Practices Summary

### TypeScript Best Practices
- Use strict null checks for error handling
- Prefer `interface` over `type` for service contracts (allows extension)
- Use `readonly` for immutable properties
- Leverage discriminated unions for error types

### Vue 3 Best Practices
- Use Composition API (`<script setup>`) for new components
- Prefer `provide/inject` over props for cross-cutting concerns
- Use `ref()` for primitive reactive state, `reactive()` for objects
- Implement proper cleanup in `onUnmounted()` hooks

### Error Handling Best Practices
- Always log errors to console with full context (stack, platform, URL)
- Provide user-friendly messages separate from technical details
- Never throw uncaught errors that could break host page
- Use try/catch around all async operations

### Performance Best Practices
- Minimize DOM queries; cache selectors where possible
- Use `requestAnimationFrame` for UI updates during initialization
- Avoid blocking main thread; use async/await for I/O
- Lazy-load platform services (only create when needed)

---

## Technology Decisions

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| TypeScript | 5.9 | Type safety | Already in use; prevents runtime errors |
| Vue | 3.5.28 | UI framework | Already in use; reactive state management |
| Vite | 6.4.1 | Build tool | Already in use; fast HMR for development |
| vite-svg-loader | 5.1.0 | SVG imports | Already in use; needed for icons |

**No new dependencies required** - all necessary tools already present in project.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Parser rewrite introduces bugs | High | High | Side-by-side testing, manual verification on real pages |
| Initialization timeout too short | Medium | Medium | Make timeout configurable, monitor real-world performance |
| URL pattern changes break detection | Low | High | Document patterns, add tests for edge cases |
| Legacy code dependencies discovered | Medium | Medium | Incremental migration, fallback to old implementation if needed |
| Performance regression | Low | Medium | Profile before/after, ensure <100ms detection goal |

---

## Open Questions

None - all clarifications resolved in spec clarification session.
