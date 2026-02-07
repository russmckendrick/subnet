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

interface DesignerState {
  nodes: Node<DesignerNodeData>[]
  edges: Edge[]
  selectedNodeId: string | null
  isPaletteOpen: boolean
  isDirty: boolean

  setNodes: (nodes: Node<DesignerNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: OnNodesChange<Node<DesignerNodeData>>
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  addNode: (node: Node<DesignerNodeData>) => void
  removeNode: (id: string) => void
  updateNodeLabel: (id: string, label: string) => void
  clearDiagram: () => void
  initFromLayout: (nodes: Node<DesignerNodeData>[], edges: Edge[]) => void
  setSelectedNodeId: (id: string | null) => void
  setIsPaletteOpen: (open: boolean) => void
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isPaletteOpen: true,
  isDirty: false,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes), isDirty: true })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges), isDirty: true })
  },

  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, type: 'smoothstep' }, get().edges), isDirty: true })
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

  clearDiagram: () => set({ nodes: [], edges: [], isDirty: false, selectedNodeId: null }),

  initFromLayout: (nodes, edges) => set({ nodes, edges, isDirty: false, selectedNodeId: null }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setIsPaletteOpen: (open) => set({ isPaletteOpen: open }),
}))
