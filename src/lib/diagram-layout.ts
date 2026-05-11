import type { Node, Edge } from '@xyflow/react'
import type { CidrResult } from './cidr'
import type { SubnetSplit } from './subnet-math'
import type { CloudProvider } from './cloud-theme'
import { getCloudTheme } from './cloud-theme'
import type {
  SubnetNodeData,
  ResourceNodeData,
  VpcContainerNodeData,
  SubnetContainerNodeData,
  DesignerNodeData,
} from '@/store/designer-store'

export const SUBNET_CONTAINER_WIDTH = 380
export const SUBNET_CONTAINER_HEIGHT = 170
export const SUBNET_GAP = 20
export const SUBNET_COLUMNS = 2
export const VPC_PADDING = 30
export const VPC_HEADER_HEIGHT = 40
const IGW_OFFSET_Y = 80

/**
 * Generate a nested cloud-style diagram layout.
 *
 * Layout:
 *   Internet Gateway (top center, outside VPC)
 *        |
 *   VPC Container (large box wrapping all subnets)
 *     ├── Subnet Container 1 (dotted box)
 *     ├── Subnet Container 2 (dotted box)
 *     └── Subnet Container N
 */
export function generateCloudLayout(
  parentResult: CidrResult,
  splits: SubnetSplit[],
  provider: CloudProvider = 'generic',
): { nodes: Node<DesignerNodeData>[]; edges: Edge[] } {
  const theme = getCloudTheme(provider)
  const nodes: Node<DesignerNodeData>[] = []
  const edges: Edge[] = []

  // Calculate VPC dimensions based on subnet count
  const cols = Math.min(splits.length, SUBNET_COLUMNS)
  const rows = Math.ceil(splits.length / SUBNET_COLUMNS)
  const vpcInnerWidth = cols * SUBNET_CONTAINER_WIDTH + (cols - 1) * SUBNET_GAP
  const vpcInnerHeight = rows * SUBNET_CONTAINER_HEIGHT + (rows - 1) * SUBNET_GAP
  const vpcWidth = vpcInnerWidth + VPC_PADDING * 2
  const vpcHeight = vpcInnerHeight + VPC_PADDING + VPC_HEADER_HEIGHT

  // Internet Gateway — outside VPC, centered above
  const igwId = 'igw-1'
  const igwNode: Node<ResourceNodeData> = {
    id: igwId,
    type: 'resourceNode',
    position: { x: vpcWidth / 2 - 60, y: 0 },
    data: {
      type: 'resource',
      resourceType: 'internet-gateway',
      label: 'Internet Gateway',
    },
  }
  nodes.push(igwNode)

  // VPC Container
  const vpcId = 'vpc-1'
  const vpcNode: Node<VpcContainerNodeData> = {
    id: vpcId,
    type: 'vpcContainerNode',
    position: { x: 0, y: IGW_OFFSET_Y + 60 },
    style: { width: vpcWidth, height: vpcHeight },
    data: {
      type: 'vpc-container',
      cidr: parentResult.input,
      label: `${theme.vpcLabel} ${parentResult.input}`,
      cloudProvider: provider,
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

  // Subnet containers nested inside VPC
  splits.forEach((split, i) => {
    const col = i % SUBNET_COLUMNS
    const row = Math.floor(i / SUBNET_COLUMNS)
    const x = VPC_PADDING + col * (SUBNET_CONTAINER_WIDTH + SUBNET_GAP)
    const y = VPC_HEADER_HEIGHT + row * (SUBNET_CONTAINER_HEIGHT + SUBNET_GAP)

    const subnetId = `subnet-${i}`
    const subnetNode: Node<SubnetContainerNodeData> = {
      id: subnetId,
      type: 'subnetContainerNode',
      position: { x, y },
      parentId: vpcId,
      extent: 'parent',
      style: { width: SUBNET_CONTAINER_WIDTH, height: SUBNET_CONTAINER_HEIGHT },
      data: {
        type: 'subnet-container',
        cidr: split.cidr,
        label: split.label,
        color: split.color,
        hosts: split.usableHosts,
        networkAddress: split.networkAddress,
        broadcastAddress: split.broadcastAddress,
        cloudProvider: provider,
      },
    }
    nodes.push(subnetNode)
  })

  return { nodes, edges }
}

/**
 * Legacy flat layout for backwards compatibility with v1 diagrams.
 * Used when loading old saved diagrams.
 */
export function generateLegacyFlatLayout(
  parentResult: CidrResult,
  splits: SubnetSplit[],
): { nodes: Node<DesignerNodeData>[]; edges: Edge[] } {
  const NODE_WIDTH = 220
  const NODE_HEIGHT = 100
  const COLUMN_GAP = 40
  const ROW_GAP = 80
  const COLUMNS = 3

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

// Keep generateInitialLayout as the default — now uses cloud layout
export function generateInitialLayout(
  parentResult: CidrResult,
  splits: SubnetSplit[],
  provider: CloudProvider = 'generic',
): { nodes: Node<DesignerNodeData>[]; edges: Edge[] } {
  return generateCloudLayout(parentResult, splits, provider)
}
