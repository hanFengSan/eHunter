import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin(), svgLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  appType: 'custom',
  server: {
    host: true,
    middlewareMode: true,
  },
  build: {
    target: 'es2015',
    modulePreload: false,
    lib: { // add 30kb size
      entry: './src/main.ts',
      name: 'ehunter',
      formats: ['iife'],
      fileName: 'ehunter'
    }
  }
})
