import { useDesignerStore, type ResourceNodeData } from '@/store/designer-store'
import { RESOURCE_TYPE_LABELS } from '@/lib/resource-labels'
import { RESOURCE_ICONS } from '../icons/NetworkIconRegistry'
import { Input } from '@/components/shared/Input'
import { SectionLabel, LabelValue } from '@/components/shared/LabelValue'

interface ResourcePropertiesProps {
  nodeId: string
  data: ResourceNodeData
}

export function ResourceProperties({ nodeId, data }: ResourcePropertiesProps) {
  const { updateNodeLabel } = useDesignerStore()
  const IconComponent = RESOURCE_ICONS[data.resourceType]

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
