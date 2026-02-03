import { parseIPv4 } from './ipv4'
import { getNetworkAddress, getBroadcastAddress } from './cidr'

export interface RfcRange {
  cidr: string
  name: string
  rfc: string
  description: string
  color: string
  networkNum: number
  broadcastNum: number
}

const RFC_RANGE_DEFS: Omit<RfcRange, 'networkNum' | 'broadcastNum'>[] = [
  { cidr: '0.0.0.0/8', name: 'This Network', rfc: 'RFC 1122', description: 'Current network (only valid as source)', color: '#6b7280' },
  { cidr: '10.0.0.0/8', name: 'Private (Class A)', rfc: 'RFC 1918', description: 'Private network', color: '#10b981' },
  { cidr: '100.64.0.0/10', name: 'CGNAT', rfc: 'RFC 6598', description: 'Carrier-grade NAT shared address space', color: '#8b5cf6' },
  { cidr: '127.0.0.0/8', name: 'Loopback', rfc: 'RFC 1122', description: 'Loopback addresses', color: '#f97316' },
  { cidr: '169.254.0.0/16', name: 'Link-Local', rfc: 'RFC 3927', description: 'Link-local (APIPA)', color: '#eab308' },
  { cidr: '172.16.0.0/12', name: 'Private (Class B)', rfc: 'RFC 1918', description: 'Private network', color: '#10b981' },
  { cidr: '192.0.0.0/24', name: 'IETF Protocol', rfc: 'RFC 6890', description: 'IETF protocol assignments', color: '#6b7280' },
  { cidr: '192.0.2.0/24', name: 'Documentation', rfc: 'RFC 5737', description: 'TEST-NET-1 for documentation', color: '#64748b' },
  { cidr: '192.88.99.0/24', name: '6to4 Relay', rfc: 'RFC 7526', description: '6to4 relay anycast (deprecated)', color: '#6b7280' },
  { cidr: '192.168.0.0/16', name: 'Private (Class C)', rfc: 'RFC 1918', description: 'Private network', color: '#10b981' },
  { cidr: '198.18.0.0/15', name: 'Benchmarking', rfc: 'RFC 2544', description: 'Network benchmark testing', color: '#64748b' },
  { cidr: '198.51.100.0/24', name: 'Documentation', rfc: 'RFC 5737', description: 'TEST-NET-2 for documentation', color: '#64748b' },
  { cidr: '203.0.113.0/24', name: 'Documentation', rfc: 'RFC 5737', description: 'TEST-NET-3 for documentation', color: '#64748b' },
  { cidr: '224.0.0.0/4', name: 'Multicast', rfc: 'RFC 5771', description: 'Multicast addresses', color: '#ef4444' },
  { cidr: '233.252.0.0/24', name: 'MCAST-TEST-NET', rfc: 'RFC 6676', description: 'Multicast test network', color: '#ef4444' },
  { cidr: '240.0.0.0/4', name: 'Reserved', rfc: 'RFC 1112', description: 'Reserved for future use', color: '#6b7280' },
  { cidr: '255.255.255.255/32', name: 'Broadcast', rfc: 'RFC 919', description: 'Limited broadcast', color: '#6b7280' },
]

function parseRfcRange(def: Omit<RfcRange, 'networkNum' | 'broadcastNum'>): RfcRange {
  const [ipStr, prefixStr] = def.cidr.split('/')
  const ip = parseIPv4(ipStr)!
  const prefix = parseInt(prefixStr, 10)
  return {
    ...def,
    networkNum: getNetworkAddress(ip, prefix),
    broadcastNum: getBroadcastAddress(ip, prefix),
  }
}

let _rfcRanges: RfcRange[] | null = null

export function getRfcRanges(): RfcRange[] {
  if (!_rfcRanges) {
    _rfcRanges = RFC_RANGE_DEFS.map(parseRfcRange)
  }
  return _rfcRanges
}

export function detectRfcType(ip: number): string | null {
  const ranges = getRfcRanges()
  for (const range of ranges) {
    if (ip >= range.networkNum && ip <= range.broadcastNum) {
      return `${range.rfc} — ${range.name}`
    }
  }
  return null
}
