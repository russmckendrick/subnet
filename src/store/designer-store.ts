import { create } from 'zustand'
import type { Node, Edge, OnNodesChange, OnEdgesChange, Connection } from '@xyflow/react'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import type { CloudProvider } from '@/lib/cloud-theme'

export interface SubnetNodeData {
  type: 'subnet'
  cidr: string
  label: string
  color: string
  hosts: number
  networkAddress: string
  broadcastAddress: string
  [key: string]: unknown
}

export interface ResourceNodeData {
  type: 'resource'
  resourceType: ResourceType
  label: string
  [key: string]: unknown
}

export interface VpcContainerNodeData {
  type: 'vpc-container'
  cidr: string
  label: string
  cloudProvider: CloudProvider
  [key: string]: unknown
}

export interface SubnetContainerNodeData {
  type: 'subnet-container'
  cidr: string
  label: string
  color: string
  hosts: number
  networkAddress: string
  broadcastAddress: string
  cloudProvider: CloudProvider
  [key: string]: unknown
}

export interface CloudResourceNodeData {
  type: 'cloud-resource'
  resourceType: string
  label: string
  cloudProvider: CloudProvider
  [key: string]: unknown
}

export type ResourceType =
  | 'router'
  | 'switch'
  | 'firewall'
  | 'server'
  | 'database'
  | 'load-balancer'
  | 'internet-gateway'
  | 'cloud'
  | 'vpc'
  | 'nat-gateway'
  | 'dns'
  | 'cdn'

export type DesignerNodeData =
  | SubnetNodeData
  | ResourceNodeData
  | VpcContainerNodeData
  | SubnetContainerNodeData
  | CloudResourceNodeData

const STORAGE_KEY = 'subnet-designer-state'

export type ActiveLayer = 'all' | 'infrastructure' | 'resources'

interface PendingDrop {
  nodeType: string
  resourceType: string
  label: string
}

interface DesignerState {
  nodes: Node<DesignerNodeData>[]
  edges: Edge[]
  selectedNodeId: string | null
  selectedNodeIds: string[]
  isPaletteOpen: boolean
  isDirty: boolean
  isExportOpen: boolean
  cloudProvider: CloudProvider
  activeLayer: ActiveLayer
  pendingDrop: PendingDrop | null

  setNodes: (nodes: Node<DesignerNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: OnNodesChange<Node<DesignerNodeData>>
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  addNode: (node: Node<DesignerNodeData>) => void
  removeNode: (id: string) => void
  updateNodeLabel: (id: string, label: string) => void
  updateNodeColor: (id: string, color: string) => void
  updateNodeData: (id: string, data: Partial<DesignerNodeData>) => void
  clearDiagram: () => void
  initFromLayout: (nodes: Node<DesignerNodeData>[], edges: Edge[]) => void
  setSelectedNodeId: (id: string | null) => void
  setSelectedNodeIds: (ids: string[]) => void
  setIsPaletteOpen: (open: boolean) => void
  setExportOpen: (open: boolean) => void
  setCloudProvider: (provider: CloudProvider) => void
  setActiveLayer: (layer: ActiveLayer) => void
  setPendingDrop: (drop: PendingDrop | null) => void
  loadFromStorage: (state: { nodes: Node<DesignerNodeData>[]; edges: Edge[]; cloudProvider?: CloudProvider }) => void
  importDiagram: (state: { nodes: Node<DesignerNodeData>[]; edges: Edge[]; cloudProvider?: CloudProvider }) => void
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedNodeIds: [],
  isPaletteOpen: true,
  isDirty: false,
  isExportOpen: false,
  cloudProvider: 'generic',
  activeLayer: 'all',
  pendingDrop: null,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes), isDirty: true })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges), isDirty: true })
  },

  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, type: 'networkEdge' }, get().edges), isDirty: true })
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node], isDirty: true })
  },

  removeNode: (id) => {
    // Also remove children whose parentId matches
    const childIds = new Set(
      get().nodes.filter((n) => n.parentId === id).map((n) => n.id),
    )
    const idsToRemove = new Set([id, ...childIds])

    set({
      nodes: get().nodes.filter((n) => !idsToRemove.has(n.id)),
      edges: get().edges.filter(
        (e) => !idsToRemove.has(e.source) && !idsToRemove.has(e.target),
      ),
      isDirty: true,
    })
  },

  updateNodeLabel: (id, label) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label } } : n,
      ),
      isDirty: true,
    })
  },

  updateNodeColor: (id, color) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id && (n.data.type === 'subnet' || n.data.type === 'subnet-container')
          ? { ...n, data: { ...n.data, color } }
          : n,
      ),
      isDirty: true,
    })
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as DesignerNodeData } : n,
      ),
      isDirty: true,
    })
  },

  clearDiagram: () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    set({ nodes: [], edges: [], isDirty: false, selectedNodeId: null, selectedNodeIds: [] })
  },

  initFromLayout: (nodes, edges) => set({ nodes, edges, isDirty: false, selectedNodeId: null, selectedNodeIds: [] }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  setIsPaletteOpen: (open) => set({ isPaletteOpen: open }),
  setExportOpen: (open) => set({ isExportOpen: open }),

  setActiveLayer: (layer) => set({ activeLayer: layer, selectedNodeId: null, selectedNodeIds: [] }),
  setPendingDrop: (drop) => set({ pendingDrop: drop }),

  setCloudProvider: (provider) => {
    // Update provider and re-skin all container nodes
    const nodes = get().nodes.map((n) => {
      if (n.data.type === 'vpc-container' || n.data.type === 'subnet-container' || n.data.type === 'cloud-resource') {
        return { ...n, data: { ...n.data, cloudProvider: provider } }
      }
      return n
    })
    set({ cloudProvider: provider, nodes, isDirty: true })
  },

  loadFromStorage: (state) => set({
    nodes: state.nodes,
    edges: state.edges,
    cloudProvider: state.cloudProvider ?? 'generic',
    isDirty: false,
    selectedNodeId: null,
    selectedNodeIds: [],
  }),

  importDiagram: (state) => set({
    nodes: state.nodes,
    edges: state.edges,
    cloudProvider: state.cloudProvider ?? 'generic',
    isDirty: true,
    selectedNodeId: null,
    selectedNodeIds: [],
  }),
}))
