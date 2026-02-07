import { useDesignerStore, type CloudResourceNodeData } from '@/store/designer-store'
import { getCloudTheme } from '@/lib/cloud-theme'
import { RESOURCE_TYPE_LABELS } from '@/lib/resource-labels'
import { CLOUD_ICON_MAPS } from '../icons/cloud-icon-registry'

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
          <div className="p-4 bg-[#eee8d5] dark:bg-[#073642] rounded-lg">
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
