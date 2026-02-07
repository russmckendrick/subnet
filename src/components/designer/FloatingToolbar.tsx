import { useReactFlow } from '@xyflow/react'
import { useDesignerStore } from '@/store/designer-store'

const STORAGE_KEY = 'subnet-designer-state'

export function FloatingToolbar() {
  const { fitView } = useReactFlow()
  const { nodes, edges, setExportOpen, clearDiagram } = useDesignerStore()

  const handleSave = () => {
    try {
      const state = { nodes, edges, version: 1 }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* noop */ }
  }

  if (nodes.length === 0) return null

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1.5 bg-[#eee8d5]/90 dark:bg-[#073642]/90 backdrop-blur-sm rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 shadow-lg">
      {/* Fit View */}
      <button
        onClick={() => fitView({ padding: 0.2, maxZoom: 1.5 })}
        className="p-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] transition-colors"
        title="Fit View"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      </button>

      <div className="w-px h-5 bg-[#93a1a1]/20 dark:bg-[#586e75]/20" />

      {/* Export */}
      <button
        onClick={() => setExportOpen(true)}
        className="p-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] transition-colors"
        title="Export Diagram"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        className="p-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] transition-colors"
        title="Save to Local Storage"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </button>

      <div className="w-px h-5 bg-[#93a1a1]/20 dark:bg-[#586e75]/20" />

      {/* Clear */}
      <button
        onClick={clearDiagram}
        className="p-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#dc322f] hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] transition-colors"
        title="Clear Diagram"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </div>
  )
}
