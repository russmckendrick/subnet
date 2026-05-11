import { useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
  type Node,
  type ColorMode,
} from '@xyflow/react'
import { useDesignerStore } from '@/store/designer-store'
import { useThemeStore } from '@/store/theme-store'
import type { ResourceNodeData, CloudResourceNodeData } from '@/store/designer-store'
import { SubnetNode } from './nodes/SubnetNode'
import { ResourceNode } from './nodes/ResourceNode'
import { VpcContainerNode } from './nodes/VpcContainerNode'
import { SubnetContainerNode } from './nodes/SubnetContainerNode'
import { CloudResourceNode } from './nodes/CloudResourceNode'
import { NetworkEdge } from './edges/NetworkEdge'
import { FloatingToolbar } from './FloatingToolbar'
import { PendingDropBanner } from './PendingDropBanner'
import { findContainerAtPoint, toRelativePosition } from '@/lib/diagram-container'

const nodeTypes = {
  subnetNode: SubnetNode,
  resourceNode: ResourceNode,
  vpcContainerNode: VpcContainerNode,
  subnetContainerNode: SubnetContainerNode,
  cloudResourceNode: CloudResourceNode,
}

const edgeTypes = {
  networkEdge: NetworkEdge,
}

let nodeIdCounter = 100

export function DesignerCanvas() {
  const {
    nodes,
    edges,
    cloudProvider,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
    setSelectedNodeIds,
    activeLayer,
    pendingDrop,
    setPendingDrop,
  } = useDesignerStore()

  const theme = useThemeStore((s) => s.theme)
  const colorMode: ColorMode = theme === 'dark' ? 'dark' : 'light'

  // Apply layer dimming via className
  const layeredNodes = useMemo(() => {
    const infraTypes = new Set(['vpcContainerNode', 'subnetContainerNode'])
    const resourceTypes = new Set(['cloudResourceNode', 'resourceNode', 'subnetNode'])
    if (activeLayer === 'all') return nodes
    return nodes.map((node) => {
      const isDimmed =
        (activeLayer === 'infrastructure' && resourceTypes.has(node.type ?? '')) ||
        (activeLayer === 'resources' && infraTypes.has(node.type ?? ''))
      if (!isDimmed) return node
      return {
        ...node,
        className: [node.className, 'layer-dimmed'].filter(Boolean).join(' '),
      }
    })
  }, [nodes, activeLayer])

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

      const dropX = event.clientX - wrapperBounds.left - 60
      const dropY = event.clientY - wrapperBounds.top - 30

      // Check if drop position falls inside a container
      const containerId = findContainerAtPoint(nodes, dropX, dropY)

      if (containerId && nodeType === 'cloudResourceNode') {
        // Drop inside container — use parent-relative coordinates
        const relPos = toRelativePosition(nodes, containerId, dropX, dropY)
        const newNode: Node<CloudResourceNodeData> = {
          id: `resource-${++nodeIdCounter}`,
          type: 'cloudResourceNode',
          position: relPos,
          parentId: containerId,
          extent: 'parent',
          data: {
            type: 'cloud-resource',
            resourceType,
            label: label || resourceType,
            cloudProvider,
          },
        }
        addNode(newNode)
      } else if (nodeType === 'cloudResourceNode') {
        // Cloud resource dropped outside container
        const newNode: Node<CloudResourceNodeData> = {
          id: `resource-${++nodeIdCounter}`,
          type: 'cloudResourceNode',
          position: { x: dropX, y: dropY },
          data: {
            type: 'cloud-resource',
            resourceType,
            label: label || resourceType,
            cloudProvider,
          },
        }
        addNode(newNode)
      } else {
        // Generic resource node (from legacy palette items)
        const newNode: Node<ResourceNodeData> = {
          id: `resource-${++nodeIdCounter}`,
          type: nodeType,
          position: { x: dropX, y: dropY },
          data: {
            type: 'resource',
            resourceType: resourceType as ResourceNodeData['resourceType'],
            label: label || resourceType,
          },
        }
        addNode(newNode)
      }
    },
    [addNode, nodes, cloudProvider],
  )

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setSelectedNodeId(selectedNodes.length >= 1 ? selectedNodes[0].id : null)
      setSelectedNodeIds(selectedNodes.map((n) => n.id))
    },
    [setSelectedNodeId, setSelectedNodeIds],
  )

  const { screenToFlowPosition } = useReactFlow()

  // Tap-to-place for touch devices
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!pendingDrop) return

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      const { nodeType, resourceType, label } = pendingDrop

      // Check if position falls inside a container
      const containerId = findContainerAtPoint(nodes, position.x, position.y)

      if (containerId && nodeType === 'cloudResourceNode') {
        const relPos = toRelativePosition(nodes, containerId, position.x, position.y)
        const newNode: Node<CloudResourceNodeData> = {
          id: `resource-${++nodeIdCounter}`,
          type: 'cloudResourceNode',
          position: relPos,
          parentId: containerId,
          extent: 'parent',
          data: {
            type: 'cloud-resource',
            resourceType,
            label,
            cloudProvider,
          },
        }
        addNode(newNode)
      } else if (nodeType === 'cloudResourceNode') {
        const newNode: Node<CloudResourceNodeData> = {
          id: `resource-${++nodeIdCounter}`,
          type: 'cloudResourceNode',
          position,
          data: {
            type: 'cloud-resource',
            resourceType,
            label,
            cloudProvider,
          },
        }
        addNode(newNode)
      } else {
        const newNode: Node<ResourceNodeData> = {
          id: `resource-${++nodeIdCounter}`,
          type: nodeType,
          position,
          data: {
            type: 'resource',
            resourceType: resourceType as ResourceNodeData['resourceType'],
            label,
          },
        }
        addNode(newNode)
      }

      setPendingDrop(null)
    },
    [pendingDrop, setPendingDrop, screenToFlowPosition, addNode, nodes, cloudProvider],
  )

  return (
    <div ref={reactFlowWrapper} className="relative h-full min-w-0 flex-1">
      <ReactFlow
        nodes={layeredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        connectionRadius={20}
        connectionMode={ConnectionMode.Loose}
        elevateNodesOnSelect
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
      </ReactFlow>
      <PendingDropBanner />
      <FloatingToolbar />
    </div>
  )
}
