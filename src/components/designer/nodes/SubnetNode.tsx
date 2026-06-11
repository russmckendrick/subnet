import { Handle, Position } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'
import type { SubnetNodeData } from '@/store/designer-store'
import { NodeLabel } from './NodeLabel'

type SubnetNodeProps = NodeProps<Node<SubnetNodeData>>

export function SubnetNode({ id, data, selected }: SubnetNodeProps) {
  return (
    <div
      className={`relative rounded-lg border bg-surface overflow-hidden min-w-[200px] transition-shadow ${
        selected
          ? 'border-sol-cyan shadow-lg shadow-sol-cyan/20'
          : 'border-line/20'
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
          className="text-xs font-semibold text-ink mb-1"
        />
        <div className="font-mono text-sm font-bold text-ink">
          {data.cidr}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-[10px] text-ink-muted">
            {data.hosts.toLocaleString()} hosts
          </span>
          <span className="font-mono text-[10px] text-ink-muted">
            {data.networkAddress}
          </span>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-sol-cyan !border-2 !border-surface"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-sol-cyan !border-2 !border-surface"
      />
    </div>
  )
}
