import { useEffect, useRef } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { readUrl, updateUrl, migrateHashUrl } from '@/lib/url-codec'
import { parseIPv4, inferDefaultPrefix } from '@/lib/ipv4'

export function useUrlSync() {
  const { rawInput, splitPrefixes, splitLabels, supernetInputs, activeDrawer, initFromUrl, setSupernetInputs } =
    useCalculatorStore()
  const initializedRef = useRef(false)

  // Read URL on mount (with hash migration for backward compat)
  useEffect(() => {
    migrateHashUrl()
    const state = readUrl()
    if (state) {
      if (state.mode === 'network' && state.cidr) {
        initFromUrl(state.cidr, state.splits, state.splitLabels)
      } else if (state.mode === 'supernet' && state.supernetInputs) {
        setSupernetInputs(state.supernetInputs.join('\n'))
      }
    }
    // Defer so the write-back effect (which runs in the same batch) still
    // sees false and skips — prevents overwriting the URL with stale closure
    // values before the store update triggers a re-render.  This also avoids
    // React Strict Mode's double-mount from reading an already-overwritten URL.
    queueMicrotask(() => { initializedRef.current = true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Write URL on state changes (skip until after initial read)
  useEffect(() => {
    if (!initializedRef.current) return

    if (activeDrawer === 'supernet') {
      const inputs = supernetInputs
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      if (inputs.length > 0) {
        updateUrl({ mode: 'supernet', cidr: '', supernetInputs: inputs })
        return
      }
    }

    if (rawInput) {
      // Normalize bare IPs by appending inferred prefix
      let cidr = rawInput
      if (!cidr.includes('/')) {
        const ip = parseIPv4(cidr.trim())
        if (ip !== null) {
          cidr = `${cidr.trim()}/${inferDefaultPrefix(ip)}`
        }
      }
      if (splitPrefixes.length > 0) {
        updateUrl({ mode: 'network', cidr, splits: splitPrefixes, splitLabels })
      } else {
        updateUrl({ mode: 'network', cidr })
      }
    }
  }, [rawInput, splitPrefixes, splitLabels, supernetInputs, activeDrawer])
}
