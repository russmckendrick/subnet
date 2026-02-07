import type { Node, Edge } from '@xyflow/react'

export const CURRENT_STORAGE_VERSION = 2

interface StorageV1 {
  nodes: Node[]
  edges: Edge[]
  version?: 1
}

interface StorageV2 {
  nodes: Node[]
  edges: Edge[]
  cloudProvider: string
  version: 2
}

export type StorageState = StorageV1 | StorageV2

/**
 * Migrate stored diagram data to the current version.
 * V1 -> V2: Adds cloudProvider='generic', preserves flat layout as-is.
 */
export function migrateDiagramState(raw: StorageState): StorageV2 {
  const version = raw.version ?? 1

  if (version >= 2) {
    return raw as StorageV2
  }

  // V1 -> V2: add cloudProvider, keep nodes/edges intact
  return {
    nodes: raw.nodes,
    edges: raw.edges,
    cloudProvider: 'generic',
    version: 2,
  }
}
