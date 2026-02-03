export interface CloudProviderInfo {
  id: string
  name: string
  shortName: string
  reservedAddresses: number
  reservedDescription: string[]
  minPrefix: number
  maxPrefix: number
  vpcMaxCidr: string
  color: string
}

export interface CloudProviderResult {
  provider: CloudProviderInfo
  usableHosts: number
  isValidSubnet: boolean
  tooSmall: boolean
  tooLarge: boolean
}

export interface CloudContext {
  aws: CloudProviderResult
  azure: CloudProviderResult
  gcp: CloudProviderResult
}

export const CLOUD_PROVIDERS: Record<string, CloudProviderInfo> = {
  aws: {
    id: 'aws',
    name: 'Amazon Web Services',
    shortName: 'AWS',
    reservedAddresses: 5,
    reservedDescription: [
      '.0 — Network address',
      '.1 — VPC router',
      '.2 — DNS server',
      '.3 — Reserved for future use',
      '.255 — Broadcast (VPC does not support broadcast)',
    ],
    minPrefix: 16,
    maxPrefix: 28,
    vpcMaxCidr: '/16 (65,536 addresses)',
    color: '#ff9900',
  },
  azure: {
    id: 'azure',
    name: 'Microsoft Azure',
    shortName: 'Azure',
    reservedAddresses: 5,
    reservedDescription: [
      '.0 — Network address',
      '.1 — Default gateway',
      '.2, .3 — Azure DNS mapping',
      '.255 — Broadcast',
    ],
    minPrefix: 8,
    maxPrefix: 29,
    vpcMaxCidr: '/8 (16,777,216 addresses)',
    color: '#0078d4',
  },
  gcp: {
    id: 'gcp',
    name: 'Google Cloud Platform',
    shortName: 'GCP',
    reservedAddresses: 4,
    reservedDescription: [
      '.0 — Network address',
      '.1 — Default gateway',
      'Second-to-last — Broadcast (secondary)',
      'Last — Broadcast',
    ],
    minPrefix: 8,
    maxPrefix: 29,
    vpcMaxCidr: '/8 (16,777,216 addresses)',
    color: '#4285f4',
  },
}

function calculateForProvider(prefix: number, provider: CloudProviderInfo): CloudProviderResult {
  const totalAddresses = Math.pow(2, 32 - prefix)
  const tooSmall = prefix > provider.maxPrefix
  const tooLarge = prefix < provider.minPrefix
  const isValidSubnet = !tooSmall && !tooLarge

  let usableHosts = totalAddresses - provider.reservedAddresses
  if (usableHosts < 0) usableHosts = 0
  if (prefix >= 31) usableHosts = prefix === 32 ? 0 : 0

  return { provider, usableHosts, isValidSubnet, tooSmall, tooLarge }
}

export function calculateCloudContext(prefix: number): CloudContext {
  return {
    aws: calculateForProvider(prefix, CLOUD_PROVIDERS.aws),
    azure: calculateForProvider(prefix, CLOUD_PROVIDERS.azure),
    gcp: calculateForProvider(prefix, CLOUD_PROVIDERS.gcp),
  }
}
