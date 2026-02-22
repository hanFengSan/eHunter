/**
 * Platform Service Factory
 * 
 * Creates platform-specific AlbumService implementations based on detected platform.
 */

import { Platform } from './types'
import type { AlbumService } from '../../core/service/AlbumService'
import { EHAlbumServiceImpl } from './eh/service/AlbumServiceImpl'
import { NHAlbumServiceImpl } from './nh/service/AlbumServiceImpl'
import { TestAlbumService } from './test/AlbumService'

/**
 * Create platform-specific AlbumService instance
 * 
 * @param platform - Detected platform
 * @returns AlbumService implementation for the platform
 * @throws Error if platform is not supported
 */
export function createPlatformService(platform: Platform): AlbumService {
  switch (platform) {
    case Platform.EH:
      return new EHAlbumServiceImpl()
    
    case Platform.NH:
      return new NHAlbumServiceImpl()
    
    case Platform.TEST:
      return new TestAlbumService('')
    
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
