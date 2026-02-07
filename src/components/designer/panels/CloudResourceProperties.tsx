import { useDesignerStore, type CloudResourceNodeData } from '@/store/designer-store'
import { getCloudTheme } from '@/lib/cloud-theme'
import { CLOUD_ICON_MAPS } from '../icons/cloud-icon-registry'

interface CloudResourcePropertiesProps {
  nodeId: string
  data: CloudResourceNodeData
}

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  // AWS
  'aws-vpc': 'VPC',
  'aws-ec2': 'EC2 Instance',
  'aws-rds': 'RDS Database',
  'aws-s3': 'S3 Bucket',
  'aws-lambda': 'Lambda Function',
  'aws-elb': 'Elastic Load Balancer',
  'aws-igw': 'Internet Gateway',
  'aws-nat': 'NAT Gateway',
  'aws-route53': 'Route 53',
  'aws-cloudfront': 'CloudFront',
  'aws-ecs': 'ECS / Fargate',
  'aws-eks': 'EKS',
  'aws-dynamodb': 'DynamoDB',
  'aws-elasticache': 'ElastiCache',
  'aws-waf': 'WAF',
  'aws-sg': 'Security Group',
  'aws-tgw': 'Transit Gateway',
  'aws-vpngw': 'VPN Gateway',
  // Azure
  'azure-vnet': 'Virtual Network',
  'azure-vm': 'Virtual Machine',
  'azure-sql': 'SQL Database',
  'azure-blob': 'Blob Storage',
  'azure-functions': 'Azure Functions',
  'azure-lb': 'Load Balancer',
  'azure-appgw': 'App Gateway',
  'azure-nat': 'NAT Gateway',
  'azure-dns': 'DNS Zone',
  'azure-frontdoor': 'Front Door',
  'azure-aks': 'AKS',
  'azure-container': 'Container Instances',
  'azure-cosmos': 'Cosmos DB',
  'azure-redis': 'Cache for Redis',
  'azure-nsg': 'Network Security Group',
  'azure-waf': 'WAF',
  'azure-vpngw': 'VPN Gateway',
  'azure-expressroute': 'ExpressRoute',
  // GCP
  'gcp-vpc': 'VPC Network',
  'gcp-compute': 'Compute Engine',
  'gcp-sql': 'Cloud SQL',
  'gcp-storage': 'Cloud Storage',
  'gcp-functions': 'Cloud Functions',
  'gcp-lb': 'Cloud Load Balancer',
  'gcp-nat': 'Cloud NAT',
  'gcp-dns': 'Cloud DNS',
  'gcp-cdn': 'Cloud CDN',
  'gcp-gke': 'GKE',
  'gcp-run': 'Cloud Run',
  'gcp-firestore': 'Firestore',
  'gcp-memorystore': 'Memorystore',
  'gcp-armor': 'Cloud Armor',
  'gcp-firewall': 'Firewall Rules',
  'gcp-interconnect': 'Cloud Interconnect',
  'gcp-vpn': 'Cloud VPN',
}

export function CloudResourceProperties({ nodeId, data }: CloudResourcePropertiesProps) {
  const { updateNodeLabel } = useDesignerStore()
  const theme = getCloudTheme(data.cloudProvider)
  const IconComponent = CLOUD_ICON_MAPS[data.cloudProvider][data.resourceType]

  return (
    <div className="space-y-5">
      {/* Icon preview */}
      <div className="flex items-center justify-center py-4">
        {IconComponent && (
          <div className="p-4 bg-[#eee8d5] dark:bg-[#073642] rounded-lg">
            <IconComponent className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Provider badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{ color: theme.badgeColor, backgroundColor: theme.badgeBg }}
        >
          {theme.name}
        </span>
      </div>

      {/* Resource type */}
      <div>
        <label className="block text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-1.5">
          Type
        </label>
        <div className="text-sm text-[#586e75] dark:text-[#93a1a1] bg-[#eee8d5] dark:bg-[#073642] px-3 py-2 rounded-lg">
          {RESOURCE_TYPE_LABELS[data.resourceType] ?? data.resourceType}
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="block text-[10px] font-semibold text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider mb-1.5">
          Label
        </label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => updateNodeLabel(nodeId, e.target.value)}
          className="w-full text-sm text-[#586e75] dark:text-[#93a1a1] bg-[#eee8d5] dark:bg-[#073642] border border-[#93a1a1]/20 dark:border-[#586e75]/30 px-3 py-2 rounded-lg outline-none focus:border-[#2aa198] transition-colors"
        />
      </div>
    </div>
  )
}
