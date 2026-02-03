export interface UrlState {
  mode: 'calculator' | 'splitter' | 'supernet'
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
    case 'calculator':
      return state.cidr
    case 'splitter': {
      const segments = state.splits?.map((prefix, i) => {
        const label = state.splitLabels?.[i]
        return label ? `${prefix}~${encodeLabel(label)}` : `${prefix}`
      }) ?? []
      return `split:${state.cidr}:${segments.join(',')}`
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
    return { mode: 'splitter', cidr, splits, splitLabels }
  }

  if (cleaned.startsWith('super:')) {
    const inputs = cleaned.slice(6).split(',').filter(Boolean)
    return { mode: 'supernet', cidr: '', supernetInputs: inputs }
  }

  // Default: calculator mode
  return { mode: 'calculator', cidr: cleaned }
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
