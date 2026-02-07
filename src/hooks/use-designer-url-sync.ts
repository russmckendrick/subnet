import { useEffect, useRef } from 'react'
import { parseCidr } from '@/lib/cidr'
import { allocateSubnets } from '@/lib/subnet-math'
import { generateInitialLayout } from '@/lib/diagram-layout'
import { useDesignerStore } from '@/store/designer-store'

/**
 * Parse ?from= and &split= URL params on mount, then initialize the designer
 * canvas with an auto-generated layout from splitter data.
 */
export function useDesignerUrlSync() {
  const { initFromLayout } = useDesignerStore()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const fromCidr = params.get('from')
    const splitParam = params.get('split')

    if (!fromCidr) return

    const parentResult = parseCidr(fromCidr)
    if (!parentResult) return

    // Parse splits (same format as calculator URL: prefix~label,prefix~label)
    const prefixes: number[] = []
    const labels: string[] = []

    if (splitParam) {
      for (const segment of splitParam.split(',')) {
        const [prefixStr, label] = segment.split('~')
        const p = Number(prefixStr)
        if (!isNaN(p) && p >= 0 && p <= 32) {
          prefixes.push(p)
          labels.push(label ? decodeURIComponent(label) : `Subnet ${prefixes.length}`)
        }
      }
    }

    if (prefixes.length === 0) return

    const splits = allocateSubnets(fromCidr, prefixes, labels)
    if (!splits || splits.length === 0) return

    const { nodes, edges } = generateInitialLayout(parentResult, splits)
    initFromLayout(nodes, edges)
  }, [initFromLayout])
}
