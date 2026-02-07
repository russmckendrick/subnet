import { useEffect, useCallback } from 'react'
import { useDesignerStore } from '@/store/designer-store'

const STORAGE_KEY = 'subnet-designer-state'

export function useDesignerShortcuts() {
  const { setSelectedNodeId, setSelectedNodeIds, isExportOpen, setExportOpen, nodes, edges } = useDesignerStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      // Escape — deselect node
      if (e.key === 'Escape') {
        if (isExportOpen) {
          setExportOpen(false)
        } else {
          setSelectedNodeId(null)
          setSelectedNodeIds([])
        }
        return
      }

      const isModKey = e.metaKey || e.ctrlKey

      // Cmd/Ctrl+E — toggle export modal
      if (isModKey && e.key === 'e') {
        e.preventDefault()
        setExportOpen(!isExportOpen)
        return
      }

      // Cmd/Ctrl+S — save to localStorage
      if (isModKey && e.key === 's') {
        e.preventDefault()
        try {
          const state = { nodes, edges, version: 1 }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch { /* noop */ }
        return
      }
    },
    [isExportOpen, setExportOpen, setSelectedNodeId, setSelectedNodeIds, nodes, edges],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
