import { useEffect, useRef } from 'react'
import { useDesignerStore } from '@/store/designer-store'

const STORAGE_KEY = 'subnet-designer-state'
const DEBOUNCE_MS = 1000

export function useDiagramPersistence() {
  const { nodes, edges, isDirty, loadFromStorage } = useDesignerStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoadedRef = useRef(false)

  // Load from localStorage on mount (only if no URL-provided nodes)
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    // Defer to allow URL sync hook to initialize first
    const timeout = setTimeout(() => {
      const currentNodes = useDesignerStore.getState().nodes
      if (currentNodes.length > 0) return // URL params took precedence

      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return

        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges) && parsed.nodes.length > 0) {
          loadFromStorage({ nodes: parsed.nodes, edges: parsed.edges })
        }
      } catch { /* noop */ }
    }, 100)

    return () => clearTimeout(timeout)
  }, [loadFromStorage])

  // Auto-save with debounce
  useEffect(() => {
    if (!isDirty || nodes.length === 0) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      try {
        const state = { nodes, edges, version: 1 }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch { /* noop */ }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [nodes, edges, isDirty])
}
