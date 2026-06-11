import { useReactFlow } from '@xyflow/react'
import { useDesignerStore } from '@/store/designer-store'
import { CURRENT_STORAGE_VERSION } from '@/lib/diagram-migration'
import { IconButton } from '@/components/shared/Button'
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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1.5 bg-surface/90 backdrop-blur-sm rounded-lg border border-line/20 shadow-lg">
      {/* Fit View */}
      <IconButton
        variant="ghost"
        onClick={() => fitView({ padding: 0.2, maxZoom: 1.5 })}
        title="Fit View"
        aria-label="Fit diagram view"
      >
        <TbZoomInArea className="w-4 h-4" />
      </IconButton>

      <div className="w-px h-5 bg-line/20" />

      {/* Export */}
      <IconButton
        variant="ghost"
        onClick={() => setExportOpen(true)}
        title="Export Diagram"
        aria-label="Export diagram"
      >
        <FaFileExport className="w-4 h-4" />
      </IconButton>

      {/* Save */}
      <IconButton
        variant="ghost"
        onClick={handleSave}
        title="Save to Local Storage"
        aria-label="Save diagram to local storage"
      >
        <FaRegSave className="w-4 h-4" />
      </IconButton>

      <div className="w-px h-5 bg-line/20" />

      {/* Clear */}
      <IconButton
        variant="danger"
        onClick={clearDiagram}
        title="Clear Diagram"
        aria-label="Clear diagram"
      >
        <FaTrashAlt className="w-4 h-4" />
      </IconButton>
    </div>
  )
}
