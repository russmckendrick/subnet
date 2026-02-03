import { ipv4ToBinary } from './ipv4'

export interface BinaryBit {
  value: '0' | '1'
  type: 'network' | 'host'
  index: number
}

export function getBinaryBits(ip: number, prefixLength: number): BinaryBit[] {
  const binary = ipv4ToBinary(ip)
  return Array.from(binary).map((char, index) => ({
    value: char as '0' | '1',
    type: index < prefixLength ? 'network' : 'host',
    index,
  }))
}

export function formatBinaryWithDots(bits: BinaryBit[]): BinaryBit[][] {
  return [
    bits.slice(0, 8),
    bits.slice(8, 16),
    bits.slice(16, 24),
    bits.slice(24, 32),
  ]
}
