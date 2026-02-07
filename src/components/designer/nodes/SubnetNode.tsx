import { Handle, Position } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'
import type { SubnetNodeData } from '@/store/designer-store'
import { NodeLabel } from './NodeLabel'

type SubnetNodeProps = NodeProps<Node<SubnetNodeData>>

export function SubnetNode({ id, data, selected }: SubnetNodeProps) {
  return (
    <div
      className={`relative rounded-lg border bg-[#eee8d5] dark:bg-[#073642] overflow-hidden min-w-[200px] transition-shadow ${
        selected
          ? 'border-[#2aa198] shadow-lg shadow-[#2aa198]/20'
          : 'border-[#93a1a1]/20 dark:border-[#586e75]/30'
      }`}
    >
      {/* Color bar */}
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: data.color }}
      />

      {/* Content */}
      <div className="pl-4 pr-3 py-2.5">
        <NodeLabel
          nodeId={id}
          label={data.label}
          className="text-xs font-semibold text-[#586e75] dark:text-[#93a1a1] mb-1"
        />
        <div className="font-mono text-sm font-bold text-[#586e75] dark:text-[#93a1a1]">
          {data.cidr}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-[10px] text-[#93a1a1] dark:text-[#586e75]">
            {data.hosts.toLocaleString()} hosts
          </span>
          <span className="font-mono text-[10px] text-[#93a1a1] dark:text-[#586e75]">
            {data.networkAddress}
          </span>
        </div>
      </div>

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
    </div>
  )
}
