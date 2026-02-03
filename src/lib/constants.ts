export interface SubnetReference {
  prefix: number
  netmask: string
  wildcardMask: string
  totalAddresses: number
  usableHosts: number
}

export const SUBNET_REFERENCE_TABLE: SubnetReference[] = Array.from(
  { length: 33 },
  (_, i) => {
    const prefix = i
    const totalAddresses = Math.pow(2, 32 - prefix)
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
    const wildcard = (~mask) >>> 0

    const maskStr = [
      (mask >>> 24) & 0xff,
      (mask >>> 16) & 0xff,
      (mask >>> 8) & 0xff,
      mask & 0xff,
    ].join('.')

    const wildcardStr = [
      (wildcard >>> 24) & 0xff,
      (wildcard >>> 16) & 0xff,
      (wildcard >>> 8) & 0xff,
      wildcard & 0xff,
    ].join('.')

    let usableHosts: number
    if (prefix === 32) usableHosts = 1
    else if (prefix === 31) usableHosts = 2
    else usableHosts = totalAddresses - 2

    return { prefix, netmask: maskStr, wildcardMask: wildcardStr, totalAddresses, usableHosts }
  },
)
