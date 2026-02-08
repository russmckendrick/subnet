import { useMemo } from 'react'
import { useDesignerStore } from '@/store/designer-store'
import { extractDesignerState } from '@/lib/designer-state-extract'
import { encodeState } from '@/lib/url-codec'

/**
 * Returns a calculator URL that preserves the current designer state.
 * Falls back to '/' when no extractable state exists.
 */
export function useCalculatorHref(): string {
  const nodes = useDesignerStore((s) => s.nodes)
  const cloudProvider = useDesignerStore((s) => s.cloudProvider)

  return useMemo(() => {
    const extracted = extractDesignerState(nodes, cloudProvider)
    if (!extracted.cidr) return '/'

    return encodeState({
      mode: 'network',
      cidr: extracted.cidr,
      splits: extracted.splits.map((s) => s.prefix),
      splitLabels: extracted.splits.map((s) => s.label),
    })
  }, [nodes, cloudProvider])
}
