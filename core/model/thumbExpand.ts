import type { ThumbInfo } from './model'

export const thumbExpandSegmentSize = 100

export interface ThumbExpandSegmentRange {
    segmentIndex: number
    startIndex: number
    endIndex: number
}

export interface ThumbExpandItem {
    pageNumber: number
    thumbInfo: ThumbInfo | null
    renderState: 'ready' | 'error'
}

export function clampThumbExpandSegmentIndex(segmentIndex: number, pageCount: number): number {
    const max = getThumbExpandSegmentCount(pageCount) - 1
    if (segmentIndex < 0) {
        return 0
    }
    if (segmentIndex > max) {
        return max
    }
    return segmentIndex
}

export function getThumbExpandSegmentCount(pageCount: number): number {
    const normalized = Math.max(1, pageCount)
    return Math.max(1, Math.ceil(normalized / thumbExpandSegmentSize))
}

export function getThumbExpandSegmentByPage(pageIndex: number): number {
    if (pageIndex <= 0) {
        return 0
    }
    return Math.floor(pageIndex / thumbExpandSegmentSize)
}

export function getThumbExpandSegmentRange(segmentIndex: number, pageCount: number): ThumbExpandSegmentRange {
    const normalizedSegmentIndex = clampThumbExpandSegmentIndex(segmentIndex, pageCount)
    const startIndex = normalizedSegmentIndex * thumbExpandSegmentSize
    const endIndex = Math.min(pageCount - 1, startIndex + thumbExpandSegmentSize - 1)
    return {
        segmentIndex: normalizedSegmentIndex,
        startIndex: Math.max(0, startIndex),
        endIndex: Math.max(0, endIndex),
    }
}

export function buildThumbExpandItems(
    thumbInfos: ThumbInfo[],
    pageCount: number,
    segmentIndex: number,
): ThumbExpandItem[] {
    if (pageCount <= 0) {
        return []
    }
    const range = getThumbExpandSegmentRange(segmentIndex, pageCount)
    const result: ThumbExpandItem[] = []
    for (let i = range.startIndex; i <= range.endIndex; i++) {
        const thumbInfo = thumbInfos[i] || null
        result.push({
            pageNumber: i + 1,
            thumbInfo,
            renderState: thumbInfo ? 'ready' : 'error',
        })
    }
    return result
}
