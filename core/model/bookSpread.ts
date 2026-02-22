export interface BookSpreadConfig {
    pageCount: number
    pagesPerScreen: number
    isChangeOddEven: boolean
}

export type BookSpreadPageIndex = number

export function getBookCoverPlaceholderHeightOfWidth(): number {
    return 1.45
}

function normalizeConfig(config: BookSpreadConfig): BookSpreadConfig {
    return {
        pageCount: Math.max(0, Math.floor(config.pageCount || 0)),
        pagesPerScreen: Math.max(1, Math.floor(config.pagesPerScreen || 1)),
        isChangeOddEven: !!config.isChangeOddEven,
    }
}

export function buildBookSpreadPageList(config: BookSpreadConfig): BookSpreadPageIndex[] {
    const normalized = normalizeConfig(config)
    const pages: BookSpreadPageIndex[] = []
    if (!normalized.isChangeOddEven) {
        pages.push(-1)
    }
    for (let i = 0; i < normalized.pageCount; i++) {
        pages.push(i)
    }
    pages.push(normalized.pageCount)
    return pages
}

export function buildBookSpreads(config: BookSpreadConfig): BookSpreadPageIndex[][] {
    const normalized = normalizeConfig(config)
    const pages = buildBookSpreadPageList(normalized)
    const spreads: BookSpreadPageIndex[][] = []
    for (let i = 0; i < pages.length; i += normalized.pagesPerScreen) {
        spreads.push(pages.slice(i, i + normalized.pagesPerScreen))
    }
    if (spreads.length === 0) {
        spreads.push([normalized.pageCount])
    }
    return spreads
}

export function findBookSpreadIndexByPage(spreads: BookSpreadPageIndex[][], pageIndex: number): number {
    const target = Math.floor(pageIndex)
    const index = spreads.findIndex(spread => spread.includes(target))
    return index >= 0 ? index : 0
}

export function pickBookSpreadAnchorPage(spread: BookSpreadPageIndex[] | undefined, fallback: number): number {
    if (!spread || spread.length === 0) {
        return fallback
    }
    const realPages = spread.filter(page => page >= 0)
    if (realPages.length === 0) {
        return fallback
    }
    return realPages[0]
}

export function getAdjacentBookPageIndex(config: BookSpreadConfig, curPageIndex: number, spreadDelta: number): number {
    const spreads = buildBookSpreads(config)
    const currentSpreadIndex = findBookSpreadIndexByPage(spreads, curPageIndex)
    const targetSpreadIndex = Math.max(0, Math.min(spreads.length - 1, currentSpreadIndex + spreadDelta))
    if (targetSpreadIndex === currentSpreadIndex) {
        return Math.max(0, Math.min(config.pageCount - 1, curPageIndex))
    }
    const targetSpread = spreads[targetSpreadIndex]
    return pickBookSpreadAnchorPage(targetSpread, curPageIndex)
}
