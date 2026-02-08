import { Handle, Position } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'
import type { CloudResourceNodeData } from '@/store/designer-store'
import { CLOUD_ICON_MAPS } from '../icons/cloud-icon-registry'
import { NodeLabel } from './NodeLabel'

type CloudResourceNodeProps = NodeProps<Node<CloudResourceNodeData>>

export function CloudResourceNode({ id, data, selected }: CloudResourceNodeProps) {
  const isDark = document.documentElement.classList.contains('dark')
  const IconComponent = CLOUD_ICON_MAPS[data.cloudProvider][data.resourceType]

  return (
    <div
      className={`flex flex-col items-center rounded-lg border px-3 py-2 min-w-[80px] transition-shadow ${
        selected
          ? 'border-[#2aa198] shadow-lg shadow-[#2aa198]/20'
          : 'border-[#93a1a1]/20 dark:border-[#586e75]/30'
      }`}
      style={{
        backgroundColor: isDark ? '#073642' : '#eee8d5',
      }}
    >
      {IconComponent && (
        <div className="mb-1">
          <IconComponent className="w-7 h-7" />
        </div>
      )}

      <NodeLabel
        nodeId={id}
        label={data.label}
        className="text-[10px] font-semibold text-[#586e75] dark:text-[#93a1a1] max-w-[100px] text-center"
      />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#2aa198] !border-2"
        style={{ borderColor: isDark ? '#073642' : '#eee8d5' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#2aa198] !border-2"
        style={{ borderColor: isDark ? '#073642' : '#eee8d5' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-[#2aa198] !border-2"
        style={{ borderColor: isDark ? '#073642' : '#eee8d5' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-[#2aa198] !border-2"
        style={{ borderColor: isDark ? '#073642' : '#eee8d5' }}
      />
    </div>
  )
}
