import type { Node } from '@xyflow/react'

const CONTAINER_PADDING = 20
const HEADER_HEIGHT = 36
const MIN_CONTAINER_WIDTH = 300
const MIN_CONTAINER_HEIGHT = 200
const CHILD_NODE_WIDTH = 100
const CHILD_NODE_HEIGHT = 60

/**
 * Recalculate a container node's dimensions to fit its children.
 * Returns a new node with updated style.width/height, or the same node if unchanged.
 */
export function resizeContainerToFitChildren<T extends Node>(
  container: T,
  children: T[],
): T {
  if (children.length === 0) {
    return {
      ...container,
      style: {
        ...container.style,
        width: MIN_CONTAINER_WIDTH,
        height: MIN_CONTAINER_HEIGHT,
      },
    }
  }

  let maxRight = 0
  let maxBottom = 0

  for (const child of children) {
    const childWidth = (child.style?.width as number) || CHILD_NODE_WIDTH
    const childHeight = (child.style?.height as number) || CHILD_NODE_HEIGHT
    const right = child.position.x + childWidth
    const bottom = child.position.y + childHeight

    if (right > maxRight) maxRight = right
    if (bottom > maxBottom) maxBottom = bottom
  }

  const newWidth = Math.max(MIN_CONTAINER_WIDTH, maxRight + CONTAINER_PADDING)
  const newHeight = Math.max(MIN_CONTAINER_HEIGHT, maxBottom + CONTAINER_PADDING)

  return {
    ...container,
    style: {
      ...container.style,
      width: newWidth,
      height: newHeight,
    },
  }
}

/**
 * Recalculate all container nodes to fit their children.
 * Processes in reverse z-order (inner containers first) so outer containers
 * account for resized inner containers.
 */
export function resizeAllContainers<T extends Node>(nodes: T[]): T[] {
  const containerTypes = new Set(['vpc-container', 'subnet-container'])

  // Build parentId -> children map
  const childrenMap = new Map<string, T[]>()
  for (const node of nodes) {
    if (node.parentId) {
      const siblings = childrenMap.get(node.parentId) ?? []
      siblings.push(node)
      childrenMap.set(node.parentId, siblings)
    }
  }

  // Process inner containers first (subnet-container), then outer (vpc-container)
  const processingOrder: string[] = ['subnet-container', 'vpc-container']

  let result = [...nodes]

  for (const containerType of processingOrder) {
    result = result.map((node) => {
      const nodeData = node.data as Record<string, unknown>
      if (!containerTypes.has(nodeData.type as string) || nodeData.type !== containerType) {
        return node
      }
      const children = childrenMap.get(node.id) ?? []
      return resizeContainerToFitChildren(node, children)
    })
  }

  return result
}

/**
 * Check if a point falls inside a container node's bounds.
 * Returns the container node id if found, or null.
 * Checks innermost containers first (subnet-container before vpc-container).
 */
export function findContainerAtPoint<T extends Node>(
  nodes: T[],
  x: number,
  y: number,
): string | null {
  const containerTypes = ['subnet-container', 'vpc-container']

  for (const type of containerTypes) {
    for (const node of nodes) {
      const nodeData = node.data as Record<string, unknown>
      if (nodeData.type !== type) continue

      const width = (node.style?.width as number) || MIN_CONTAINER_WIDTH
      const height = (node.style?.height as number) || MIN_CONTAINER_HEIGHT

      // Get absolute position (accounting for parent offsets)
      let absX = node.position.x
      let absY = node.position.y
      if (node.parentId) {
        const parent = nodes.find((n) => n.id === node.parentId)
        if (parent) {
          absX += parent.position.x
          absY += parent.position.y
        }
      }

      if (
        x >= absX &&
        x <= absX + width &&
        y >= absY + HEADER_HEIGHT &&
        y <= absY + height
      ) {
        return node.id
      }
    }
  }

  return null
}

/**
 * Convert absolute canvas coordinates to parent-relative coordinates.
 */
export function toRelativePosition<T extends Node>(
  nodes: T[],
  parentId: string,
  absX: number,
  absY: number,
): { x: number; y: number } {
  const parent = nodes.find((n) => n.id === parentId)
  if (!parent) return { x: absX, y: absY }

  let parentAbsX = parent.position.x
  let parentAbsY = parent.position.y

  // If parent itself has a parent, add that offset too
  if (parent.parentId) {
    const grandparent = nodes.find((n) => n.id === parent.parentId)
    if (grandparent) {
      parentAbsX += grandparent.position.x
      parentAbsY += grandparent.position.y
    }
  }

  return {
    x: absX - parentAbsX,
    y: absY - parentAbsY,
  }
}
