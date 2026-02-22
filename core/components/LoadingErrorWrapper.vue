<template>
  <div v-if="isLoading" class="ehunter-loading">
    <div class="loading-spinner"></div>
    <p class="loading-text">Initializing eHunter...</p>
  </div>
  <div v-else-if="error" class="ehunter-error">
    <div class="error-header">
      <h3>Initialization Error</h3>
      <button @click="onClose" class="close-button" aria-label="Close">×</button>
    </div>
    <p class="error-message">{{ error.message }}</p>
    <details class="error-details">
      <summary>Technical Details (for bug reports)</summary>
      <div class="error-info">
        <p><strong>Error:</strong> {{ error.message }}</p>
        <p><strong>Platform:</strong> {{ error.platform }}</p>
        <p><strong>URL:</strong> {{ error.url }}</p>
        <p><strong>Timestamp:</strong> {{ error.timestamp }}</p>
        <pre v-if="error.stack" class="error-stack">{{ error.stack }}</pre>
      </div>
    </details>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
</script>

<style scoped lang="scss">
.ehunter-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #333;
  color: #fff;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
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
</style>
