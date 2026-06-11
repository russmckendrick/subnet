import { useDesignerStore } from '@/store/designer-store'
import { PaletteItem } from './PaletteItem'
import { CloudProviderSelector } from './CloudProviderSelector'
import { useTouchDetect } from '@/hooks/use-touch-detect'
import type { CloudProvider } from '@/lib/cloud-theme'

interface PaletteCategory {
  name: string
  items: { type: string; label: string }[]
}

const GENERIC_CATEGORIES: PaletteCategory[] = [
  {
    name: 'Network',
    items: [
      { type: 'router', label: 'Router' },
      { type: 'switch', label: 'Switch' },
      { type: 'firewall', label: 'Firewall' },
      { type: 'load-balancer', label: 'Load Balancer' },
      { type: 'internet-gateway', label: 'Internet Gateway' },
      { type: 'nat-gateway', label: 'NAT Gateway' },
      { type: 'dns', label: 'DNS' },
      { type: 'cdn', label: 'CDN' },
    ],
  },
  {
    name: 'Compute',
    items: [
      { type: 'server', label: 'Server' },
      { type: 'database', label: 'Database' },
    ],
  },
  {
    name: 'Cloud',
    items: [
      { type: 'vpc', label: 'VPC / VNet' },
      { type: 'cloud', label: 'Cloud' },
    ],
  },
]

const AWS_CATEGORIES: PaletteCategory[] = [
  {
    name: 'Networking',
    items: [
      { type: 'aws-igw', label: 'Internet Gateway' },
      { type: 'aws-nat', label: 'NAT Gateway' },
      { type: 'aws-elb', label: 'ELB / ALB' },
      { type: 'aws-route53', label: 'Route 53' },
      { type: 'aws-cloudfront', label: 'CloudFront' },
      { type: 'aws-tgw', label: 'Transit Gateway' },
      { type: 'aws-vpngw', label: 'VPN Gateway' },
    ],
  },
  {
    name: 'Compute',
    items: [
      { type: 'aws-ec2', label: 'EC2 Instance' },
      { type: 'aws-lambda', label: 'Lambda' },
      { type: 'aws-ecs', label: 'ECS / Fargate' },
      { type: 'aws-eks', label: 'EKS' },
    ],
  },
  {
    name: 'Database',
    items: [
      { type: 'aws-rds', label: 'RDS' },
      { type: 'aws-dynamodb', label: 'DynamoDB' },
      { type: 'aws-elasticache', label: 'ElastiCache' },
    ],
  },
  {
    name: 'Storage & Security',
    items: [
      { type: 'aws-s3', label: 'S3' },
      { type: 'aws-waf', label: 'WAF' },
      { type: 'aws-sg', label: 'Security Group' },
    ],
  },
]

const AZURE_CATEGORIES: PaletteCategory[] = [
  {
    name: 'Networking',
    items: [
      { type: 'azure-appgw', label: 'App Gateway' },
      { type: 'azure-nat', label: 'NAT Gateway' },
      { type: 'azure-lb', label: 'Load Balancer' },
      { type: 'azure-frontdoor', label: 'Front Door' },
      { type: 'azure-dns', label: 'DNS Zone' },
      { type: 'azure-vpngw', label: 'VPN Gateway' },
      { type: 'azure-expressroute', label: 'ExpressRoute' },
      { type: 'azure-firewall', label: 'Firewall' },
      { type: 'azure-privatelink', label: 'Private Link' },
      { type: 'azure-subnet', label: 'Subnet' },
    ],
  },
  {
    name: 'Compute',
    items: [
      { type: 'azure-vm', label: 'Virtual Machine' },
      { type: 'azure-functions', label: 'Functions' },
      { type: 'azure-aks', label: 'AKS' },
      { type: 'azure-container', label: 'Container Instances' },
      { type: 'azure-appservices', label: 'App Services' },
    ],
  },
  {
    name: 'Database',
    items: [
      { type: 'azure-sql', label: 'SQL Database' },
      { type: 'azure-cosmos', label: 'Cosmos DB' },
      { type: 'azure-redis', label: 'Cache for Redis' },
    ],
  },
  {
    name: 'Storage & Security',
    items: [
      { type: 'azure-blob', label: 'Blob Storage' },
      { type: 'azure-waf', label: 'WAF' },
      { type: 'azure-nsg', label: 'NSG' },
      { type: 'azure-files', label: 'Azure Files' },
      { type: 'azure-recoveryservicesvaults', label: 'Recovery Services Vault' },
    ],
  },
]

const GCP_CATEGORIES: PaletteCategory[] = [
  {
    name: 'Networking',
    items: [
      { type: 'gcp-lb', label: 'Load Balancer' },
      { type: 'gcp-nat', label: 'Cloud NAT' },
      { type: 'gcp-cdn', label: 'Cloud CDN' },
      { type: 'gcp-dns', label: 'Cloud DNS' },
      { type: 'gcp-interconnect', label: 'Interconnect' },
      { type: 'gcp-vpn', label: 'Cloud VPN' },
    ],
  },
  {
    name: 'Compute',
    items: [
      { type: 'gcp-compute', label: 'Compute Engine' },
      { type: 'gcp-functions', label: 'Cloud Functions' },
      { type: 'gcp-gke', label: 'GKE' },
      { type: 'gcp-run', label: 'Cloud Run' },
    ],
  },
  {
    name: 'Database',
    items: [
      { type: 'gcp-sql', label: 'Cloud SQL' },
      { type: 'gcp-firestore', label: 'Firestore' },
      { type: 'gcp-memorystore', label: 'Memorystore' },
    ],
  },
  {
    name: 'Storage & Security',
    items: [
      { type: 'gcp-storage', label: 'Cloud Storage' },
      { type: 'gcp-armor', label: 'Cloud Armor' },
      { type: 'gcp-firewall', label: 'Firewall Rules' },
    ],
  },
]

const PROVIDER_CATEGORIES: Record<CloudProvider, PaletteCategory[]> = {
  generic: GENERIC_CATEGORIES,
  aws: AWS_CATEGORIES,
  azure: AZURE_CATEGORIES,
  gcp: GCP_CATEGORIES,
}

interface ResourcePaletteProps {
  /** "sheet" renders bare content for use inside an overlay Drawer (tablet/mobile). */
  variant?: 'sidebar' | 'sheet'
}

export function ResourcePalette({ variant = 'sidebar' }: ResourcePaletteProps) {
  const { isPaletteOpen, setIsPaletteOpen, cloudProvider } = useDesignerStore()
  const isTouch = useTouchDetect()
  const categories = PROVIDER_CATEGORIES[cloudProvider]

  // Determine if items should use cloud resource node type
  const isCloudProvider = cloudProvider !== 'generic'

  // Sheet: bare content for the overlay Drawer — tap-to-place flow
  if (variant === 'sheet') {
    return (
      <div className="flex flex-col gap-4">
        <CloudProviderSelector />
        {categories.map((category) => (
          <div key={category.name}>
            <h4 className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-2">
              {category.name}
            </h4>
            <div className="space-y-1.5">
              {category.items.map((item) => (
                <PaletteItem
                  key={item.type}
                  resourceType={item.type}
                  label={item.label}
                  useCloudNode={isCloudProvider}
                  forceTap
                />
              ))}
            </div>
          </div>
        ))}
        <p className="text-[10px] text-ink-muted">
          Tap an item, then tap the canvas to place it.
        </p>
      </div>
    )
  }

  // Collapsed: icon-only strip
  if (!isPaletteOpen) {
    return (
      <div className="shrink-0 border-r border-line/15 bg-canvas w-12 flex flex-col">
        {/* Expand button */}
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="flex items-center justify-center py-2.5 border-b border-line/15 hover:bg-surface transition-colors"
          aria-label="Expand palette"
        >
          <svg className="w-3.5 h-3.5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Icon-only items */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {categories.map((category) =>
            category.items.map((item) => (
              <PaletteItem
                key={item.type}
                resourceType={item.type}
                label={item.label}
                compact
                useCloudNode={isCloudProvider}
              />
            )),
          )}
        </div>
      </div>
    )
  }

  // Expanded: full labels
  return (
    <div className="shrink-0 border-r border-line/15 bg-canvas w-56 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-line/15">
        <span className="text-xs font-semibold text-ink uppercase tracking-wider">
          Resources
        </span>
        <button
          onClick={() => setIsPaletteOpen(false)}
          className="p-1 rounded hover:bg-surface transition-colors"
          aria-label="Collapse palette"
        >
          <svg className="w-3.5 h-3.5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Cloud Provider Selector */}
      <div className="px-3 py-2 border-b border-line/15">
        <CloudProviderSelector />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((category) => (
          <div key={category.name}>
            <h4 className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-2">
              {category.name}
            </h4>
            <div className="space-y-1.5">
              {category.items.map((item) => (
                <PaletteItem
                  key={item.type}
                  resourceType={item.type}
                  label={item.label}
                  useCloudNode={isCloudProvider}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="px-3 py-2 border-t border-line/15">
        <p className="text-[10px] text-ink-muted">
          {isTouch
            ? 'Tap an item, then tap the canvas to place it.'
            : 'Drag items onto the canvas to add them to your diagram.'}
        </p>
      </div>
    </div>
  )
}
