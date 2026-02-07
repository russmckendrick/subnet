export function parseIPv4(str: string): number | null {
  const parts = str.trim().split('.')
  if (parts.length !== 4) return null

  let result = 0
  for (let i = 0; i < 4; i++) {
    const part = parts[i]
    if (!/^\d{1,3}$/.test(part)) return null
    const num = parseInt(part, 10)
    if (num < 0 || num > 255) return null
    result = (result * 256 + num) >>> 0
  }
  return result
}

export function ipv4ToString(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.')
}

export function isValidIPv4(str: string): boolean {
  return parseIPv4(str) !== null
}

export function ipv4ToBinary(num: number): string {
  return (num >>> 0).toString(2).padStart(32, '0')
}

export function ipv4ToDottedBinary(num: number): string {
  const bin = ipv4ToBinary(num)
  return [
    bin.slice(0, 8),
    bin.slice(8, 16),
    bin.slice(16, 24),
    bin.slice(24, 32),
  ].join('.')
}

export function inferDefaultPrefix(ip: number): number {
  if ((ip & 0x00ffffff) === 0) return 8   // x.0.0.0
  if ((ip & 0x0000ffff) === 0) return 16  // x.x.0.0
  if ((ip & 0x000000ff) === 0) return 24  // x.x.x.0
  return 32                                // x.x.x.x (host)
}

export function parseIPv4WithCidr(input: string): { ip: number; prefix: number } | null {
  const trimmed = input.trim()

  // Handle "ip/prefix" format
  const slashIndex = trimmed.indexOf('/')
  if (slashIndex === -1) {
    const ip = parseIPv4(trimmed)
    if (ip === null) return null
    return { ip, prefix: inferDefaultPrefix(ip) }
  }

  const ipStr = trimmed.slice(0, slashIndex)
  const prefixStr = trimmed.slice(slashIndex + 1)

  const ip = parseIPv4(ipStr)
  if (ip === null) return null

  if (!/^\d{1,2}$/.test(prefixStr)) return null
  const prefix = parseInt(prefixStr, 10)
  if (prefix < 0 || prefix > 32) return null

  return { ip, prefix }
}
