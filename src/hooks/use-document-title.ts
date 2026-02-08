import { useEffect } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'

const BASE_TITLE = 'subnet.fit — CIDR Calculator & Network Planner'

export function useDocumentTitle() {
  const result = useCalculatorStore((s) => s.result)
  const splitPrefixes = useCalculatorStore((s) => s.splitPrefixes)
  const activeDrawer = useCalculatorStore((s) => s.activeDrawer)

  useEffect(() => {
    if (activeDrawer === 'supernet') {
      document.title = 'Supernet Calculator — subnet.fit'
      return
    }

    if (!result) {
      document.title = BASE_TITLE
      return
    }

    if (splitPrefixes.length > 0) {
      document.title = `${result.input} Subnet Splitter — subnet.fit`
      return
    }

    document.title = `${result.input} — subnet.fit`
  }, [result, splitPrefixes, activeDrawer])
}
