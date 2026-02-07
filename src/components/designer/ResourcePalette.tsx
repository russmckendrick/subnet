import { useDesignerStore } from '@/store/designer-store'
import { PaletteItem } from './PaletteItem'
import type { ResourceType } from '@/store/designer-store'

interface PaletteCategory {
  name: string
  items: { type: ResourceType; label: string }[]
}

const CATEGORIES: PaletteCategory[] = [
  {
    name: 'Network',
    items: [
      { type: 'router', label: 'Router' },
      { type: 'switch', label: 'Switch' },
      { type: 'firewall', label: 'Firewall' },
      { type: 'load-balancer', label: 'Load Balancer' },
      { type: 'internet-gateway', label: 'Internet Gateway' },
    ],
  },
  {
    name: 'Compute',
    items: [
      { type: 'server', label: 'Server' },
      { type: 'database', label: 'Database' },
    ],
  },
  {
    name: 'Cloud',
    items: [
      { type: 'vpc', label: 'VPC / VNet' },
      { type: 'cloud', label: 'Cloud' },
    ],
  },
]

export function ResourcePalette() {
  const { isPaletteOpen, setIsPaletteOpen } = useDesignerStore()

  // Collapsed: icon-only strip
  if (!isPaletteOpen) {
    return (
      <div className="shrink-0 border-r border-[#93a1a1]/15 dark:border-[#586e75]/20 bg-[#fdf6e3] dark:bg-[#002b36] w-12 flex flex-col">
        {/* Expand button */}
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="flex items-center justify-center py-2.5 border-b border-[#93a1a1]/15 dark:border-[#586e75]/20 hover:bg-[#eee8d5] dark:hover:bg-[#073642] transition-colors"
          aria-label="Expand palette"
        >
          <svg className="w-3.5 h-3.5 text-[#93a1a1] dark:text-[#586e75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Icon-only items */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {CATEGORIES.map((category) =>
            category.items.map((item) => (
              <PaletteItem
                key={item.type}
                resourceType={item.type}
                label={item.label}
                compact
              />
            )),
          )}
        </div>
      </div>
    )
  }

  // Expanded: full labels
  return (
    <div className="shrink-0 border-r border-[#93a1a1]/15 dark:border-[#586e75]/20 bg-[#fdf6e3] dark:bg-[#002b36] w-56 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#93a1a1]/15 dark:border-[#586e75]/20">
        <span className="text-xs font-semibold text-[#586e75] dark:text-[#93a1a1] uppercase tracking-wider">
          Resources
        </span>
        <button
          onClick={() => setIsPaletteOpen(false)}
          className="p-1 rounded hover:bg-[#eee8d5] dark:hover:bg-[#073642] transition-colors"
          aria-label="Collapse palette"
        >
          <svg className="w-3.5 h-3.5 text-[#93a1a1] dark:text-[#586e75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {CATEGORIES.map((category) => (
          <div key={category.name}>
            <h4 className="text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-2">
              {category.name}
            </h4>
            <div className="space-y-1.5">
              {category.items.map((item) => (
                <PaletteItem
                  key={item.type}
                  resourceType={item.type}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="px-3 py-2 border-t border-[#93a1a1]/15 dark:border-[#586e75]/20">
        <p className="text-[10px] text-[#93a1a1] dark:text-[#586e75]">
          Drag items onto the canvas to add them to your diagram.
        </p>
      </div>
    </div>
  )
}
