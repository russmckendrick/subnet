import { useEffect, useRef } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { readHash, updateHash } from '@/lib/url-codec'

export function useUrlSync() {
  const { rawInput, splitPrefixes, splitLabels, supernetInputs, activeDrawer, initFromHash, setSupernetInputs } =
    useCalculatorStore()
  const initializedRef = useRef(false)

  // Read hash on mount
  useEffect(() => {
    const state = readHash()
    if (state) {
      if (state.mode === 'network' && state.cidr) {
        initFromHash(state.cidr, state.splits, state.splitLabels)
      } else if (state.mode === 'supernet' && state.supernetInputs) {
        setSupernetInputs(state.supernetInputs.join('\n'))
      }
    }
    initializedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Write hash on state changes (skip until after initial hash read)
  useEffect(() => {
    if (!initializedRef.current) return

    if (activeDrawer === 'supernet') {
      const inputs = supernetInputs
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      if (inputs.length > 0) {
        updateHash({ mode: 'supernet', cidr: '', supernetInputs: inputs })
        return
      }
    }

    if (rawInput) {
      if (splitPrefixes.length > 0) {
        updateHash({ mode: 'network', cidr: rawInput, splits: splitPrefixes, splitLabels })
      } else {
        updateHash({ mode: 'network', cidr: rawInput })
      }
    }
  }, [rawInput, splitPrefixes, splitLabels, supernetInputs, activeDrawer])
}
