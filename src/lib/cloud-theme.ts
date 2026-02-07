export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'generic'

export interface CloudTheme {
  name: string
  vpcLabel: string
  subnetLabel: string
  borderColor: string
  borderStyle: 'dashed' | 'solid'
  bgTint: string
  bgTintDark: string
  badgeColor: string
  badgeBg: string
}

export const CLOUD_THEMES: Record<CloudProvider, CloudTheme> = {
  aws: {
    name: 'AWS',
    vpcLabel: 'VPC',
    subnetLabel: 'Subnet',
    borderColor: '#FF9900',
    borderStyle: 'dashed',
    bgTint: 'rgba(255, 153, 0, 0.04)',
    bgTintDark: 'rgba(255, 153, 0, 0.06)',
    badgeColor: '#FF9900',
    badgeBg: 'rgba(255, 153, 0, 0.12)',
  },
  azure: {
    name: 'Azure',
    vpcLabel: 'VNet',
    subnetLabel: 'Subnet',
    borderColor: '#0078D4',
    borderStyle: 'solid',
    bgTint: 'rgba(0, 120, 212, 0.04)',
    bgTintDark: 'rgba(0, 120, 212, 0.06)',
    badgeColor: '#0078D4',
    badgeBg: 'rgba(0, 120, 212, 0.12)',
  },
  gcp: {
    name: 'GCP',
    vpcLabel: 'VPC',
    subnetLabel: 'Subnet',
    borderColor: '#4285F4',
    borderStyle: 'dashed',
    bgTint: 'rgba(66, 133, 244, 0.04)',
    bgTintDark: 'rgba(66, 133, 244, 0.06)',
    badgeColor: '#4285F4',
    badgeBg: 'rgba(66, 133, 244, 0.12)',
  },
  generic: {
    name: 'Generic',
    vpcLabel: 'VPC',
    subnetLabel: 'Subnet',
    borderColor: '#2aa198',
    borderStyle: 'dashed',
    bgTint: 'rgba(42, 161, 152, 0.04)',
    bgTintDark: 'rgba(42, 161, 152, 0.06)',
    badgeColor: '#2aa198',
    badgeBg: 'rgba(42, 161, 152, 0.12)',
  },
}

export function getCloudTheme(provider: CloudProvider): CloudTheme {
  return CLOUD_THEMES[provider]
}
