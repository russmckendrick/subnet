import { useEffect, useRef } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { readHash, updateHash } from '@/lib/url-codec'

export function useUrlSync() {
  const { rawInput, activeTab, splitPrefixes, splitLabels, supernetInputs, parentCidr, initFromHash } =
    useCalculatorStore()
  const initializedRef = useRef(false)

  // Read hash on mount
  useEffect(() => {
    const state = readHash()
    if (state) {
      if (state.mode === 'calculator' && state.cidr) {
        initFromHash(state.cidr, 'calculator')
      } else if (state.mode === 'splitter' && state.cidr) {
        initFromHash(state.cidr, 'splitter', state.splits, state.splitLabels)
      }
    }
    initializedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Write hash on state changes (skip until after initial hash read)
  useEffect(() => {
    if (!initializedRef.current) return

    if (activeTab === 'calculator' && rawInput) {
      updateHash({ mode: 'calculator', cidr: rawInput })
    } else if (activeTab === 'splitter' && parentCidr) {
      updateHash({ mode: 'splitter', cidr: parentCidr, splits: splitPrefixes, splitLabels })
    } else if (activeTab === 'supernet') {
      const inputs = supernetInputs
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      if (inputs.length > 0) {
        updateHash({ mode: 'supernet', cidr: '', supernetInputs: inputs })
      }
    }
  }, [rawInput, activeTab, splitPrefixes, splitLabels, supernetInputs, parentCidr])
}
