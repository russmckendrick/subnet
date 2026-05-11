import type { CloudProvider } from '@/lib/cloud-theme'
import { RESOURCE_ICONS } from './NetworkIconRegistry'
import { AWS_ICON_MAP } from './aws'
import { AZURE_ICON_MAP } from './azure'
import { GCP_ICON_MAP } from './gcp'

type IconComponent = React.ComponentType<{ className?: string; color?: string }>

const PROVIDER_ICON_MAPS: Record<CloudProvider, Record<string, IconComponent>> = {
  aws: AWS_ICON_MAP,
  azure: AZURE_ICON_MAP,
  gcp: GCP_ICON_MAP,
  generic: {},
}

/** Map generic resource types to provider-specific types */
const GENERIC_TO_PROVIDER: Record<CloudProvider, Record<string, string>> = {
  aws: {
    server: 'aws-ec2',
    database: 'aws-rds',
    'load-balancer': 'aws-elb',
    firewall: 'aws-waf',
    vpc: 'aws-vpc',
    'internet-gateway': 'aws-igw',
    'nat-gateway': 'aws-nat',
    dns: 'aws-route53',
    cdn: 'aws-cloudfront',
    cloud: 'aws-vpc',
  },
  azure: {
    server: 'azure-vm',
    database: 'azure-sql',
    'load-balancer': 'azure-lb',
    firewall: 'azure-firewall',
    vpc: 'azure-vnet',
    'internet-gateway': 'azure-appgw',
    'nat-gateway': 'azure-nat',
    dns: 'azure-dns',
    cdn: 'azure-frontdoor',
    cloud: 'azure-vnet',
  },
  gcp: {
    server: 'gcp-compute',
    database: 'gcp-sql',
    'load-balancer': 'gcp-lb',
    firewall: 'gcp-firewall',
    vpc: 'gcp-vpc',
    'internet-gateway': 'gcp-lb',
    'nat-gateway': 'gcp-nat',
    dns: 'gcp-dns',
    cdn: 'gcp-cdn',
    cloud: 'gcp-vpc',
  },
  generic: {},
}

/**
 * Build a flat lookup map for a specific provider that includes all
 * fallbacks pre-computed. This allows consumers to do a simple record
 * lookup instead of calling a function during render.
 */
function buildResolvedMap(provider: CloudProvider): Record<string, IconComponent> {
  const providerMap = PROVIDER_ICON_MAPS[provider]
  const genericMap = GENERIC_TO_PROVIDER[provider] ?? {}
  const resolved: Record<string, IconComponent> = {}

  // Add all provider-specific icons
  for (const [key, icon] of Object.entries(providerMap)) {
    resolved[key] = icon
  }

  // Add generic-to-provider mappings
  for (const [genericKey, providerKey] of Object.entries(genericMap)) {
    if (!resolved[genericKey] && providerMap[providerKey]) {
      resolved[genericKey] = providerMap[providerKey]
    }
  }

  // Add all generic icons as fallbacks
  for (const [key, icon] of Object.entries(RESOURCE_ICONS)) {
    if (!resolved[key]) {
      resolved[key] = icon
    }
  }

  return resolved
}

/** Pre-computed lookup maps per provider */
export const CLOUD_ICON_MAPS: Record<CloudProvider, Record<string, IconComponent>> = {
  aws: buildResolvedMap('aws'),
  azure: buildResolvedMap('azure'),
  gcp: buildResolvedMap('gcp'),
  generic: buildResolvedMap('generic'),
}

/**
 * Get the icon component for a resource type within a given provider.
 * Uses pre-computed lookup maps for simple record access.
 */
export function getCloudIcon(
  provider: CloudProvider,
  resourceType: string,
): IconComponent | undefined {
  return CLOUD_ICON_MAPS[provider][resourceType]
}
