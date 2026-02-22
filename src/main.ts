import { createApp, ref, h } from 'vue'
import TestApp from '../core/TestApp.vue'
import LoadingView from '../core/components/LoadingView.vue'
import '../core/style/_normalize.scss'
import { NameAlbumService } from '../core/service/AlbumService'
import { detectPlatform } from './platform/detector'
import { createPlatformService } from './platform/factory'
import { initializeWithTimeout } from './platform/initializer'
import { applyPlatformHostActions } from './platform/hostActions'
import PlatformService from './platform/base/service/PlatformService.js'
import type { InitializationError } from './platform/types'

/// <reference types="vite-svg-loader" />

// Detect platform based on current URL
const detectionResult = detectPlatform()

type EHunterUiBridge = {
  open: () => void
  close: () => void
  toggle: (show: boolean) => void
}

type WindowWithEHunterBridge = Window & {
  __EHUNTER_UI__?: EHunterUiBridge
}

const EHUNTER_STATUS_KEY = 'ehunter:reader:open'
const EHUNTER_SWITCH_ID = 'ehunter-switch'
const EHUNTER_CONTAINER_ID = 'ehunter-app'
const EHUNTER_OPEN_DURATION_MS = 720
const EHUNTER_CLOSE_DURATION_MS = 580
const EHUNTER_OPEN_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EHUNTER_CLOSE_EASING = 'cubic-bezier(0.55, 0.08, 0.68, 0.53)'

function readEHunterStatus(): boolean {
  const value = PlatformService.storageGet(EHUNTER_STATUS_KEY, true)
  if (typeof value === 'boolean') {
    return value
  }
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return true
}

function writeEHunterStatus(open: boolean): void {
  PlatformService.storageSet(EHUNTER_STATUS_KEY, open)
}

function createEhunterSwitch(onOpen: () => void): void {
  const existing = document.getElementById(EHUNTER_SWITCH_ID)
  if (existing) {
    existing.remove()
  }

  const container = document.createElement('div')
  container.style.display = 'flex'
  container.style.flexDirection = 'column'
  container.style.justifyContent = 'center'
  container.style.alignItems = 'center'
  container.style.position = 'fixed'
  container.style.right = '100px'
  container.style.top = '-150px'
  container.style.zIndex = '2147483646'
  container.style.cursor = 'pointer'
  container.style.transition = 'all 0.2s cubic-bezier(.46,-0.23,.37,2.38)'
  container.setAttribute('title', 'open eHunter')
  container.setAttribute('id', EHUNTER_SWITCH_ID)
  container.addEventListener('click', () => {
    container.style.top = '-50px'
    window.setTimeout(() => {
      container.style.top = '-150px'
    }, 2000)
    onOpen()
  })

  const line = document.createElement('span')
  line.style.width = '2px'
  line.style.height = '200px'
  line.style.background = '#2ecc71'
  line.style.boxShadow = '0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647)'
  container.appendChild(line)

  const ring = document.createElement('span')
  ring.style.border = '2px solid #2ecc71'
  ring.style.borderRadius = '50%'
  ring.style.width = '15px'
  ring.style.height = '15px'
  ring.style.boxShadow = '0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647)'
  container.appendChild(ring)

  document.body.appendChild(container)
}

// Early return if no platform detected (non-album page)
if (!detectionResult.platform) {
  console.log('eHunter: No platform detected (non-album page), skipping initialization')
  // Exit silently - no errors thrown per FR-006
} else {
  // Platform detected - initialize reader
  console.log(`eHunter: Platform detected: ${detectionResult.platform}`)

  let isMounted = false
  let hostActionsApplied = false
  let hideTimerId: number | null = null

  const clearHideTimer = (): void => {
    if (hideTimerId !== null) {
      window.clearTimeout(hideTimerId)
      hideTimerId = null
    }
  }

  const scheduleHideContainer = (container: HTMLElement, delayMs: number): void => {
    clearHideTimer()
    hideTimerId = window.setTimeout(() => {
      container.style.visibility = 'hidden'
      container.style.pointerEvents = 'none'
      hideTimerId = null
    }, delayMs)
  }

  const ensureMounted = (): HTMLElement => {
    let container = document.getElementById(EHUNTER_CONTAINER_ID)
    if (!container) {
      container = document.createElement('div')
      container.id = EHUNTER_CONTAINER_ID
      container.classList.add('normalize')
      container.style.position = 'fixed'
      container.style.height = '100%'
      container.style.width = '100%'
      container.style.transitionProperty = 'top'
      container.style.transitionDuration = `${EHUNTER_OPEN_DURATION_MS}ms`
      container.style.transitionTimingFunction = EHUNTER_OPEN_EASING
      container.style.background = '#333333'
      container.style.zIndex = '2147483647'
      container.style.top = '-100%'
      container.style.left = '0'
      container.style.visibility = 'hidden'
      container.style.pointerEvents = 'none'
      document.body.appendChild(container)
    }

    if (!isMounted) {
      const app = createApp({
        setup() {
          const isLoading = ref(true)
          const error = ref<InitializationError | null>(null)

          const init = async () => {
            try {
              if (!hostActionsApplied) {
                applyPlatformHostActions(detectionResult.platform!)
                hostActionsApplied = true
              }

              const albumService = createPlatformService(detectionResult.platform!)
              app.provide(NameAlbumService, albumService)
              await initializeWithTimeout(albumService, detectionResult.platform!)
              isLoading.value = false
            } catch (err) {
              isLoading.value = false
              error.value = err as InitializationError
              console.error('eHunter initialization failed:', {
                message: error.value.message,
                stack: error.value.stack,
                platform: error.value.platform,
                url: error.value.url,
                timestamp: error.value.timestamp
              })
            }
          }

          init()

          const handleClose = () => {
            writeEHunterStatus(false)
            document.body.style.overflow = ''
            const root = document.getElementById(EHUNTER_CONTAINER_ID)
            if (root) {
              root.style.top = '-100%'
              scheduleHideContainer(root, EHUNTER_CLOSE_DURATION_MS)
            }
          }

          return {
            isLoading,
            error,
            handleClose
          }
        },
        render() {
          return h(LoadingView, {
            isLoading: this.isLoading,
            error: this.error,
            onClose: this.handleClose
          }, {
            default: () => h(TestApp)
          })
        }
      })

      app.mount(`#${EHUNTER_CONTAINER_ID}`)
      isMounted = true
    }

    return container
  }

  const toggleEHunterView = (show: boolean): void => {
    const container = ensureMounted()
    clearHideTimer()
    container.style.transitionProperty = 'top'
    container.style.transitionDuration = show
      ? `${EHUNTER_OPEN_DURATION_MS}ms`
      : `${EHUNTER_CLOSE_DURATION_MS}ms`
    container.style.transitionTimingFunction = show
      ? EHUNTER_OPEN_EASING
      : EHUNTER_CLOSE_EASING
    document.body.style.overflow = show ? 'hidden' : ''

    if (show) {
      container.style.visibility = 'visible'
      container.style.pointerEvents = 'auto'
      requestAnimationFrame(() => {
        container.style.top = '0'
      })
      return
    }

    container.style.top = '-100%'
    scheduleHideContainer(container, EHUNTER_CLOSE_DURATION_MS)
  }

  const openEHunter = (): void => {
    writeEHunterStatus(true)
    toggleEHunterView(true)
  }

  const closeEHunter = (): void => {
    writeEHunterStatus(false)
    toggleEHunterView(false)
  }

  ;(window as WindowWithEHunterBridge).__EHUNTER_UI__ = {
    open: openEHunter,
    close: closeEHunter,
    toggle: toggleEHunterView
  }

  createEhunterSwitch(openEHunter)

  if (readEHunterStatus()) {
    openEHunter()
  }
}
