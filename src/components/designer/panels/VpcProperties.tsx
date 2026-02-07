import { useDesignerStore, type VpcContainerNodeData } from '@/store/designer-store'
import { getCloudTheme } from '@/lib/cloud-theme'

interface VpcPropertiesProps {
  nodeId: string
  data: VpcContainerNodeData
}

export function VpcProperties({ nodeId, data }: VpcPropertiesProps) {
  const { updateNodeLabel, nodes } = useDesignerStore()
  const theme = getCloudTheme(data.cloudProvider)

  const node = nodes.find((n) => n.id === nodeId)
  const width = (node?.style?.width as number) || 0
  const height = (node?.style?.height as number) || 0
  const childCount = nodes.filter((n) => n.parentId === nodeId).length

  return (
    <div className="space-y-5">
      {/* Provider badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{ color: theme.badgeColor, backgroundColor: theme.badgeBg }}
        >
          {theme.name}
        </span>
        <span
          className="text-xs font-semibold px-2 py-1 rounded"
          style={{ color: theme.badgeColor, backgroundColor: theme.badgeBg }}
        >
          {theme.vpcLabel}
        </span>
      </div>

      {/* CIDR */}
      <div>
        <label className="block text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-1.5">
          CIDR
        </label>
        <div className="font-mono text-sm font-bold text-[#586e75] dark:text-[#93a1a1] bg-[#eee8d5] dark:bg-[#073642] px-3 py-2 rounded-lg">
          {data.cidr}
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="block text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-1.5">
          Label
        </label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => updateNodeLabel(nodeId, e.target.value)}
          className="w-full text-sm text-[#586e75] dark:text-[#93a1a1] bg-[#eee8d5] dark:bg-[#073642] border border-[#93a1a1]/20 dark:border-[#586e75]/30 px-3 py-2 rounded-lg outline-none focus:border-[#2aa198] transition-colors"
        />
      </div>

      {/* Dimensions */}
      <div className="space-y-3 pt-2 border-t border-[#93a1a1]/15 dark:border-[#586e75]/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider">
            Dimensions
          </span>
          <span className="font-mono text-xs text-[#586e75] dark:text-[#93a1a1]">
            {Math.round(width)} × {Math.round(height)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider">
            Children
          </span>
          <span className="font-mono text-xs text-[#586e75] dark:text-[#93a1a1]">
            {childCount} nodes
          </span>
        </div>
      </div>
    </div>
  )
}
