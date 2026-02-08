import { useDesignerStore } from '@/store/designer-store'
import type { ActiveLayer } from '@/store/designer-store'

const LAYERS: { id: ActiveLayer; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'infrastructure', label: 'Infra' },
  { id: 'resources', label: 'Resources' },
]

export function LayerToggle() {
  const { activeLayer, setActiveLayer } = useDesignerStore()

  return (
    <div className="flex gap-0.5 bg-[#eee8d5]/50 dark:bg-[#073642]/50 rounded-lg p-0.5">
      {LAYERS.map((layer) => {
        const isActive = activeLayer === layer.id
        return (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`text-[10px] font-semibold px-2 py-1.5 rounded transition-all ${
              isActive
                ? 'bg-[#2aa198]/15 text-[#2aa198]'
                : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1]'
            }`}
          >
            {layer.label}
          </button>
        )
      })}
    </div>
  )
}
