/**
 * Platform Types
 * 
 * Type definitions for the platform injection system.
 */

/**
 * Platform enum representing supported manga platforms
 */
export enum Platform {
  /** E-Hentai platform (e-hentai.org, exhentai.org) */
  EH = 'EH',
  /** NHentai platform (nhentai.net) */
  NH = 'NH',
  /** Test platform (localhost, IP addresses) */
  TEST = 'TEST'
}

/**
 * Platform detection result
 */
export interface PlatformDetectionResult {
  /** Detected platform or null if no match */
  platform: Platform | null
  /** Browser hostname */
  host: string
  /** Browser pathname */
  pathname: string
  /** Whether current page is an album view page */
  isAlbumPage: boolean
}

/**
 * Initialization error with detailed context
 */
export class InitializationError extends Error {
  /** Platform that failed to initialize */
  platform: Platform
  /** URL where error occurred */
  url: string
  /** Timestamp of error */
  timestamp: Date

  constructor(message: string, platform: Platform, url: string) {
    super(message)
    this.name = 'InitializationError'
    this.platform = platform
    this.url = url
    this.timestamp = new Date()
  }
}

/**
 * Initialization state enum
 */
export enum InitializationState {
  UNINITIALIZED = 'UNINITIALIZED',
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ERROR = 'ERROR'
}
