import { Handle, Position } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'
import type { ResourceNodeData } from '@/store/designer-store'
import { RESOURCE_ICONS } from '../icons/NetworkIcons'
import { NodeLabel } from './NodeLabel'

type ResourceNodeProps = NodeProps<Node<ResourceNodeData>>

export function ResourceNode({ id, data, selected }: ResourceNodeProps) {
  const IconComponent = RESOURCE_ICONS[data.resourceType]

  return (
    <div
      className={`flex flex-col items-center rounded-lg border bg-[#eee8d5] dark:bg-[#073642] px-4 py-3 min-w-[120px] transition-shadow ${
        selected
          ? 'border-[#2aa198] shadow-lg shadow-[#2aa198]/20'
          : 'border-[#93a1a1]/20 dark:border-[#586e75]/30'
      }`}
    >
      {IconComponent && (
        <div className="mb-1.5">
          <IconComponent className="w-8 h-8" />
        </div>
      )}

      <NodeLabel
        nodeId={id}
        label={data.label}
        className="text-xs font-semibold text-[#586e75] dark:text-[#93a1a1] max-w-[140px]"
      />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#2aa198] !border-2 !border-[#eee8d5] dark:!border-[#073642]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#2aa198] !border-2 !border-[#eee8d5] dark:!border-[#073642]"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-[#2aa198] !border-2 !border-[#eee8d5] dark:!border-[#073642]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-[#2aa198] !border-2 !border-[#eee8d5] dark:!border-[#073642]"
      />
    </div>
  )
}
