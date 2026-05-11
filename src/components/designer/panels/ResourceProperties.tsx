import { useDesignerStore, type ResourceNodeData } from '@/store/designer-store'
import { RESOURCE_TYPE_LABELS } from '@/lib/resource-labels'
import { RESOURCE_ICONS } from '../icons/NetworkIconRegistry'

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
          <div className="p-4 bg-[#eee8d5] dark:bg-[#073642] rounded-lg">
            <IconComponent className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Resource type */}
      <div>
        <label className="block text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-1.5">
          Type
        </label>
        <div className="text-sm text-[#586e75] dark:text-[#93a1a1] bg-[#eee8d5] dark:bg-[#073642] px-3 py-2 rounded-lg">
          {RESOURCE_TYPE_LABELS[data.resourceType] ?? data.resourceType}
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
    </div>
  )
}
