/**
 * Platform Detector
 * 
 * Detects the current platform based on browser URL (host + pathname).
 * Returns null if no platform is detected (non-album pages).
 */

import { Platform, type PlatformDetectionResult } from './types'

/**
 * Detect platform based on current browser URL
 * 
 * @returns PlatformDetectionResult with detected platform or null
 * 
 * URL Patterns:
 * - EH: e-hentai.org/s/* or exhentai.org/s/* (image pages only)
 * - NH: nhentai.net/g/[id]/[page]/
 * - Test: localhost or IP addresses (127.0.0.1, 192.168.x.x, etc.)
 */
export function detectPlatform(): PlatformDetectionResult {
  const host = window.location.host
  const hostname = window.location.hostname
  const pathname = window.location.pathname

  // EH platform: e-hentai.org or exhentai.org with /s/* paths (image pages only)
  // Gallery list pages (/g/*) are NOT supported
  if ((hostname === 'e-hentai.org' || hostname === 'exhentai.org') && pathname.startsWith('/s/')) {
    return {
      platform: Platform.EH,
      host,
      pathname,
      isAlbumPage: true
    }
  }

  // NH platform: nhentai.net with /g/[id]/[page]/ pattern
  if (hostname === 'nhentai.net' && /^\/g\/\d+\/\d+\/$/.test(pathname)) {
    return {
      platform: Platform.NH,
      host,
      pathname,
      isAlbumPage: true
    }
  }

  // Test platform: localhost or IP addresses
  if (hostname === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    return {
      platform: Platform.TEST,
      host,
      pathname,
      isAlbumPage: true
    }
  }

  // No platform detected (non-album page or unsupported domain)
  return {
    platform: null,
    host,
    pathname,
    isAlbumPage: false
  }
}
