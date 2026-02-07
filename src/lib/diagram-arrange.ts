import type { Node, Edge } from '@xyflow/react'

const NODE_WIDTH = 220
const COLUMN_GAP = 40
const ROW_GAP = 80
const COLUMNS = 3

/**
 * Auto-layout: hierarchical BFS from root nodes (no incoming edges).
 * Places nodes in rows using a 3-column grid.
 */
export function autoLayout<T extends Node>(nodes: T[], edges: Edge[]): T[] {
  if (nodes.length === 0) return nodes

  const incomingMap = new Map<string, string[]>()
  const childrenMap = new Map<string, string[]>()

  for (const node of nodes) {
    incomingMap.set(node.id, [])
    childrenMap.set(node.id, [])
  }

  for (const edge of edges) {
    incomingMap.get(edge.target)?.push(edge.source)
    childrenMap.get(edge.source)?.push(edge.target)
  }

  // Find root nodes (no incoming edges)
  const roots = nodes.filter((n) => (incomingMap.get(n.id)?.length ?? 0) === 0)

  // BFS to assign layers
  const layers: string[][] = []
  const visited = new Set<string>()
  let queue = roots.map((n) => n.id)

  while (queue.length > 0) {
    const layer: string[] = []
    const nextQueue: string[] = []

    for (const id of queue) {
      if (visited.has(id)) continue
      visited.add(id)
      layer.push(id)

      const children = childrenMap.get(id) ?? []
      for (const child of children) {
        if (!visited.has(child)) {
          nextQueue.push(child)
        }
      }
    }

    if (layer.length > 0) {
      layers.push(layer)
    }
    queue = nextQueue
  }

  // Add any unvisited nodes (disconnected) to the last layer
  const unvisited = nodes.filter((n) => !visited.has(n.id)).map((n) => n.id)
  if (unvisited.length > 0) {
    layers.push(unvisited)
  }

  // Calculate positions
  const gridWidth = COLUMNS * NODE_WIDTH + (COLUMNS - 1) * COLUMN_GAP
  let currentY = 0

  const updatedPositions = new Map<string, { x: number; y: number }>()

  for (const layer of layers) {
    const layerWidth = Math.min(layer.length, COLUMNS)
    const startX = (gridWidth - (layerWidth * NODE_WIDTH + (layerWidth - 1) * COLUMN_GAP)) / 2

    layer.forEach((id, i) => {
      const col = i % COLUMNS
      const row = Math.floor(i / COLUMNS)
      updatedPositions.set(id, {
        x: startX + col * (NODE_WIDTH + COLUMN_GAP),
        y: currentY + row * (100 + ROW_GAP),
      })
    })

    const rowsInLayer = Math.ceil(layer.length / COLUMNS)
    currentY += rowsInLayer * (100 + ROW_GAP)
  }

  return nodes.map((n) => {
    const pos = updatedPositions.get(n.id)
    return pos ? { ...n, position: pos } : n
  })
}

export type AlignDirection = 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v'

/**
 * Align selected nodes along a given direction.
 */
export function alignNodes<T extends Node>(nodes: T[], selectedIds: string[], direction: AlignDirection): T[] {
  if (selectedIds.length < 2) return nodes

  const selected = nodes.filter((n) => selectedIds.includes(n.id))
  if (selected.length < 2) return nodes

  let targetValue: number

  switch (direction) {
    case 'left':
      targetValue = Math.min(...selected.map((n) => n.position.x))
      break
    case 'right':
      targetValue = Math.max(...selected.map((n) => n.position.x))
      break
    case 'top':
      targetValue = Math.min(...selected.map((n) => n.position.y))
      break
    case 'bottom':
      targetValue = Math.max(...selected.map((n) => n.position.y))
      break
    case 'center-h': {
      const minX = Math.min(...selected.map((n) => n.position.x))
      const maxX = Math.max(...selected.map((n) => n.position.x))
      targetValue = (minX + maxX) / 2
      break
    }
    case 'center-v': {
      const minY = Math.min(...selected.map((n) => n.position.y))
      const maxY = Math.max(...selected.map((n) => n.position.y))
      targetValue = (minY + maxY) / 2
      break
    }
  }

  const selectedSet = new Set(selectedIds)

  return nodes.map((n) => {
    if (!selectedSet.has(n.id)) return n

    switch (direction) {
      case 'left':
      case 'right':
      case 'center-h':
        return { ...n, position: { ...n.position, x: targetValue } }
      case 'top':
      case 'bottom':
      case 'center-v':
        return { ...n, position: { ...n.position, y: targetValue } }
    }
  })
}

/**
 * Distribute selected nodes evenly along an axis.
 */
export function distributeNodes<T extends Node>(nodes: T[], selectedIds: string[], axis: 'horizontal' | 'vertical'): T[] {
  if (selectedIds.length < 3) return nodes

  const selected = nodes.filter((n) => selectedIds.includes(n.id))
  if (selected.length < 3) return nodes

  const sorted = [...selected].sort((a, b) =>
    axis === 'horizontal' ? a.position.x - b.position.x : a.position.y - b.position.y,
  )

  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const startVal = axis === 'horizontal' ? first.position.x : first.position.y
  const endVal = axis === 'horizontal' ? last.position.x : last.position.y
  const step = (endVal - startVal) / (sorted.length - 1)

  const posMap = new Map<string, number>()
  sorted.forEach((n, i) => {
    posMap.set(n.id, startVal + i * step)
  })

  const selectedSet = new Set(selectedIds)

  return nodes.map((n) => {
    if (!selectedSet.has(n.id)) return n
    const val = posMap.get(n.id)
    if (val === undefined) return n

    return axis === 'horizontal'
      ? { ...n, position: { ...n.position, x: val } }
      : { ...n, position: { ...n.position, y: val } }
  })
}
