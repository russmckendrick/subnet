import { useEffect, useRef } from 'react'
import { parseCidr } from '@/lib/cidr'
import { allocateSubnets } from '@/lib/subnet-math'
import { generateInitialLayout } from '@/lib/diagram-layout'
import { useDesignerStore } from '@/store/designer-store'
import type { CloudProvider } from '@/lib/cloud-theme'

const VALID_PROVIDERS = new Set<CloudProvider>(['aws', 'azure', 'gcp', 'generic'])

/**
 * Parse ?from=, &split=, and &provider= URL params on mount,
 * then initialize the designer canvas with an auto-generated layout.
 */
export function useDesignerUrlSync() {
  const { initFromLayout, setCloudProvider } = useDesignerStore()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const fromCidr = params.get('from')
    const splitParam = params.get('split')
    const providerParam = params.get('provider') as CloudProvider | null

    // Set cloud provider if specified
    const provider: CloudProvider =
      providerParam && VALID_PROVIDERS.has(providerParam) ? providerParam : 'generic'

    if (provider !== 'generic') {
      setCloudProvider(provider)
    }

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

    const { nodes, edges } = generateInitialLayout(parentResult, splits, provider)
    initFromLayout(nodes, edges)
  }, [initFromLayout, setCloudProvider])
}
