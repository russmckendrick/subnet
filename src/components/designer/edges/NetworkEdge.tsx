import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

export function NetworkEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  })

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: '#2aa198',
        strokeWidth: selected ? 3 : 2,
        opacity: selected ? 1 : 0.7,
        transition: 'stroke-width 0.15s, opacity 0.15s',
      }}
    />
  )
}
