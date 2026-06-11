import { Handle, Position, NodeResizer } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'
import type { SubnetContainerNodeData } from '@/store/designer-store'
import { getCloudTheme } from '@/lib/cloud-theme'
import { NodeLabel } from './NodeLabel'

type SubnetContainerNodeProps = NodeProps<Node<SubnetContainerNodeData>>

export function SubnetContainerNode({ id, data, selected }: SubnetContainerNodeProps) {
  const theme = getCloudTheme(data.cloudProvider)
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div
      className="relative rounded-lg overflow-visible"
      style={{
        width: '100%',
        height: '100%',
        border: `2px dotted ${selected ? data.color : data.color + '99'}`,
        backgroundColor: isDark
          ? `${data.color}08`
          : `${data.color}06`,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={120}
        lineStyle={{ borderColor: data.color, borderWidth: 1 }}
        handleStyle={{ backgroundColor: data.color, width: 8, height: 8, borderRadius: 2 }}
      />

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: data.color }}
          />
          <NodeLabel
            nodeId={id}
            label={data.label}
            className="truncate text-xs font-semibold text-ink"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[10px] text-ink-muted">
            {data.cidr}
          </span>
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded"
            style={{
              color: theme.badgeColor,
              backgroundColor: theme.badgeBg,
            }}
          >
            {data.hosts.toLocaleString()} hosts
          </span>
        </div>
      </div>

      {/* Handles on all 4 sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2"
        style={{
          backgroundColor: data.color,
          borderColor: isDark ? '#073642' : '#eee8d5',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2"
        style={{
          backgroundColor: data.color,
          borderColor: isDark ? '#073642' : '#eee8d5',
        }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !border-2"
        style={{
          backgroundColor: data.color,
          borderColor: isDark ? '#073642' : '#eee8d5',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !border-2"
        style={{
          backgroundColor: data.color,
          borderColor: isDark ? '#073642' : '#eee8d5',
        }}
      />
    </div>
  )
}
