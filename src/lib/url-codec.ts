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

export function encodeState(state: UrlState): string {
  switch (state.mode) {
    case 'network': {
      if (state.splits && state.splits.length > 0) {
        const segments = state.splits.map((prefix, i) => {
          const label = state.splitLabels?.[i]
          return label ? `${prefix}~${encodeLabel(label)}` : `${prefix}`
        })
        return `${state.cidr}:${segments.join(',')}`
      }
      return state.cidr
    }
    case 'supernet':
      return `super:${state.supernetInputs?.join(',') ?? ''}`
    default:
      return state.cidr
  }
}

export function decodeState(hash: string): UrlState | null {
  const cleaned = hash.replace(/^#/, '').trim()
  if (!cleaned) return null

  // Legacy split: format — backward compatible
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

  // New unified format: CIDR or CIDR:splits
  // Check if there's a colon after a CIDR (e.g. 10.0.0.0/16:24~Label,25~Other)
  // A CIDR contains a slash, so find the first colon after the slash
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

  // Default: network mode, no splits
  return { mode: 'network', cidr: cleaned }
}

export function updateHash(state: UrlState): void {
  const encoded = encodeState(state)
  if (encoded) {
    window.history.replaceState(null, '', `#${encoded}`)
  }
}

export function readHash(): UrlState | null {
  return decodeState(window.location.hash)
}
