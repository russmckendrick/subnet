import { create } from 'zustand'
import type { Node, Edge, OnNodesChange, OnEdgesChange, Connection } from '@xyflow/react'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'

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

type DesignerNodeData = SubnetNodeData | ResourceNodeData

const STORAGE_KEY = 'subnet-designer-state'

interface DesignerState {
  nodes: Node<DesignerNodeData>[]
  edges: Edge[]
  selectedNodeId: string | null
  selectedNodeIds: string[]
  isPaletteOpen: boolean
  isDirty: boolean
  isExportOpen: boolean

  setNodes: (nodes: Node<DesignerNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: OnNodesChange<Node<DesignerNodeData>>
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  addNode: (node: Node<DesignerNodeData>) => void
  removeNode: (id: string) => void
  updateNodeLabel: (id: string, label: string) => void
  updateNodeColor: (id: string, color: string) => void
  clearDiagram: () => void
  initFromLayout: (nodes: Node<DesignerNodeData>[], edges: Edge[]) => void
  setSelectedNodeId: (id: string | null) => void
  setSelectedNodeIds: (ids: string[]) => void
  setIsPaletteOpen: (open: boolean) => void
  setExportOpen: (open: boolean) => void
  loadFromStorage: (state: { nodes: Node<DesignerNodeData>[]; edges: Edge[] }) => void
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedNodeIds: [],
  isPaletteOpen: true,
  isDirty: false,
  isExportOpen: false,

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
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
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
        n.id === id && n.data.type === 'subnet'
          ? { ...n, data: { ...n.data, color } }
          : n,
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

  loadFromStorage: (state) => set({ nodes: state.nodes, edges: state.edges, isDirty: false, selectedNodeId: null, selectedNodeIds: [] }),
}))
