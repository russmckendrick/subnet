import { useDesignerStore } from '@/store/designer-store'
import { RESOURCE_ICONS } from './icons/NetworkIcons'
import { CLOUD_ICON_MAPS } from './icons/cloud-icon-registry'

interface PaletteItemProps {
  resourceType: string
  label: string
  compact?: boolean
  useCloudNode?: boolean
}

export function PaletteItem({ resourceType, label, compact, useCloudNode }: PaletteItemProps) {
  const cloudProvider = useDesignerStore((s) => s.cloudProvider)

  // Direct record lookup — no function call during render
  const IconComponent = useCloudNode
    ? CLOUD_ICON_MAPS[cloudProvider][resourceType]
    : RESOURCE_ICONS[resourceType]

  const nodeType = useCloudNode ? 'cloudResourceNode' : 'resourceNode'

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow-type', nodeType)
    e.dataTransfer.setData('application/reactflow-resource', resourceType)
    e.dataTransfer.setData('application/reactflow-label', label)
    e.dataTransfer.effectAllowed = 'move'
  }

  if (compact) {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        title={label}
        className="group relative flex items-center justify-center mx-1 p-1.5 rounded-lg
          border border-transparent
          hover:border-[#2aa198]/30 hover:bg-[#2aa198]/5
          cursor-grab active:cursor-grabbing transition-colors"
      >
        {IconComponent && <IconComponent className="w-5 h-5" />}
        {/* Tooltip */}
        <span className="absolute left-full ml-2 px-2 py-1 text-[10px] font-medium
          text-[#93a1a1] bg-[#002b36] rounded whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {label}
        </span>
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[#93a1a1]/15 dark:border-[#586e75]/20
        bg-[#fdf6e3]/50 dark:bg-[#002b36]/30
        hover:border-[#2aa198]/30 hover:bg-[#2aa198]/5
        cursor-grab active:cursor-grabbing transition-colors"
    >
      {IconComponent && <IconComponent className="w-5 h-5" />}
      <span className="text-xs font-medium text-[#586e75] dark:text-[#93a1a1]">
        {label}
      </span>
    </div>
  )
}
