import type { Node, Edge } from '@xyflow/react'

const MANIFEST_KEY = 'subnet-designer-saves'
const SAVE_KEY_PREFIX = 'subnet-designer-save-'

export interface SaveEntry {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  nodeCount: number
  cloudProvider: string
}

interface SaveData {
  nodes: Node[]
  edges: Edge[]
  cloudProvider: string
  version: number
}

function getManifest(): SaveEntry[] {
  try {
    const raw = localStorage.getItem(MANIFEST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setManifest(entries: SaveEntry[]) {
  localStorage.setItem(MANIFEST_KEY, JSON.stringify(entries))
}

export function getSavedDiagrams(): SaveEntry[] {
  return getManifest()
}

export function saveDiagram(
  name: string,
  nodes: Node[],
  edges: Edge[],
  cloudProvider: string,
): SaveEntry {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const entry: SaveEntry = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    nodeCount: nodes.length,
    cloudProvider,
  }

  const data: SaveData = { nodes, edges, cloudProvider, version: 2 }
  localStorage.setItem(`${SAVE_KEY_PREFIX}${id}`, JSON.stringify(data))

  const manifest = getManifest()
  manifest.unshift(entry)
  setManifest(manifest)

  return entry
}

export function loadSavedDiagram(id: string): SaveData | null {
  try {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${id}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function deleteSavedDiagram(id: string) {
  localStorage.removeItem(`${SAVE_KEY_PREFIX}${id}`)
  const manifest = getManifest().filter((e) => e.id !== id)
  setManifest(manifest)
}
