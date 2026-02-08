import type { Node } from '@xyflow/react'
import type { DesignerNodeData } from '@/store/designer-store'
import type { CloudProvider } from '@/lib/cloud-theme'

export interface ExtractedDesignerState {
  cidr: string | null
  splits: { prefix: number; label: string }[]
  cloudProvider: CloudProvider
}

/**
 * Extract CIDR and subnet splits from designer nodes.
 * Reads VPC container for parent CIDR and subnet containers for splits.
 */
export function extractDesignerState(
  nodes: Node<DesignerNodeData>[],
  cloudProvider: CloudProvider,
): ExtractedDesignerState {
  const result: ExtractedDesignerState = { cidr: null, splits: [], cloudProvider }

  // Find first VPC container for parent CIDR
  const vpc = nodes.find((n) => n.data.type === 'vpc-container')
  if (!vpc || vpc.data.type !== 'vpc-container') return result

  result.cidr = vpc.data.cidr

  // Collect subnet containers and extract prefix + label
  for (const node of nodes) {
    if (node.data.type !== 'subnet-container') continue
    const cidr = node.data.cidr
    const slashIdx = cidr.lastIndexOf('/')
    if (slashIdx === -1) continue
    const prefix = Number(cidr.slice(slashIdx + 1))
    if (isNaN(prefix) || prefix < 0 || prefix > 32) continue
    result.splits.push({ prefix, label: node.data.label })
  }

  return result
}
