export interface UrlState {
  mode: 'network' | 'supernet'
  cidr: string
  splits?: number[]
  splitLabels?: string[]
  supernetInputs?: string[]
}

function encodeLabel(label: string): string {
  return encodeURIComponent(label)
}

function decodeLabel(encoded: string): string {
  try {
    return decodeURIComponent(encoded)
  } catch {
    return encoded
  }
}

import { parseIPv4, inferDefaultPrefix } from './ipv4'

// CIDR pattern: digits.digits.digits.digits/digits
const CIDR_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/

// Bare IP pattern (no prefix): digits.digits.digits.digits
const IP_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/

/**
 * Encode state as a path + query string.
 *
 * - Network, no splits: `/10.0.0.0/16`
 * - Network, with splits: `/10.0.0.0/16?split=24~Web,25~API`
 * - Supernet: `/super?nets=10.0.0.0/24,10.0.1.0/24`
 */
export function encodeState(state: UrlState): string {
  switch (state.mode) {
    case 'network': {
      const path = `/${state.cidr}`
      if (state.splits && state.splits.length > 0) {
        const segments = state.splits.map((prefix, i) => {
          const label = state.splitLabels?.[i]
          return label ? `${prefix}~${encodeLabel(label)}` : `${prefix}`
        })
        return `${path}?split=${segments.join(',')}`
      }
      return path
    }
    case 'supernet':
      return `/super?nets=${state.supernetInputs?.join(',') ?? ''}`
    default:
      return `/${state.cidr}`
  }
}

/**
 * Decode state from pathname + search string.
 *
 * - `/super` + `?nets=...` → supernet mode
 * - `/10.0.0.0/16` + optional `?split=...` → network mode
 * - `/` → null (home, no state to restore)
 */
export function decodeState(pathname: string, search: string): UrlState | null {
  const path = pathname.replace(/^\//, '').trim()
  if (!path) return null

  // Supernet mode
  if (path === 'super') {
    const params = new URLSearchParams(search)
    const nets = params.get('nets')
    const inputs = nets ? nets.split(',').filter(Boolean) : []
    return inputs.length > 0
      ? { mode: 'supernet', cidr: '', supernetInputs: inputs }
      : null
  }

  // Network mode — validate as CIDR
  if (!CIDR_PATTERN.test(path)) {
    // Bare IP fallback — infer prefix from trailing zeros
    if (IP_PATTERN.test(path)) {
      const ip = parseIPv4(path)
      if (ip !== null) {
        const prefix = inferDefaultPrefix(ip)
        const cidr = `${path}/${prefix}`
        const params = new URLSearchParams(search)
        const splitParam = params.get('split')

        if (splitParam) {
          const splits: number[] = []
          const splitLabels: string[] = []
          for (const segment of splitParam.split(',')) {
            const [prefixStr, label] = segment.split('~')
            const p = Number(prefixStr)
            if (!isNaN(p) && p >= 0 && p <= 32) {
              splits.push(p)
              splitLabels.push(label ? decodeLabel(label) : `Subnet ${splits.length}`)
            }
          }
          if (splits.length > 0) {
            return { mode: 'network', cidr, splits, splitLabels }
          }
        }

        return { mode: 'network', cidr }
      }
    }
    return null
  }

  const cidr = path
  const params = new URLSearchParams(search)
  const splitParam = params.get('split')

  if (splitParam) {
    const splits: number[] = []
    const splitLabels: string[] = []
    for (const segment of splitParam.split(',')) {
      const [prefixStr, label] = segment.split('~')
      const prefix = Number(prefixStr)
      if (!isNaN(prefix) && prefix >= 0 && prefix <= 32) {
        splits.push(prefix)
        splitLabels.push(label ? decodeLabel(label) : `Subnet ${splits.length}`)
      }
    }
    if (splits.length > 0) {
      return { mode: 'network', cidr, splits, splitLabels }
    }
  }

  return { mode: 'network', cidr }
}

/**
 * Write current state to the URL using history.replaceState.
 */
export function updateUrl(state: UrlState): void {
  const encoded = encodeState(state)
  if (encoded) {
    window.history.replaceState(null, '', encoded)
  }
}

/**
 * Read current state from window.location pathname + search.
 */
export function readUrl(): UrlState | null {
  return decodeState(window.location.pathname, window.location.search)
}

// --- Backward compatibility: hash URL migration ---

/**
 * Decode a legacy hash-based URL state.
 * Supports old formats: `#10.0.0.0/16`, `#10.0.0.0/16:24~Web,25~API`,
 * `#split:10.0.0.0/16:24~Web,25~API`, `#super:10.0.0.0/24,10.0.1.0/24`
 */
function decodeHashState(hash: string): UrlState | null {
  const cleaned = hash.replace(/^#/, '').trim()
  if (!cleaned) return null

  // Legacy split: format
  if (cleaned.startsWith('split:')) {
    const parts = cleaned.slice(6).split(':')
    const cidr = parts[0] ?? ''
    const splits: number[] = []
    const splitLabels: string[] = []
    if (parts[1]) {
      for (const segment of parts[1].split(',')) {
        const [prefixStr, label] = segment.split('~')
        const prefix = Number(prefixStr)
        if (!isNaN(prefix) && prefix >= 0 && prefix <= 32) {
          splits.push(prefix)
          splitLabels.push(label ? decodeLabel(label) : `Subnet ${splits.length}`)
        }
      }
    }
    return { mode: 'network', cidr, splits, splitLabels }
  }

  if (cleaned.startsWith('super:')) {
    const inputs = cleaned.slice(6).split(',').filter(Boolean)
    return { mode: 'supernet', cidr: '', supernetInputs: inputs }
  }

  // Unified format: CIDR or CIDR:splits
  const slashIdx = cleaned.indexOf('/')
  if (slashIdx !== -1) {
    const colonIdx = cleaned.indexOf(':', slashIdx)
    if (colonIdx !== -1) {
      const cidr = cleaned.slice(0, colonIdx)
      const splitsPart = cleaned.slice(colonIdx + 1)
      const splits: number[] = []
      const splitLabels: string[] = []
      if (splitsPart) {
        for (const segment of splitsPart.split(',')) {
          const [prefixStr, label] = segment.split('~')
          const prefix = Number(prefixStr)
          if (!isNaN(prefix) && prefix >= 0 && prefix <= 32) {
            splits.push(prefix)
            splitLabels.push(label ? decodeLabel(label) : `Subnet ${splits.length}`)
          }
        }
      }
      if (splits.length > 0) {
        return { mode: 'network', cidr, splits, splitLabels }
      }
    }
  }

  return { mode: 'network', cidr: cleaned }
}

/**
 * Migrate a legacy hash-based URL to the new path-based format.
 * Returns true if a migration was performed.
 */
export function migrateHashUrl(): boolean {
  const hash = window.location.hash
  if (!hash || hash === '#') return false

  const state = decodeHashState(hash)
  if (!state) return false

  const newPath = encodeState(state)
  window.history.replaceState(null, '', newPath)
  return true
}
