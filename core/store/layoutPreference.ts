import PlatformService from '../../src/platform/base/service/PlatformService.js'
import {
    clampThumbSize,
    createDefaultLayoutPreference,
    createDefaultModeLayout,
    normalizeDockSlot,
    readerLayoutPreferenceKey,
    readerLayoutPreferenceSchemaVersion,
    type ReaderModeLayoutKey,
    type ReaderModeLayoutPreference,
    type ReaderModeLayoutState,
} from '../model/layout'

function readRawPreference(): any {
    const gmGetValue = (<any>globalThis).GM_getValue
    if (typeof gmGetValue === 'function') {
        return gmGetValue(readerLayoutPreferenceKey, null)
    }
    try {
        return PlatformService.storageGet(readerLayoutPreferenceKey, null)
    } catch (e) {
        return null
    }
}

function writeRawPreference(data: ReaderModeLayoutPreference): void {
    const gmSetValue = (<any>globalThis).GM_setValue
    if (typeof gmSetValue === 'function') {
        gmSetValue(readerLayoutPreferenceKey, data)
        return
    }
    try {
        PlatformService.storageSet(readerLayoutPreferenceKey, data)
    } catch (e) {
    }
}

function normalizeModeLayout(mode: ReaderModeLayoutKey, raw: any): ReaderModeLayoutState {
    const fallback = createDefaultModeLayout(mode)
    if (!raw || typeof raw !== 'object') {
        return fallback
    }
    const slot = normalizeDockSlot(raw.thumbSlot)
    const size = clampThumbSize(slot, Number(raw.thumbSizePx))
    const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : fallback.updatedAt
    return {
        thumbSlot: slot,
        thumbSizePx: size,
        updatedAt,
    }
}

export function sanitizeLayoutPreference(rawData: any): ReaderModeLayoutPreference {
    const defaults = createDefaultLayoutPreference()
    if (!rawData) {
        return defaults
    }
    if (typeof rawData === 'string') {
        try {
            rawData = JSON.parse(rawData)
        } catch (e) {
            return defaults
        }
    }
    if (typeof rawData !== 'object') {
        return defaults
    }
    const layouts = rawData.layouts && typeof rawData.layouts === 'object' ? rawData.layouts : {}
    return {
        schemaVersion: Number(rawData.schemaVersion) || readerLayoutPreferenceSchemaVersion,
        updatedAt: typeof rawData.updatedAt === 'string' ? rawData.updatedAt : new Date().toISOString(),
        layouts: {
            scroll: normalizeModeLayout('scroll', layouts.scroll),
            book: normalizeModeLayout('book', layouts.book),
        },
    }
}

export function readLayoutPreference(): ReaderModeLayoutPreference {
    return sanitizeLayoutPreference(readRawPreference())
}

export function writeLayoutPreference(data: ReaderModeLayoutPreference): ReaderModeLayoutPreference {
    const sanitized = sanitizeLayoutPreference(data)
    writeRawPreference(sanitized)
    return sanitized
}

export function resetLayoutPreference(): ReaderModeLayoutPreference {
    const defaults = createDefaultLayoutPreference()
    writeRawPreference(defaults)
    return defaults
}
