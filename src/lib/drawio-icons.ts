import type { CloudProvider } from './cloud-theme'
import { AWS_SVG_STRINGS } from './drawio-svg-strings/aws'
import { AZURE_SVG_STRINGS } from './drawio-svg-strings/azure'
import { GCP_SVG_STRINGS } from './drawio-svg-strings/gcp'
import { GENERIC_SVG_STRINGS } from './drawio-svg-strings/generic'

const PROVIDER_SVG_MAPS: Record<CloudProvider, Record<string, string>> = {
  aws: AWS_SVG_STRINGS,
  azure: AZURE_SVG_STRINGS,
  gcp: GCP_SVG_STRINGS,
  generic: {},
}

/** Map generic resource types to provider-specific types (mirrors cloud-icon-registry.ts) */
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
 * Get raw SVG string for a resource type within a given provider.
 * Tries: provider-specific → generic-to-provider mapping → generic fallback.
 */
export function getDrawioSvg(
  provider: CloudProvider,
  resourceType: string,
): string | undefined {
  const providerMap = PROVIDER_SVG_MAPS[provider]

  // Direct provider-specific lookup
  if (providerMap[resourceType]) {
    return providerMap[resourceType]
  }

  // Generic-to-provider mapping
  const mapping = GENERIC_TO_PROVIDER[provider]
  if (mapping[resourceType] && providerMap[mapping[resourceType]]) {
    return providerMap[mapping[resourceType]]
  }

  // Generic fallback
  return GENERIC_SVG_STRINGS[resourceType]
}

/**
 * Get a data URI for embedding an SVG icon in draw.io.
 * Returns `data:image/svg+xml,...` or undefined if no icon found.
 */
export function getDrawioSvgDataUri(
  provider: CloudProvider,
  resourceType: string,
): string | undefined {
  const svg = getDrawioSvg(provider, resourceType)
  if (!svg) return undefined
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
