import { useDesignerStore } from '@/store/designer-store'
import { RESOURCE_ICONS } from './icons/NetworkIconRegistry'
import { CLOUD_ICON_MAPS } from './icons/cloud-icon-registry'
import { useTouchDetect } from '@/hooks/use-touch-detect'

interface PaletteItemProps {
  resourceType: string
  label: string
  compact?: boolean
  useCloudNode?: boolean
  /** Always use tap-to-place (overlay sheets, where dragging out is impossible). */
  forceTap?: boolean
}

export function PaletteItem({ resourceType, label, compact, useCloudNode, forceTap }: PaletteItemProps) {
  const cloudProvider = useDesignerStore((s) => s.cloudProvider)
  const pendingDrop = useDesignerStore((s) => s.pendingDrop)
  const setPendingDrop = useDesignerStore((s) => s.setPendingDrop)
  const isTouch = useTouchDetect() || forceTap === true

  // Direct record lookup — no function call during render
  const IconComponent = useCloudNode
    ? CLOUD_ICON_MAPS[cloudProvider][resourceType]
    : RESOURCE_ICONS[resourceType]

  const nodeType = useCloudNode ? 'cloudResourceNode' : 'resourceNode'

  const isArmed = pendingDrop?.resourceType === resourceType && pendingDrop?.nodeType === nodeType

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow-type', nodeType)
    e.dataTransfer.setData('application/reactflow-resource', resourceType)
    e.dataTransfer.setData('application/reactflow-label', label)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onTouchTap = () => {
    setPendingDrop({ nodeType, resourceType, label })
  }

  if (compact) {
    return (
      <div
        draggable={!isTouch}
        onDragStart={!isTouch ? onDragStart : undefined}
        onClick={isTouch ? onTouchTap : undefined}
        title={label}
        className={`group relative flex items-center justify-center mx-1 p-1.5 rounded-lg
          border transition-colors
          ${isArmed
            ? 'border-sol-cyan bg-sol-cyan/10'
            : 'border-transparent hover:border-sol-cyan/30 hover:bg-sol-cyan/5'}
          ${isTouch ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
      >
        {IconComponent && <IconComponent className="w-5 h-5" />}
        {/* Tooltip */}
        <span className="absolute left-full ml-2 px-2 py-1 text-[10px] font-medium
          text-sol-base1 bg-sol-base03 rounded whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {label}
        </span>
      </div>
    )
  }

  return (
    <div
      draggable={!isTouch}
      onDragStart={!isTouch ? onDragStart : undefined}
      onClick={isTouch ? onTouchTap : undefined}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border
        bg-well/50
        transition-colors
        ${isArmed
          ? 'border-sol-cyan bg-sol-cyan/10'
          : 'border-line/15 hover:border-sol-cyan/30 hover:bg-sol-cyan/5'}
        ${isTouch ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {IconComponent && <IconComponent className="w-5 h-5" />}
      <span className="text-xs font-medium text-ink">
        {label}
      </span>
    </div>
  )
}
