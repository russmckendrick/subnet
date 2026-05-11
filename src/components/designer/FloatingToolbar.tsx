import { useReactFlow } from '@xyflow/react'
import { useDesignerStore } from '@/store/designer-store'
import { CURRENT_STORAGE_VERSION } from '@/lib/diagram-migration'
import { TbZoomInArea } from 'react-icons/tb'
import { FaRegSave, FaFileExport, FaTrashAlt } from 'react-icons/fa'

const STORAGE_KEY = 'subnet-designer-state'

export function FloatingToolbar() {
  const { fitView } = useReactFlow()
  const { nodes, edges, cloudProvider, setExportOpen, clearDiagram } = useDesignerStore()

  const handleSave = () => {
    try {
      const state = { nodes, edges, cloudProvider, version: CURRENT_STORAGE_VERSION }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* noop */ }
  }

  if (nodes.length === 0) return null

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1.5 bg-[#eee8d5]/90 dark:bg-[#073642]/90 backdrop-blur-sm rounded-lg border border-[#93a1a1]/20 dark:border-[#586e75]/20 shadow-lg">
      {/* Fit View */}
      <button
        type="button"
        onClick={() => fitView({ padding: 0.2, maxZoom: 1.5 })}
        className="p-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] transition-colors"
        title="Fit View"
        aria-label="Fit diagram view"
      >
        <TbZoomInArea className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-[#93a1a1]/20 dark:bg-[#586e75]/20" />

      {/* Export */}
      <button
        type="button"
        onClick={() => setExportOpen(true)}
        className="p-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] transition-colors"
        title="Export Diagram"
        aria-label="Export diagram"
      >
        <FaFileExport className="w-4 h-4" />
      </button>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        className="p-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] transition-colors"
        title="Save to Local Storage"
        aria-label="Save diagram to local storage"
      >
        <FaRegSave className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-[#93a1a1]/20 dark:bg-[#586e75]/20" />

      {/* Clear */}
      <button
        type="button"
        onClick={clearDiagram}
        className="p-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#dc322f] hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] transition-colors"
        title="Clear Diagram"
        aria-label="Clear diagram"
      >
        <FaTrashAlt className="w-4 h-4" />
      </button>
    </div>
  )
}
