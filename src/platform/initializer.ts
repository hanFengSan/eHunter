/**
 * Platform Initializer
 * 
 * Handles platform initialization with timeout and error handling.
 */

import type { AlbumService } from '../../core/service/AlbumService'
import { InitializationError, Platform } from './types'

/**
 * Initialize AlbumService with 60-second timeout
 * 
 * @param albumService - AlbumService instance to initialize
 * @param platform - Platform being initialized
 * @returns Promise that resolves on success or rejects with InitializationError
 * @throws InitializationError if initialization fails or times out
 */
export async function initializeWithTimeout(
  albumService: AlbumService,
  platform: Platform
): Promise<void> {
  const TIMEOUT_MS = 60000 // 60 seconds per FR-020

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new InitializationError(
        'Platform initialization timed out after 60 seconds',
        platform,
        window.location.href
      ))
    }, TIMEOUT_MS)
  })

  // Race initialization against timeout
  try {
    const result = await Promise.race([
      albumService.init(),
      timeoutPromise
    ])

    // Check if init() returned an Error
    if (result instanceof Error) {
      throw new InitializationError(
        `Platform initialization failed: ${result.message}`,
        platform,
        window.location.href
      )
    }
  } catch (error) {
    // If error is already InitializationError, rethrow it
    if (error instanceof InitializationError) {
      throw error
    }

    // Otherwise, wrap it in InitializationError
    throw new InitializationError(
      error instanceof Error ? error.message : 'Unknown initialization error',
      platform,
      window.location.href
    )
  }
}
