<template>
  <div v-if="isLoading" class="ehunter-loading">
    <div class="ehunter-loading-view">
      <div class="loading-animation">
        <div class="book">
          <div class="book__page"></div>
          <div class="book__page"></div>
          <div class="book__page"></div>
        </div>
        <h4>Reading</h4>
      </div>
    </div>
  </div>
  <div v-else-if="error" class="ehunter-error">
    <div class="error-header">
      <h3>Initialization Error</h3>
      <button @click="onClose" class="close-button" aria-label="Close">x</button>
    </div>
    <p class="error-message">{{ error.message }}</p>
    <details class="error-details" open>
      <summary>
        <span>Technical Details (for bug reports)</span>
        <button class="copy-button" @click.stop="copyErrorDetails">{{ copyButtonText }}</button>
      </summary>
      <div class="error-info">
        <p><strong>Error:</strong> {{ error.message }}</p>
        <p><strong>Platform:</strong> {{ error.platform }}</p>
        <p><strong>eHunter Version:</strong> {{ appVersion }}</p>
        <p><strong>Device:</strong> {{ deviceName }}</p>
        <p><strong>OS:</strong> {{ operatingSystem }}</p>
        <p><strong>URL:</strong> {{ error.url }}</p>
        <p><strong>Timestamp:</strong> {{ error.timestamp }}</p>
        <pre v-if="error.stack" class="error-stack">{{ error.stack }}</pre>
      </div>
    </details>
    <p class="feedback-link">
      Feedback: <a href="https://github.com/hanFengSan/eHunter/issues" target="_blank" rel="noopener noreferrer">https://github.com/hanFengSan/eHunter/issues</a>
    </p>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import pkgJson from '../../package.json'
import type { InitializationError } from '../../src/platform/types'

interface Props {
  isLoading?: boolean
  error?: InitializationError | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null
})

const emit = defineEmits<{
  close: []
}>()

const onClose = () => {
  emit('close')
}

function getDeviceName(): string {
  const nav = navigator as Navigator & {
    userAgentData?: {
      platform?: string
      brands?: Array<{ brand: string }>
      mobile?: boolean
      model?: string
    }
  }

  const model = nav.userAgentData?.model
  if (typeof model === 'string' && model.trim()) {
    return model
  }

  const platform = nav.userAgentData?.platform || navigator.platform || 'Unknown Device'
  const mobileTag = nav.userAgentData?.mobile ? ' Mobile' : ''
  return `${platform}${mobileTag}`.trim()
}

function getOperatingSystem(): string {
  const nav = navigator as Navigator & {
    userAgentData?: {
      platform?: string
    }
  }

  if (nav.userAgentData?.platform) {
    return nav.userAgentData.platform
  }

  const ua = navigator.userAgent
  if (/Windows NT/i.test(ua)) {
    return 'Windows'
  }
  if (/Mac OS X|Macintosh/i.test(ua)) {
    return 'macOS'
  }
  if (/Android/i.test(ua)) {
    return 'Android'
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'iOS'
  }
  if (/Linux/i.test(ua)) {
    return 'Linux'
  }
  return 'Unknown OS'
}

const appVersion = pkgJson.version || 'unknown'
const deviceName = getDeviceName()
const operatingSystem = getOperatingSystem()

const copied = ref(false)

const copyButtonText = computed(() => (copied.value ? 'Copied' : '复制'))

const errorDetailText = computed(() => {
  const currentError = props.error
  if (!currentError) {
    return ''
  }

  const lines = [
    `Error: ${currentError.message}`,
    `Platform: ${currentError.platform}`,
    `eHunter Version: ${appVersion}`,
    `Device: ${deviceName}`,
    `OS: ${operatingSystem}`,
    `URL: ${currentError.url}`,
    `Timestamp: ${currentError.timestamp}`
  ]

  if (currentError.stack) {
    lines.push(`Stack:\n${currentError.stack}`)
  }

  return lines.join('\n')
})

const copyErrorDetails = async () => {
  if (!errorDetailText.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(errorDetailText.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    copied.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '../style/_variables';

$peter-river: $body_bg;
$clouds: #ecf0f1;

.ehunter-loading-view {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: $body_bg;

    .loading-animation {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;

        .book {
            position: relative;
            margin: 0 auto;
            border: 5px solid $clouds;
            width: 100px;
            height: 60px;
        }
        .book__page {
            position: absolute;
            left: 50%;
            top: -5px;
            margin: 0 auto;
            border-top: 5px solid $clouds;
            border-bottom: 5px solid $clouds;
            border-right: 5px solid $clouds;
            background: $peter-river;
            width: 50px;
            height: 60px;
            transform-origin: 0% 50%;
            animation: flip 0.85s infinite linear;
            animation-fill-mode: forwards;
            backface-visibility: hidden;

            @for $i from 1 through 3 {
                &:nth-child(#{$i}) {
                    z-index: 4 - $i;
                    animation-delay: -0.28s * $i;
                }
            }
        }

        @keyframes flip {
            0% {
                transform: perspective(600px) rotateY(-0deg);
            }

            20% {
                background: darken($peter-river, 10%);
            }

            29.9% {
                background: darken($peter-river, 10%);
            }
            30% {
                transform: perspective(200px) rotateY(-90deg);
                background: $peter-river;
            }

            54.999% {
                opacity: 1;
            }
            55% {
                opacity: 0;
            }

            60% {
                transform: perspective(200px) rotateY(-180deg);
                background: $peter-river;
            }

            100% {
                transform: perspective(200px) rotateY(-180deg);
                background: $peter-river;
            }
        }

        h4 {
            color: #ffffff;
            text-align: center;
            font-family: sans-serif;
            text-transform: uppercase;
            font-size: 20px;
            position: relative;
            margin: 0;
        }

        h4:after {
            position: absolute;
            content: '';
            -webkit-animation: Dots 1.4s cubic-bezier(0, 0.39, 1, 0.68) infinite;
            animation: Dots 1.4s cubic-bezier(0, 0.39, 1, 0.68) infinite;
        }

        /* Dots */

        @-webkit-keyframes Dots {
            0% {
                content: '';
            }
            33% {
                content: '.';
            }
            66% {
                content: '..';
            }
            100% {
                content: '...';
            }
        }

        @keyframes Dots {
            0% {
                content: '';
            }
            33% {
                content: '.';
            }
            66% {
                content: '..';
            }
            100% {
                content: '...';
            }
        }
    }
}

.ehunter-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

.ehunter-error {
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: #333;
    color: #fff;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 10px;
}

.error-header h3 {
    margin: 0;
    font-size: 24px;
    color: #ff6b6b;
}

.close-button {
    background: none;
    border: none;
    color: #fff;
    font-size: 32px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.1);
}

.error-message {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.9);
}

.error-details {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 15px;
}

.error-details summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 10px;
    user-select: none;
}

.error-details summary:hover {
    color: #4fc3f7;
}

.error-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
}

.error-info p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
}

.error-info strong {
    color: #4fc3f7;
}

.copy-button {
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
}

.copy-button:hover {
    background: rgba(255, 255, 255, 0.16);
}

.error-stack {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 10px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.4;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #ff9800;
}

.feedback-link {
    margin-top: 14px;
    margin-bottom: 0;
    color: rgba(255, 255, 255, 0.85);
}

.feedback-link a {
    color: #4fc3f7;
}
</style>
