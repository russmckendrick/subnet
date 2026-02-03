import { parseIPv4WithCidr, ipv4ToString, ipv4ToDottedBinary } from './ipv4'
import { calculateCloudContext, type CloudContext } from './cloud-providers'
import { detectRfcType } from './rfc-ranges'

export interface CidrResult {
  input: string
  networkAddress: string
  broadcastAddress: string
  netmask: string
  wildcardMask: string
  prefixLength: number
  firstHost: string
  lastHost: string
  totalAddresses: number
  usableHosts: number
  binaryNetmask: string
  binaryNetwork: string
  binaryBroadcast: string
  binaryFirstHost: string
  binaryLastHost: string
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E'
  isPrivate: boolean
  rfcType: string | null
  cloudContext: CloudContext
  networkNum: number
  broadcastNum: number
  netmaskNum: number
}

export function getNetmask(prefix: number): number {
  if (prefix === 0) return 0
  return (~0 << (32 - prefix)) >>> 0
}

export function getWildcardMask(prefix: number): number {
  return (~getNetmask(prefix)) >>> 0
}

export function getNetworkAddress(ip: number, prefix: number): number {
  return (ip & getNetmask(prefix)) >>> 0
}

export function getBroadcastAddress(ip: number, prefix: number): number {
  return (ip | getWildcardMask(prefix)) >>> 0
}

export function getIPClass(ip: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  const firstOctet = (ip >>> 24) & 0xff
  if (firstOctet < 128) return 'A'
  if (firstOctet < 192) return 'B'
  if (firstOctet < 224) return 'C'
  if (firstOctet < 240) return 'D'
  return 'E'
}

export function isPrivateIP(ip: number): boolean {
  const first = (ip >>> 24) & 0xff
  const second = (ip >>> 16) & 0xff

  // 10.0.0.0/8
  if (first === 10) return true
  // 172.16.0.0/12
  if (first === 172 && second >= 16 && second <= 31) return true
  // 192.168.0.0/16
  if (first === 192 && second === 168) return true

  return false
}

export function getTotalAddresses(prefix: number): number {
  return Math.pow(2, 32 - prefix)
}

export function getUsableHosts(prefix: number): number {
  if (prefix >= 31) return prefix === 32 ? 1 : 2
  return Math.pow(2, 32 - prefix) - 2
}

export function parseCidr(input: string): CidrResult | null {
  const parsed = parseIPv4WithCidr(input)
  if (!parsed) return null

  const { ip, prefix } = parsed
  const netmaskNum = getNetmask(prefix)
  const networkNum = getNetworkAddress(ip, prefix)
  const broadcastNum = getBroadcastAddress(ip, prefix)

  const firstHostNum = prefix >= 31 ? networkNum : (networkNum + 1) >>> 0
  const lastHostNum = prefix >= 31 ? broadcastNum : (broadcastNum - 1) >>> 0

  const networkAddress = ipv4ToString(networkNum)
  const rfcType = detectRfcType(networkNum)
  const cloudContext = calculateCloudContext(prefix)

  return {
    input,
    networkAddress,
    broadcastAddress: ipv4ToString(broadcastNum),
    netmask: ipv4ToString(netmaskNum),
    wildcardMask: ipv4ToString(getWildcardMask(prefix)),
    prefixLength: prefix,
    firstHost: ipv4ToString(firstHostNum),
    lastHost: ipv4ToString(lastHostNum),
    totalAddresses: getTotalAddresses(prefix),
    usableHosts: getUsableHosts(prefix),
    binaryNetmask: ipv4ToDottedBinary(netmaskNum),
    binaryNetwork: ipv4ToDottedBinary(networkNum),
    binaryBroadcast: ipv4ToDottedBinary(broadcastNum),
    binaryFirstHost: ipv4ToDottedBinary(firstHostNum),
    binaryLastHost: ipv4ToDottedBinary(lastHostNum),
    ipClass: getIPClass(networkNum),
    isPrivate: isPrivateIP(networkNum),
    rfcType,
    cloudContext,
    networkNum,
    broadcastNum,
    netmaskNum,
  }
}

export function cidrToString(networkNum: number, prefix: number): string {
  return `${ipv4ToString(networkNum)}/${prefix}`
}
