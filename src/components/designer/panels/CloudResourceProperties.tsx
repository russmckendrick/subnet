import { useDesignerStore, type CloudResourceNodeData } from '@/store/designer-store'
import { getCloudTheme } from '@/lib/cloud-theme'
import { RESOURCE_TYPE_LABELS } from '@/lib/resource-labels'
import { CLOUD_ICON_MAPS } from '../icons/cloud-icon-registry'
import { Input } from '@/components/shared/Input'
import { SectionLabel, LabelValue } from '@/components/shared/LabelValue'

interface CloudResourcePropertiesProps {
  nodeId: string
  data: CloudResourceNodeData
}

export function CloudResourceProperties({ nodeId, data }: CloudResourcePropertiesProps) {
  const { updateNodeLabel } = useDesignerStore()
  const theme = getCloudTheme(data.cloudProvider)
  const IconComponent = CLOUD_ICON_MAPS[data.cloudProvider][data.resourceType]

  return (
    <div className="space-y-5">
      {/* Icon preview */}
      <div className="flex items-center justify-center py-4">
        {IconComponent && (
          <div className="p-4 bg-surface rounded-lg">
            <IconComponent className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Provider badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{ color: theme.badgeColor, backgroundColor: theme.badgeBg }}
        >
          {theme.name}
        </span>
      </div>

      {/* Resource type */}
      <LabelValue label="Type" mono={false}>
        {RESOURCE_TYPE_LABELS[data.resourceType] ?? data.resourceType}
      </LabelValue>

      {/* Label */}
      <div>
        <SectionLabel className="mb-1.5">Label</SectionLabel>
        <Input
          type="text"
          value={data.label}
          onChange={(e) => updateNodeLabel(nodeId, e.target.value)}
        />
      </div>
    </div>
  )
}
