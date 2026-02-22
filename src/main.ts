import { createApp, ref, h } from 'vue'
import TestApp from '../core/TestApp.vue'
import LoadingErrorWrapper from '../core/components/LoadingErrorWrapper.vue'
import '../core/style/_normalize.scss'
import { NameAlbumService } from '../core/service/AlbumService'
import { detectPlatform } from './platform/detector'
import { createPlatformService } from './platform/factory'
import { initializeWithTimeout } from './platform/initializer'
import { applyPlatformHostActions } from './platform/hostActions'
import type { InitializationError } from './platform/types'

/// <reference types="vite-svg-loader" />

// Detect platform based on current URL
const detectionResult = detectPlatform()

// Early return if no platform detected (non-album page)
if (!detectionResult.platform) {
  console.log('eHunter: No platform detected (non-album page), skipping initialization')
  // Exit silently - no errors thrown per FR-006
} else {
  // Platform detected - initialize reader
  console.log(`eHunter: Platform detected: ${detectionResult.platform}`)

  if (detectionResult.platform) {
    applyPlatformHostActions(detectionResult.platform)
  }
  
  // Create Vue app with LoadingErrorWrapper
  const app = createApp({
    setup() {
      const isLoading = ref(true)
      const error = ref<InitializationError | null>(null)

      // Initialize platform
      const init = async () => {
        try {
          // Create platform-specific service
          const albumService = createPlatformService(detectionResult.platform!)
          
          // Provide service to Vue app
          app.provide(NameAlbumService, albumService)
          
          // Initialize with timeout
          await initializeWithTimeout(albumService, detectionResult.platform!)
          
          // Success - hide loading
          isLoading.value = false
        } catch (err) {
          // Initialization failed
          isLoading.value = false
          error.value = err as InitializationError
          
          // Log detailed error to console per FR-019
          console.error('eHunter initialization failed:', {
            message: error.value.message,
            stack: error.value.stack,
            platform: error.value.platform,
            url: error.value.url,
            timestamp: error.value.timestamp
          })
        }
      }

      // Start initialization
      init()

      const handleClose = () => {
        // Remove eHunter container when user closes error
        const container = document.getElementById('ehunter-app')
        if (container) {
          container.remove()
        }
      }

      return {
        isLoading,
        error,
        handleClose
      }
    },
    render() {
      return h(LoadingErrorWrapper, {
        isLoading: this.isLoading,
        error: this.error,
        onClose: this.handleClose
      }, {
        default: () => h(TestApp)
      })
    }
  })

  // Create and mount container
  const container = document.createElement('div')
  container.id = 'ehunter-app'
  container.classList.add('normalize')
  document.body.appendChild(container)
  
  app.mount('#ehunter-app')
}
