import type { Node, Edge } from '@xyflow/react'

const NODE_WIDTH = 220
const COLUMN_GAP = 40
const ROW_GAP = 80
const COLUMNS = 3

/**
 * Auto-layout: hierarchical BFS from root nodes (no incoming edges).
 * Places nodes in rows using a 3-column grid.
 * Only lays out top-level nodes (no parentId).
 */
export function autoLayout<T extends Node>(nodes: T[], edges: Edge[]): T[] {
  if (nodes.length === 0) return nodes

  // Check if we have container nodes — use nested layout if so
  const hasContainers = nodes.some((n) => {
    const data = n.data as Record<string, unknown>
    return data.type === 'vpc-container' || data.type === 'subnet-container'
  })

  if (hasContainers) {
    return autoLayoutNested(nodes, edges)
  }

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

/**
 * Nested auto-layout: separates top-level nodes from children,
 * runs BFS layout on top-level, then lays out children within each container.
 */
export function autoLayoutNested<T extends Node>(nodes: T[], edges: Edge[]): T[] {
  // Separate top-level nodes from children
  const topLevel = nodes.filter((n) => !n.parentId)
  const children = nodes.filter((n) => !!n.parentId)

  // Group children by parentId
  const childrenByParent = new Map<string, T[]>()
  for (const child of children) {
    const siblings = childrenByParent.get(child.parentId!) ?? []
    siblings.push(child)
    childrenByParent.set(child.parentId!, siblings)
  }

  // Layout top-level nodes using BFS
  const topEdges = edges.filter(
    (e) => topLevel.some((n) => n.id === e.source) && topLevel.some((n) => n.id === e.target),
  )

  const incomingMap = new Map<string, string[]>()
  const edgeChildrenMap = new Map<string, string[]>()

  for (const node of topLevel) {
    incomingMap.set(node.id, [])
    edgeChildrenMap.set(node.id, [])
  }

  for (const edge of topEdges) {
    incomingMap.get(edge.target)?.push(edge.source)
    edgeChildrenMap.get(edge.source)?.push(edge.target)
  }

  const roots = topLevel.filter((n) => (incomingMap.get(n.id)?.length ?? 0) === 0)
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

      const edgeChildren = edgeChildrenMap.get(id) ?? []
      for (const child of edgeChildren) {
        if (!visited.has(child)) {
          nextQueue.push(child)
        }
      }
    }

    if (layer.length > 0) layers.push(layer)
    queue = nextQueue
  }

  const unvisited = topLevel.filter((n) => !visited.has(n.id)).map((n) => n.id)
  if (unvisited.length > 0) layers.push(unvisited)

  // Position top-level nodes
  const topPositions = new Map<string, { x: number; y: number }>()
  let currentY = 0

  for (const layer of layers) {
    let currentX = 0
    let maxHeight = 0

    for (const id of layer) {
      const node = topLevel.find((n) => n.id === id)
      if (!node) continue

      const width = (node.style?.width as number) || NODE_WIDTH
      const height = (node.style?.height as number) || 100

      topPositions.set(id, { x: currentX, y: currentY })
      currentX += width + COLUMN_GAP
      if (height > maxHeight) maxHeight = height
    }

    currentY += maxHeight + ROW_GAP
  }

  // Layout children within containers
  const CHILD_PADDING = 20
  const CHILD_HEADER = 40
  const CHILD_GAP = 15
  const CHILD_COLS = 3
  const CHILD_WIDTH = 100
  const CHILD_HEIGHT = 60

  const childPositions = new Map<string, { x: number; y: number }>()

  for (const [parentId, parentChildren] of childrenByParent) {
    // Sub-containers (subnet-container inside vpc-container) get grid layout
    const subContainers = parentChildren.filter((c) => {
      const d = c.data as Record<string, unknown>
      return d.type === 'subnet-container'
    })
    const resources = parentChildren.filter((c) => {
      const d = c.data as Record<string, unknown>
      return d.type !== 'subnet-container'
    })

    let offsetY = CHILD_HEADER

    // Layout sub-containers in grid
    subContainers.forEach((child, i) => {
      const col = i % CHILD_COLS
      const row = Math.floor(i / CHILD_COLS)
      const childWidth = (child.style?.width as number) || 260
      const childHeight = (child.style?.height as number) || 160

      childPositions.set(child.id, {
        x: CHILD_PADDING + col * (childWidth + CHILD_GAP),
        y: offsetY + row * (childHeight + CHILD_GAP),
      })
    })

    if (subContainers.length > 0) {
      const subRows = Math.ceil(subContainers.length / CHILD_COLS)
      const subHeight = (subContainers[0]?.style?.height as number) || 160
      offsetY += subRows * (subHeight + CHILD_GAP)
    }

    // Layout resource children inside sub-containers or directly in parent
    resources.forEach((child, i) => {
      const col = i % CHILD_COLS
      const row = Math.floor(i / CHILD_COLS)

      childPositions.set(child.id, {
        x: CHILD_PADDING + col * (CHILD_WIDTH + CHILD_GAP),
        y: offsetY + row * (CHILD_HEIGHT + CHILD_GAP),
      })
    })

    // Also layout children of sub-containers
    for (const subContainer of subContainers) {
      const grandchildren = nodes.filter((n) => n.parentId === subContainer.id)
      grandchildren.forEach((gc, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        childPositions.set(gc.id, {
          x: CHILD_PADDING + col * (CHILD_WIDTH + CHILD_GAP),
          y: CHILD_HEADER + row * (CHILD_HEIGHT + CHILD_GAP),
        })
      })
    }

    // Recalculate parent container size if needed
    const parent = topLevel.find((n) => n.id === parentId)
    if (parent) {
      const allChildNodes = [...subContainers, ...resources]
      if (allChildNodes.length > 0) {
        let maxRight = 0
        let maxBottom = 0
        for (const child of allChildNodes) {
          const pos = childPositions.get(child.id) ?? child.position
          const w = (child.style?.width as number) || CHILD_WIDTH
          const h = (child.style?.height as number) || CHILD_HEIGHT
          if (pos.x + w > maxRight) maxRight = pos.x + w
          if (pos.y + h > maxBottom) maxBottom = pos.y + h
        }
        topPositions.set(parentId, topPositions.get(parentId)!)
      }
    }
  }

  // Apply positions
  return nodes.map((n) => {
    const topPos = topPositions.get(n.id)
    if (topPos) return { ...n, position: topPos }

    const childPos = childPositions.get(n.id)
    if (childPos) return { ...n, position: childPos }

    return n
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
