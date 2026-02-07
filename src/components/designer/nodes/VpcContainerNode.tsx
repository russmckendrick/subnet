import { Handle, Position } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'
import type { VpcContainerNodeData } from '@/store/designer-store'
import { getCloudTheme } from '@/lib/cloud-theme'
import { NodeLabel } from './NodeLabel'

type VpcContainerNodeProps = NodeProps<Node<VpcContainerNodeData>>

export function VpcContainerNode({ id, data, selected }: VpcContainerNodeProps) {
  const theme = getCloudTheme(data.cloudProvider)
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div
      className="relative rounded-lg overflow-visible"
      style={{
        width: '100%',
        height: '100%',
        border: `2px ${theme.borderStyle} ${selected ? theme.borderColor : theme.borderColor + '99'}`,
        backgroundColor: isDark ? theme.bgTintDark : theme.bgTint,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: theme.badgeColor, backgroundColor: theme.badgeBg }}
          >
            {theme.vpcLabel}
          </span>
          <NodeLabel
            nodeId={id}
            label={data.label}
            className="text-xs font-semibold text-[#586e75] dark:text-[#93a1a1]"
          />
        </div>
        <span className="font-mono text-[10px] text-[#93a1a1] dark:text-[#586e75]">
          {data.cidr}
        </span>
      </div>

      {/* Handles on all 4 sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !border-2"
        style={{
          backgroundColor: theme.borderColor,
          borderColor: isDark ? '#002b36' : '#fdf6e3',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !border-2"
        style={{
          backgroundColor: theme.borderColor,
          borderColor: isDark ? '#002b36' : '#fdf6e3',
        }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !border-2"
        style={{
          backgroundColor: theme.borderColor,
          borderColor: isDark ? '#002b36' : '#fdf6e3',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !border-2"
        style={{
          backgroundColor: theme.borderColor,
          borderColor: isDark ? '#002b36' : '#fdf6e3',
        }}
      />
    </div>
  )
}
