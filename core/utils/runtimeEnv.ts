function normalizeHostToHostname(hostOrHostname: string): string {
    const trimmed = hostOrHostname.trim()
    if (!trimmed) {
        return ''
    }
    if (trimmed.startsWith('[')) {
        const end = trimmed.indexOf(']')
        return end > 0 ? trimmed.slice(1, end) : trimmed
    }
    const firstColon = trimmed.indexOf(':')
    if (firstColon > -1) {
        return trimmed.slice(0, firstColon)
    }
    return trimmed
}

export function isIPv4Host(hostOrHostname: string): boolean {
    const hostname = normalizeHostToHostname(hostOrHostname)
    return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
}

export function isTestEnvironmentHost(hostOrHostname: string): boolean {
    const hostname = normalizeHostToHostname(hostOrHostname)
    return hostname === 'localhost' || isIPv4Host(hostname)
}

export function isTestEnvironment(): boolean {
    return isTestEnvironmentHost(window.location.host || '')
}
