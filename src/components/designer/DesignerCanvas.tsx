import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type ColorMode,
} from '@xyflow/react'
import { useDesignerStore } from '@/store/designer-store'
import { useThemeStore } from '@/store/theme-store'
import type { ResourceNodeData } from '@/store/designer-store'
import { SubnetNode } from './nodes/SubnetNode'
import { ResourceNode } from './nodes/ResourceNode'
import { NetworkEdge } from './edges/NetworkEdge'
import { FloatingToolbar } from './FloatingToolbar'

const nodeTypes = {
  subnetNode: SubnetNode,
  resourceNode: ResourceNode,
}

const edgeTypes = {
  networkEdge: NetworkEdge,
}

let nodeIdCounter = 100

export function DesignerCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
    setSelectedNodeIds,
  } = useDesignerStore()

  const theme = useThemeStore((s) => s.theme)
  const colorMode: ColorMode = theme === 'dark' ? 'dark' : 'light'

  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const nodeType = event.dataTransfer.getData('application/reactflow-type')
      const resourceType = event.dataTransfer.getData('application/reactflow-resource')
      const label = event.dataTransfer.getData('application/reactflow-label')

      if (!nodeType || !resourceType) return

      const wrapperBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!wrapperBounds) return

      const position = {
        x: event.clientX - wrapperBounds.left - 60,
        y: event.clientY - wrapperBounds.top - 30,
      }

      const newNode: Node<ResourceNodeData> = {
        id: `resource-${++nodeIdCounter}`,
        type: nodeType,
        position,
        data: {
          type: 'resource',
          resourceType: resourceType as ResourceNodeData['resourceType'],
          label: label || resourceType,
        },
      }

      addNode(newNode)
    },
    [addNode],
  )

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setSelectedNodeId(selectedNodes.length >= 1 ? selectedNodes[0].id : null)
      setSelectedNodeIds(selectedNodes.map((n) => n.id))
    },
    [setSelectedNodeId, setSelectedNodeIds],
  )

  return (
    <div ref={reactFlowWrapper} className="relative flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
        defaultEdgeOptions={{ type: 'networkEdge', animated: false }}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode="Shift"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color={theme === 'dark' ? 'rgba(88, 110, 117, 0.4)' : 'rgba(88, 110, 117, 0.25)'}
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
          maskColor={theme === 'dark' ? 'rgba(0, 43, 54, 0.7)' : 'rgba(253, 246, 227, 0.7)'}
        />
      </ReactFlow>
      <FloatingToolbar />
    </div>
  )
}
