import { useDesignerStore, type VpcContainerNodeData } from '@/store/designer-store'
import { getCloudTheme } from '@/lib/cloud-theme'
import { Input } from '@/components/shared/Input'
import { SectionLabel, LabelValue } from '@/components/shared/LabelValue'

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
      <LabelValue label="CIDR">{data.cidr}</LabelValue>

      {/* Label */}
      <div>
        <SectionLabel className="mb-1.5">Label</SectionLabel>
        <Input
          type="text"
          value={data.label}
          onChange={(e) => updateNodeLabel(nodeId, e.target.value)}
        />
      </div>

      {/* Dimensions */}
      <div className="space-y-3 pt-2 border-t border-line/15">
        <LabelValue label="Dimensions">
          {Math.round(width)} × {Math.round(height)}
        </LabelValue>
        <LabelValue label="Children">{childCount} nodes</LabelValue>
      </div>
    </div>
  )
}
