import { useEffect, useRef } from 'react'
import { useDesignerStore, type DesignerNodeData } from '@/store/designer-store'
import { migrateDiagramState, CURRENT_STORAGE_VERSION } from '@/lib/diagram-migration'
import { buildDesignerUrl } from '@/lib/designer-state-extract'
import type { Node } from '@xyflow/react'

const STORAGE_KEY = 'subnet-designer-state'
const DEBOUNCE_MS = 1000

export function useDiagramPersistence() {
  const { nodes, edges, cloudProvider, isDirty, loadFromStorage } = useDesignerStore()
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
          const migrated = migrateDiagramState(parsed)
          const provider = migrated.cloudProvider as 'aws' | 'azure' | 'gcp' | 'generic'
          loadFromStorage({
            nodes: migrated.nodes as Node<DesignerNodeData>[],
            edges: migrated.edges,
            cloudProvider: provider,
          })
          // Reflect the loaded diagram in the URL so refresh/bookmark keeps context
          history.replaceState(null, '', buildDesignerUrl(migrated.nodes as Node<DesignerNodeData>[], provider))
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
        const state = { nodes, edges, cloudProvider, version: CURRENT_STORAGE_VERSION }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        // Keep the URL canonical with the diagram so refresh/bookmark keeps context
        history.replaceState(null, '', buildDesignerUrl(nodes, cloudProvider))
      } catch { /* noop */ }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [nodes, edges, cloudProvider, isDirty])
}
