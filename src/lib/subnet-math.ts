import { parseIPv4WithCidr, ipv4ToString } from './ipv4'
import { getNetworkAddress, getBroadcastAddress, cidrToString } from './cidr'

export interface SubnetSplit {
  cidr: string
  prefixLength: number
  networkAddress: string
  broadcastAddress: string
  firstHost: string
  lastHost: string
  size: number
  usableHosts: number
  label: string
  color: string
}

const SPLIT_COLORS = [
  '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
  '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#e11d48', '#0ea5e9', '#a855f7', '#22c55e',
  '#d946ef',
]

export function allocateSubnets(
  parentCidr: string,
  prefixLengths: number[],
  labels?: string[],
): SubnetSplit[] | null {
  const parsed = parseIPv4WithCidr(parentCidr)
  if (!parsed) return null

  const { ip, prefix: parentPrefix } = parsed
  const parentNetwork = getNetworkAddress(ip, parentPrefix)
  const parentBroadcast = getBroadcastAddress(ip, parentPrefix)

  const splits: SubnetSplit[] = []
  let currentAddress = parentNetwork

  for (let i = 0; i < prefixLengths.length; i++) {
    const childPrefix = prefixLengths[i]
    if (childPrefix < parentPrefix || childPrefix > 32) return null

    const childSize = Math.pow(2, 32 - childPrefix)

    // Align to subnet boundary
    const alignMask = (~0 << (32 - childPrefix)) >>> 0
    const alignedAddress = (currentAddress & alignMask) >>> 0
    const networkAddress = alignedAddress >= currentAddress ? alignedAddress : (alignedAddress + childSize) >>> 0

    const broadcastAddress = (networkAddress + childSize - 1) >>> 0

    if (broadcastAddress > parentBroadcast) return null // Doesn't fit

    const firstHost = childPrefix >= 31 ? networkAddress : (networkAddress + 1) >>> 0
    const lastHost = childPrefix >= 31 ? broadcastAddress : (broadcastAddress - 1) >>> 0
    const usableHosts = childPrefix >= 31 ? (childPrefix === 32 ? 1 : 2) : childSize - 2

    splits.push({
      cidr: cidrToString(networkAddress, childPrefix),
      prefixLength: childPrefix,
      networkAddress: ipv4ToString(networkAddress),
      broadcastAddress: ipv4ToString(broadcastAddress),
      firstHost: ipv4ToString(firstHost),
      lastHost: ipv4ToString(lastHost),
      size: childSize,
      usableHosts,
      label: labels?.[i] ?? `Subnet ${i + 1}`,
      color: SPLIT_COLORS[i % SPLIT_COLORS.length],
    })

    currentAddress = (broadcastAddress + 1) >>> 0
  }

  return splits
}

/**
 * Build subnet splits from a list of explicit CIDRs (the designer handoff), preserving
 * each subnet's actual network address instead of re-packing contiguously from a base.
 * Results are sorted by network address so display order is stable and spatial.
 * Returns null if any CIDR fails to parse.
 */
export function buildSplitsFromCidrs(
  cidrs: string[],
  labels?: string[],
): SubnetSplit[] | null {
  const entries: { network: number; prefix: number; label: string }[] = []

  for (let i = 0; i < cidrs.length; i++) {
    const parsed = parseIPv4WithCidr(cidrs[i])
    if (!parsed) return null
    entries.push({
      network: getNetworkAddress(parsed.ip, parsed.prefix),
      prefix: parsed.prefix,
      label: labels?.[i] ?? `Subnet ${i + 1}`,
    })
  }

  // Sort by network address (unsigned 32-bit values stay within JS safe-integer range)
  entries.sort((a, b) => a.network - b.network)

  return entries.map((entry, i) => {
    const { network: networkAddress, prefix: prefixLength, label } = entry
    const size = Math.pow(2, 32 - prefixLength)
    const broadcastAddress = (networkAddress + size - 1) >>> 0
    const firstHost = prefixLength >= 31 ? networkAddress : (networkAddress + 1) >>> 0
    const lastHost = prefixLength >= 31 ? broadcastAddress : (broadcastAddress - 1) >>> 0
    const usableHosts = prefixLength >= 31 ? (prefixLength === 32 ? 1 : 2) : size - 2

    return {
      cidr: cidrToString(networkAddress, prefixLength),
      prefixLength,
      networkAddress: ipv4ToString(networkAddress),
      broadcastAddress: ipv4ToString(broadcastAddress),
      firstHost: ipv4ToString(firstHost),
      lastHost: ipv4ToString(lastHost),
      size,
      usableHosts,
      label,
      color: SPLIT_COLORS[i % SPLIT_COLORS.length],
    }
  })
}

export function getRemainingSpace(
  parentCidr: string,
  splits: SubnetSplit[],
): number {
  const parsed = parseIPv4WithCidr(parentCidr)
  if (!parsed) return 0

  const { prefix } = parsed
  const totalAddresses = Math.pow(2, 32 - prefix)
  const usedAddresses = splits.reduce((sum, s) => sum + s.size, 0)
  return totalAddresses - usedAddresses
}

export function getAvailablePrefixes(
  parentCidr: string,
  currentSplits: SubnetSplit[],
): number[] {
  const parsed = parseIPv4WithCidr(parentCidr)
  if (!parsed) return []

  const remaining = getRemainingSpace(parentCidr, currentSplits)
  const available: number[] = []

  for (let prefix = parsed.prefix; prefix <= 30; prefix++) {
    const size = Math.pow(2, 32 - prefix)
    if (size <= remaining) {
      available.push(prefix)
    }
  }

  return available
}

export function findSmallestContainingCidr(cidrs: string[]): string | null {
  if (cidrs.length === 0) return null

  let minIp = 0xffffffff >>> 0
  let maxIp = 0

  for (const cidr of cidrs) {
    const parsed = parseIPv4WithCidr(cidr)
    if (!parsed) return null

    const network = getNetworkAddress(parsed.ip, parsed.prefix)
    const broadcast = getBroadcastAddress(parsed.ip, parsed.prefix)

    if (network < minIp) minIp = network
    if (broadcast > maxIp) maxIp = broadcast
  }

  // Find the smallest prefix that contains both minIp and maxIp
  for (let prefix = 32; prefix >= 0; prefix--) {
    const network = getNetworkAddress(minIp, prefix)
    const broadcast = getBroadcastAddress(minIp, prefix)
    if (network <= minIp && broadcast >= maxIp) {
      return cidrToString(network, prefix)
    }
  }

  return '0.0.0.0/0'
}
