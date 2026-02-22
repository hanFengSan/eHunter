import { stringify as stringifyYaml } from 'yaml'
import * as fflate from 'fflate'
import type { AlbumService } from './AlbumService'
import { ImgSrcMode } from '../model/model'
import { i18n } from '../store/i18n'

export type DownloadTaskPhase = 'queued' | 'fetching' | 'compressing' | 'completed' | 'partial' | 'failed'
export type DownloadSeverity = 'info' | 'success' | 'warning' | 'error'

export interface DownloadStatusEvent {
    phase: DownloadTaskPhase
    severity: DownloadSeverity
    message: string
    processedPages: number
    totalPages: number
    failedPages: number
}

export interface DownloadFailureInfo {
    pageNumber: number
    reason: string
}

export interface DownloadChunkResult {
    chunkIndex: number
    totalChunks: number
    zipFileName: string
    successCount: number
    failedCount: number
    failedPageNumbers: number[]
}

export interface GalleryDownloadRunOptions {
    taskId: string
    albumService: AlbumService
    galleryTitle: string
    introUrl: string
    pageCount: number
    chunkSize: number
    autoRetryByOtherSource: boolean
    eHunterVersion: string
    onStatus: (event: DownloadStatusEvent) => void
}

export interface GalleryDownloadRunResult {
    status: 'completed' | 'partial' | 'failed'
    totalPages: number
    processedPages: number
    failedPages: number
    chunks: DownloadChunkResult[]
    failures: DownloadFailureInfo[]
}

interface ResolvedImage {
    pageNumber: number
    blob: Blob
    extension: string
}

const defaultChunkSize = 200
const maxAttemptsPerStage = 3

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, code: string): Promise<T> {
    return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            window.setTimeout(() => reject(new Error(code)), timeoutMs)
        }),
    ])
}

function normalizeChunkSize(raw: number): number {
    if (!Number.isFinite(raw) || raw <= 0) {
        return defaultChunkSize
    }
    return Math.floor(raw)
}

function getEHunterVersion(): string {
    const raw = (globalThis as any).__EHUNTER_VERSION__
    if (typeof raw === 'string' && raw) {
        return raw
    }
    return 'unknown'
}

function t(key: string, vars?: Record<string, string | number>): string {
    const dict = i18n.value as any
    let text = typeof dict[key] === 'string' ? dict[key] : key
    if (!vars) {
        return text
    }
    for (const varKey of Object.keys(vars)) {
        text = text.replace(new RegExp(`{{${varKey}}}`, 'g'), String(vars[varKey]))
    }
    return text
}

function sanitizeFileBaseName(raw: string): string {
    const cleaned = raw
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
        .replace(/[.\s]+$/g, '')
        .trim()
    if (cleaned.length > 0) {
        return cleaned
    }
    return 'gallery'
}

function inferExtension(src: string, blobType: string): string {
    const typeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/bmp': 'bmp',
        'image/avif': 'avif',
    }
    if (blobType && typeMap[blobType]) {
        return typeMap[blobType]
    }
    const fromUrl = src.match(/\.([a-zA-Z0-9]{2,5})(?:$|\?)/)
    if (fromUrl && fromUrl[1]) {
        return fromUrl[1].toLowerCase()
    }
    return 'jpg'
}

function isDevRuntimeForDownload(): boolean {
    const host = window.location.hostname || ''
    if (host === 'localhost') {
        return true
    }
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
        return true
    }
    return false
}

async function fetchBlobByGMXhr(url: string, timeoutMs = 30000): Promise<Blob> {
    const gmXhr = (globalThis as any).GM_xmlhttpRequest
    if (typeof gmXhr !== 'function') {
        throw new Error('GM_XHR_NOT_AVAILABLE')
    }
    return await new Promise<Blob>((resolve, reject) => {
        gmXhr({
            method: 'GET',
            url,
            responseType: 'arraybuffer',
            timeout: timeoutMs,
            onload: (resp: any) => {
                if (!resp || resp.status < 200 || resp.status >= 300 || !resp.response) {
                    reject(new Error(`GM_XHR_HTTP_${resp?.status || 'UNKNOWN'}`))
                    return
                }
                resolve(new Blob([resp.response]))
            },
            onerror: () => reject(new Error('GM_XHR_ERROR')),
            ontimeout: () => reject(new Error('GM_XHR_TIMEOUT')),
            onabort: () => reject(new Error('GM_XHR_ABORT')),
        })
    })
}

async function resolveImageBlob(
    albumService: AlbumService,
    pageIndex: number,
    pageNumber: number,
    autoRetryByOtherSource: boolean,
): Promise<ResolvedImage> {
    const stages = autoRetryByOtherSource
        ? [ImgSrcMode.ChangeSource, ImgSrcMode.Origin]
        : [ImgSrcMode.Default]

    let lastError: unknown = null
    for (const mode of stages) {
        for (let attempt = 1; attempt <= maxAttemptsPerStage; attempt++) {
            try {
                const imgInfo = await albumService.getImgSrc(pageIndex, mode)
                if (imgInfo instanceof Error) {
                    throw imgInfo
                }
                if (!imgInfo.src) {
                    throw new Error('empty_image_src')
                }
                if (typeof imgInfo.src === 'string' && imgInfo.src.startsWith('//')) {
                    imgInfo.src = `${window.location.protocol}${imgInfo.src}`
                }
                console.log('[GalleryDownloadService] image load begin', {
                    pageIndex,
                    pageNumber,
                    mode,
                    attempt,
                    src: imgInfo.src,
                })
                const beginAt = Date.now()
                const blob = await fetchBlobByGMXhr(imgInfo.src, 30000)
                const elapsed = Date.now() - beginAt
                console.log('[GalleryDownloadService] image load done', {
                    pageIndex,
                    pageNumber,
                    mode,
                    attempt,
                    src: imgInfo.src,
                    blobSize: blob.size,
                    blobType: blob.type,
                    elapsedMs: elapsed,
                })
                return {
                    pageNumber,
                    blob,
                    extension: inferExtension(imgInfo.src, blob.type),
                }
            } catch (e) {
                const reason = e instanceof Error ? e.message : String(e)
                console.log('[GalleryDownloadService] image load failed', {
                    pageIndex,
                    pageNumber,
                    mode,
                    attempt,
                    reason,
                })
                lastError = e
                if (attempt < maxAttemptsPerStage) {
                    await delay(350)
                }
            }
        }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError || 'resolve_image_failed'))
}

function downloadBlob(fileName: string, blob: Blob) {
    const url = URL.createObjectURL(blob)
    const gmDownload = (globalThis as any).GM_download
    console.log('[GalleryDownloadService] download trigger start', { fileName, size: blob.size })

    if (!isDevRuntimeForDownload() && typeof gmDownload === 'function') {
        try {
            gmDownload({
                url,
                name: fileName,
                saveAs: false,
                onload: () => {
                    console.log('[GalleryDownloadService] download trigger done (GM_download onload)', { fileName })
                    URL.revokeObjectURL(url)
                },
                onerror: () => {
                    console.log('[GalleryDownloadService] download trigger done (GM_download onerror)', { fileName })
                    URL.revokeObjectURL(url)
                },
                ontimeout: () => {
                    console.log('[GalleryDownloadService] download trigger done (GM_download ontimeout)', { fileName })
                    URL.revokeObjectURL(url)
                },
                onabort: () => {
                    console.log('[GalleryDownloadService] download trigger done (GM_download onabort)', { fileName })
                    URL.revokeObjectURL(url)
                },
            })
            console.log('[GalleryDownloadService] download trigger done (GM_download submitted)', { fileName })
            return
        } catch (e) {
            URL.revokeObjectURL(url)
        }
    }

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log('[GalleryDownloadService] download trigger done (anchor click)', { fileName })
    window.setTimeout(() => URL.revokeObjectURL(url), 500)
}

export class GalleryDownloadService {
    private abortedTaskSet = new Set<string>()

    abort(taskId: string) {
        this.abortedTaskSet.add(taskId)
    }

    private assertNotAborted(taskId: string) {
        if (this.abortedTaskSet.has(taskId)) {
            throw new Error('DOWNLOAD_ABORTED')
        }
    }

    async run(rawOptions: GalleryDownloadRunOptions): Promise<GalleryDownloadRunResult> {
        const options = {
            ...rawOptions,
            chunkSize: normalizeChunkSize(rawOptions.chunkSize),
        }
        this.abortedTaskSet.delete(options.taskId)
        const totalPages = Math.max(0, options.pageCount)
        const totalChunks = Math.max(1, Math.ceil((totalPages || 1) / options.chunkSize))
        const failures: DownloadFailureInfo[] = []
        const chunkResults: DownloadChunkResult[] = []
        const width = Math.max(3, String(totalPages).length)
        const fileBaseName = sanitizeFileBaseName(options.galleryTitle)
        const downloadTime = new Date().toISOString()

        options.onStatus({
            phase: 'queued',
            severity: 'info',
            message: t('downloadQueued'),
            processedPages: 0,
            totalPages,
            failedPages: 0,
        })

        if (totalPages <= 0) {
            options.onStatus({
                phase: 'failed',
                severity: 'error',
                message: t('downloadNoPages'),
                processedPages: 0,
                totalPages,
                failedPages: 0,
            })
            return {
                status: 'failed',
                totalPages,
                processedPages: 0,
                failedPages: 0,
                chunks: [],
                failures: [{ pageNumber: 0, reason: 'no_pages' }],
            }
        }

        let currentChunkIndex = 1
        let processedPages = 0
        let currentChunkFailures: number[] = []
        let currentChunkSuccessCount = 0

        const finalizeChunk = async (chunkImages: ResolvedImage[]) => {
            this.assertNotAborted(options.taskId)
            const chunkMeta = {
                introUrl: options.introUrl,
                galleryTitle: options.galleryTitle,
                totalPages,
                downloadTime,
                eHunterVersion: options.eHunterVersion || getEHunterVersion(),
                totalChunks,
                chunkIndex: currentChunkIndex,
            }
            const zipFiles: Record<string, Uint8Array> = {
                'metadata.yaml': fflate.strToU8(stringifyYaml(chunkMeta)),
            }

            const sortedChunkImages = [...chunkImages].sort((a, b) => a.pageNumber - b.pageNumber)
            for (const image of sortedChunkImages) {
                try {
                    const stem = String(image.pageNumber).padStart(width, '0')
                    const fileName = `${stem}.${image.extension}`
                    zipFiles[fileName] = new Uint8Array(await image.blob.arrayBuffer())
                } catch (e) {
                    const reason = e instanceof Error ? e.message : String(e)
                    failures.push({ pageNumber: image.pageNumber, reason: `ZIP_PREP_FAILED:${reason}` })
                    currentChunkFailures.push(image.pageNumber)
                    currentChunkSuccessCount = Math.max(0, currentChunkSuccessCount - 1)
                } finally {
                    image.blob = new Blob()
                }
            }

            options.onStatus({
                phase: 'compressing',
                severity: 'info',
                message: t('downloadCompressing', { chunk: currentChunkIndex, totalChunks }),
                processedPages,
                totalPages,
                failedPages: failures.length,
            })

            console.log('[GalleryDownloadService] zip compress start', {
                chunkIndex: currentChunkIndex,
                totalChunks,
                fileCount: sortedChunkImages.length,
            })
            const zipBytes = fflate.zipSync(zipFiles, { level: 0 })
            const zipBytesCopy = new Uint8Array(zipBytes.length)
            zipBytesCopy.set(zipBytes)
            const zipBlob = new Blob([zipBytesCopy], { type: 'application/zip' })
            console.log('[GalleryDownloadService] zip compress done', {
                chunkIndex: currentChunkIndex,
                totalChunks,
                zipSize: zipBlob.size,
            })
            this.assertNotAborted(options.taskId)
            const zipFileName = totalChunks > 1
                ? `${fileBaseName}_part-${String(currentChunkIndex).padStart(2, '0')}-of-${String(totalChunks).padStart(2, '0')}.zip`
                : `${fileBaseName}.zip`
            downloadBlob(zipFileName, zipBlob)

            chunkResults.push({
                chunkIndex: currentChunkIndex,
                totalChunks,
                zipFileName,
                successCount: currentChunkSuccessCount,
                failedCount: currentChunkFailures.length,
                failedPageNumbers: [...currentChunkFailures],
            })

            currentChunkIndex += 1
            currentChunkFailures = []
            currentChunkSuccessCount = 0
        }

        for (let chunkStart = 1; chunkStart <= totalPages; chunkStart += options.chunkSize) {
            this.assertNotAborted(options.taskId)
            const chunkEnd = Math.min(totalPages, chunkStart + options.chunkSize - 1)
            const pageNumbers: number[] = []
            for (let page = chunkStart; page <= chunkEnd; page++) {
                pageNumbers.push(page)
            }

            const chunkImages: ResolvedImage[] = []
            const queue = [...pageNumbers]

            const runWorker = async () => {
                while (queue.length > 0) {
                    this.assertNotAborted(options.taskId)
                    const pageNumber = queue.shift()
                    if (!pageNumber) {
                        return
                    }
                    options.onStatus({
                        phase: 'fetching',
                        severity: 'info',
                        message: t('downloadFetching', { current: pageNumber, total: totalPages }),
                        processedPages,
                        totalPages,
                        failedPages: failures.length,
                    })

                    const pageIndex = pageNumber - 1
                    try {
                        const resolved = await resolveImageBlob(
                            options.albumService,
                            pageIndex,
                            pageNumber,
                            options.autoRetryByOtherSource,
                        )
                        this.assertNotAborted(options.taskId)
                        chunkImages.push(resolved)
                        currentChunkSuccessCount += 1
                    } catch (e) {
                        const reason = e instanceof Error ? e.message : String(e)
                        failures.push({ pageNumber, reason })
                        currentChunkFailures.push(pageNumber)
                    }

                    processedPages += 1
                    options.onStatus({
                        phase: 'fetching',
                        severity: 'info',
                        message: t('downloadFetching', { current: processedPages, total: totalPages }),
                        processedPages,
                        totalPages,
                        failedPages: failures.length,
                    })
                }
            }

            await Promise.all([runWorker(), runWorker(), runWorker()])
            try {
                await finalizeChunk(chunkImages)
            } catch (e) {
                const reason = e instanceof Error ? e.message : String(e)
                failures.push({ pageNumber: chunkStart, reason: `CHUNK_FINALIZE_FAILED:${reason}` })
                options.onStatus({
                    phase: 'partial',
                    severity: 'warning',
                    message: t('downloadChunkFailed', { chunk: currentChunkIndex, reason }),
                    processedPages,
                    totalPages,
                    failedPages: failures.length,
                })
                currentChunkIndex += 1
                currentChunkFailures = []
                currentChunkSuccessCount = 0
            }
        }

        this.assertNotAborted(options.taskId)

        const finalStatus: 'completed' | 'partial' | 'failed' = failures.length === 0
            ? 'completed'
            : failures.length === totalPages
                ? 'failed'
                : 'partial'

        options.onStatus({
            phase: finalStatus,
            severity: finalStatus === 'completed' ? 'success' : finalStatus === 'partial' ? 'warning' : 'error',
            message: finalStatus === 'completed'
                ? t('downloadCompleted')
                : finalStatus === 'partial'
                    ? t('downloadPartial', { failed: failures.length })
                    : t('downloadFailed'),
            processedPages,
            totalPages,
            failedPages: failures.length,
        })

        return {
            status: finalStatus,
            totalPages,
            processedPages,
            failedPages: failures.length,
            chunks: chunkResults,
            failures,
        }
    }
}
