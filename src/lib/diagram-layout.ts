import type { Node, Edge } from '@xyflow/react'
import type { CidrResult } from './cidr'
import type { SubnetSplit } from './subnet-math'
import type { SubnetNodeData, ResourceNodeData } from '@/store/designer-store'

type DesignerNodeData = SubnetNodeData | ResourceNodeData

const NODE_WIDTH = 220
const NODE_HEIGHT = 100
const COLUMN_GAP = 40
const ROW_GAP = 80
const COLUMNS = 3

/**
 * Generate an initial network diagram layout from a parent CIDR and its subnet splits.
 *
 * Layout:
 *   Internet Gateway (top center)
 *        |
 *   VPC / Network (parent CIDR)
 *        |
 *   Subnet nodes in a 3-column grid
 */
export function generateInitialLayout(
  parentResult: CidrResult,
  splits: SubnetSplit[],
): { nodes: Node<DesignerNodeData>[]; edges: Edge[] } {
  const nodes: Node<DesignerNodeData>[] = []
  const edges: Edge[] = []

  const gridWidth = COLUMNS * NODE_WIDTH + (COLUMNS - 1) * COLUMN_GAP
  const centerX = gridWidth / 2

  // Internet Gateway
  const igwId = 'igw-1'
  const igwNode: Node<ResourceNodeData> = {
    id: igwId,
    type: 'resourceNode',
    position: { x: centerX - 60, y: 0 },
    data: {
      type: 'resource',
      resourceType: 'internet-gateway',
      label: 'Internet Gateway',
    },
  }
  nodes.push(igwNode)

  // VPC node
  const vpcId = 'vpc-1'
  const vpcNode: Node<ResourceNodeData> = {
    id: vpcId,
    type: 'resourceNode',
    position: { x: centerX - 60, y: ROW_GAP + 20 },
    data: {
      type: 'resource',
      resourceType: 'vpc',
      label: `VPC ${parentResult.input}`,
    },
  }
  nodes.push(vpcNode)

  // Edge: IGW -> VPC
  edges.push({
    id: `e-${igwId}-${vpcId}`,
    source: igwId,
    target: vpcId,
    type: 'networkEdge',
  })

  // Subnet nodes in a grid
  const subnetStartY = (ROW_GAP + 20) * 2 + 40

  splits.forEach((split, i) => {
    const col = i % COLUMNS
    const row = Math.floor(i / COLUMNS)
    const x = col * (NODE_WIDTH + COLUMN_GAP)
    const y = subnetStartY + row * (NODE_HEIGHT + ROW_GAP)

    const subnetId = `subnet-${i}`
    const subnetNode: Node<SubnetNodeData> = {
      id: subnetId,
      type: 'subnetNode',
      position: { x, y },
      data: {
        type: 'subnet',
        cidr: split.cidr,
        label: split.label,
        color: split.color,
        hosts: split.usableHosts,
        networkAddress: split.networkAddress,
        broadcastAddress: split.broadcastAddress,
      },
    }
    nodes.push(subnetNode)

    // Edge: VPC -> Subnet
    edges.push({
      id: `e-${vpcId}-${subnetId}`,
      source: vpcId,
      target: subnetId,
      type: 'networkEdge',
    })
  })

  return { nodes, edges }
}
