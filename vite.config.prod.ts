import { fileURLToPath, URL } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import svgLoader from 'vite-svg-loader'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string
}

const userscriptBanner = `// ==UserScript==
// @name         eHunter
// @namespace    http://tampermonkey.net/
// @version      ${pkg.version}
// @description  This extension provides a scroll mode and book mode to e-hentai/exhentai/nhentai, for the best reading experince!  此扩展为e-hentai/exhentai/nhentai提供一个滚动模式和书本模式, 提供良好的阅读体验.
// @supportURL   https://github.com/hanFengSan/eHunter/issues
// @author       Alex Chen
// @match        https://exhentai.org/*
// @match        https://e-hentai.org/*
// @match        https://nhentai.net/*
// @connect      githubusercontent.com
// @connect      jp.animesales.xyz
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @license      MIT
// ==/UserScript==`

const prependUserscriptBannerPlugin = (): Plugin => ({
  name: 'prepend-userscript-banner',
  apply: 'build',
  enforce: 'post',
  writeBundle(outputOptions, bundle) {
    const output = bundle['ehunter.iife.js']

    if (!output) {
      return null
    }

    const outputDir = outputOptions.dir ?? 'dist'
    const outputPath = join(outputDir, 'ehunter.iife.js')
    const code = readFileSync(outputPath, 'utf-8')

    if (code.startsWith('// ==UserScript==')) {
      return null
    }

    writeFileSync(outputPath, `${userscriptBanner}\n${code}`, 'utf-8')

    return null
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin(), svgLoader(), prependUserscriptBannerPlugin()],
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
