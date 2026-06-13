import { useEffect, useRef } from 'react'
import { parseCidr } from '@/lib/cidr'
import { allocateSubnets, buildSplitsFromCidrs } from '@/lib/subnet-math'
import { generateInitialLayout } from '@/lib/diagram-layout'
import {
  SUBNET_CONTAINER_WIDTH,
  SUBNET_CONTAINER_HEIGHT,
  SUBNET_GAP,
  SUBNET_COLUMNS,
  VPC_PADDING,
  VPC_HEADER_HEIGHT,
} from '@/lib/diagram-layout'
import { useDesignerStore } from '@/store/designer-store'
import type { DesignerNodeData, SubnetContainerNodeData, VpcContainerNodeData } from '@/store/designer-store'
import { decompressDiagramState } from '@/lib/export-diagram'
import { buildDesignerUrl } from '@/lib/designer-state-extract'
import { migrateDiagramState, type StorageState } from '@/lib/diagram-migration'
import type { CloudProvider } from '@/lib/cloud-theme'
import type { Node, Edge } from '@xyflow/react'

const VALID_PROVIDERS = new Set<CloudProvider>(['aws', 'azure', 'gcp', 'generic'])
const STORAGE_KEY = 'subnet-designer-state'

/**
 * Parse ?d= (compressed share URL), ?from=, &split=, and &provider= URL params on mount,
 * then initialize the designer canvas with an auto-generated layout.
 * When a saved diagram exists with the same VPC CIDR, merges new subnets
 * into the existing diagram instead of regenerating from scratch.
 */
export function useDesignerUrlSync() {
  const { initFromLayout, setCloudProvider, importDiagram } = useDesignerStore()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const params = new URLSearchParams(window.location.search)

    // Handle compressed share URL (?d=)
    const compressedParam = params.get('d')
    if (compressedParam) {
      const data = decompressDiagramState(compressedParam)
      if (data) {
        const migrated = migrateDiagramState(data as StorageState)
        const provider = (migrated.cloudProvider as CloudProvider) || 'generic'
        if (provider !== 'generic') {
          setCloudProvider(provider)
        }
        importDiagram({
          nodes: migrated.nodes as Node<DesignerNodeData>[],
          edges: migrated.edges,
          cloudProvider: provider,
        })
        // Replace the bulky ?d= payload with the canonical shareable URL
        history.replaceState(null, '', buildDesignerUrl(migrated.nodes as Node<DesignerNodeData>[], provider))
      }
      return
    }

    const fromCidr = params.get('from')
    const splitParam = params.get('split')
    const providerParam = params.get('provider') as CloudProvider | null

    // Set cloud provider if specified
    const provider: CloudProvider =
      providerParam && VALID_PROVIDERS.has(providerParam) ? providerParam : 'generic'

    if (provider !== 'generic') {
      setCloudProvider(provider)
    }

    if (!fromCidr) return

    const parentResult = parseCidr(fromCidr)
    if (!parentResult) return

    // Parse splits. Each segment is `head~label`, where head is a bare prefix (`24`,
    // VLSM-packed) or a full CIDR (`10.0.2.0/24`, exact address from a designer handoff).
    const prefixes: number[] = []
    const labels: string[] = []
    const cidrs: string[] = []
    let allExplicit = true

    if (splitParam) {
      for (const segment of splitParam.split(',')) {
        const sepIdx = segment.indexOf('~')
        const head = sepIdx === -1 ? segment : segment.slice(0, sepIdx)
        const label = sepIdx === -1 ? undefined : decodeURIComponent(segment.slice(sepIdx + 1))
        const p = head.includes('/') ? Number(head.slice(head.lastIndexOf('/') + 1)) : Number(head)
        if (!isNaN(p) && p >= 0 && p <= 32) {
          prefixes.push(p)
          labels.push(label ?? `Subnet ${prefixes.length}`)
          if (head.includes('/')) cidrs.push(head)
          else allExplicit = false
        }
      }
    }

    if (prefixes.length === 0) return

    // Full CIDRs preserve exact addresses; bare prefixes pack contiguously from the base.
    const splits =
      allExplicit && cidrs.length === prefixes.length
        ? buildSplitsFromCidrs(cidrs, labels)
        : allocateSubnets(fromCidr, prefixes, labels)
    if (!splits || splits.length === 0) return

    // Try to merge with existing saved diagram
    const merged = tryMergeWithSaved(parentResult.input, splits, provider)
    if (merged) {
      importDiagram(merged)
      history.replaceState(null, '', buildDesignerUrl(merged.nodes, merged.cloudProvider))
    } else {
      const { nodes, edges } = generateInitialLayout(parentResult, splits, provider)
      initFromLayout(nodes, edges)
      // Keep canonical params so refresh re-derives the same diagram
      history.replaceState(null, '', buildDesignerUrl(nodes as Node<DesignerNodeData>[], provider))
    }
  }, [initFromLayout, setCloudProvider, importDiagram])
}

/**
 * Attempt to merge new splits into an existing saved diagram.
 * Returns merged state if merge is possible, null otherwise (caller should generate fresh).
 */
function tryMergeWithSaved(
  parentCidr: string,
  splits: { cidr: string; label: string; color: string; usableHosts: number; networkAddress: string; broadcastAddress: string }[],
  provider: CloudProvider,
): { nodes: Node<DesignerNodeData>[]; edges: Edge[]; cloudProvider: CloudProvider } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges) || parsed.nodes.length === 0) {
      return null
    }

    const migrated = migrateDiagramState(parsed)
    const savedNodes = migrated.nodes as Node<DesignerNodeData>[]
    const savedEdges = migrated.edges as Edge[]
    const savedProvider = (migrated.cloudProvider as CloudProvider) || 'generic'

    // Find the VPC container node
    const vpcNode = savedNodes.find(
      (n) => n.type === 'vpcContainerNode' && (n.data as VpcContainerNodeData).type === 'vpc-container',
    ) as Node<VpcContainerNodeData> | undefined

    if (!vpcNode) return null

    // Check if it's the same parent network
    const savedCidr = (vpcNode.data as VpcContainerNodeData).cidr
    if (normalizeCidr(savedCidr) !== normalizeCidr(parentCidr)) {
      // Different network — generate fresh
      return null
    }

    // Collect existing subnet-container CIDRs
    const existingSubnetCidrs = new Set(
      savedNodes
        .filter((n) => n.type === 'subnetContainerNode' && (n.data as SubnetContainerNodeData).type === 'subnet-container')
        .map((n) => normalizeCidr((n.data as SubnetContainerNodeData).cidr)),
    )

    // Find which URL splits are NEW
    const newSplits = splits.filter((s) => !existingSubnetCidrs.has(normalizeCidr(s.cidr)))

    if (newSplits.length === 0) {
      // No new splits — load saved state as-is (persistence hook will handle it)
      return null
    }

    // Count existing subnet containers to determine grid positions
    const existingSubnetCount = existingSubnetCidrs.size
    const totalSubnets = existingSubnetCount + newSplits.length

    // Create new subnet container nodes
    const newNodes: Node<DesignerNodeData>[] = []
    const resolvedProvider = provider !== 'generic' ? provider : savedProvider

    // Find highest existing subnet-N id to avoid conflicts
    let maxSubnetIndex = -1
    for (const n of savedNodes) {
      if (n.id.startsWith('subnet-')) {
        const idx = parseInt(n.id.slice('subnet-'.length), 10)
        if (!isNaN(idx) && idx > maxSubnetIndex) maxSubnetIndex = idx
      }
    }

    newSplits.forEach((split, i) => {
      const gridIndex = existingSubnetCount + i
      const col = gridIndex % SUBNET_COLUMNS
      const row = Math.floor(gridIndex / SUBNET_COLUMNS)
      const x = VPC_PADDING + col * (SUBNET_CONTAINER_WIDTH + SUBNET_GAP)
      const y = VPC_HEADER_HEIGHT + row * (SUBNET_CONTAINER_HEIGHT + SUBNET_GAP)

      const subnetId = `subnet-${maxSubnetIndex + 1 + i}`
      const subnetNode: Node<SubnetContainerNodeData> = {
        id: subnetId,
        type: 'subnetContainerNode',
        position: { x, y },
        parentId: vpcNode.id,
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
          cloudProvider: resolvedProvider,
        },
      }
      newNodes.push(subnetNode)
    })

    // Resize VPC container to fit all subnets (old + new)
    const cols = Math.min(totalSubnets, SUBNET_COLUMNS)
    const rows = Math.ceil(totalSubnets / SUBNET_COLUMNS)
    const vpcInnerWidth = cols * SUBNET_CONTAINER_WIDTH + (cols - 1) * SUBNET_GAP
    const vpcInnerHeight = rows * SUBNET_CONTAINER_HEIGHT + (rows - 1) * SUBNET_GAP
    const newVpcWidth = vpcInnerWidth + VPC_PADDING * 2
    const newVpcHeight = vpcInnerHeight + VPC_PADDING + VPC_HEADER_HEIGHT

    // Update VPC node dimensions
    const updatedNodes = savedNodes.map((n) => {
      if (n.id === vpcNode.id) {
        return {
          ...n,
          style: { ...n.style, width: newVpcWidth, height: newVpcHeight },
        }
      }
      return n
    })

    return {
      nodes: [...updatedNodes, ...newNodes],
      edges: savedEdges,
      cloudProvider: resolvedProvider,
    }
  } catch {
    return null
  }
}

/** Normalize a CIDR string for comparison (trim whitespace, lowercase). */
function normalizeCidr(cidr: string): string {
  return cidr.trim().toLowerCase()
}
