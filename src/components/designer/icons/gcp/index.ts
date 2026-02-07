import { GcpVpcIcon } from './GcpVpcIcon'
import { GcpComputeIcon } from './GcpComputeIcon'
import { GcpSqlIcon } from './GcpSqlIcon'
import { GcpStorageIcon } from './GcpStorageIcon'
import { GcpFunctionsIcon } from './GcpFunctionsIcon'
import { GcpLbIcon } from './GcpLbIcon'
import { GcpNatIcon } from './GcpNatIcon'
import { GcpDnsIcon } from './GcpDnsIcon'
import { GcpCdnIcon } from './GcpCdnIcon'
import { GcpGkeIcon } from './GcpGkeIcon'
import { GcpRunIcon } from './GcpRunIcon'
import { GcpFirestoreIcon } from './GcpFirestoreIcon'
import { GcpMemorystoreIcon } from './GcpMemorystoreIcon'
import { GcpArmorIcon } from './GcpArmorIcon'
import { GcpFirewallIcon } from './GcpFirewallIcon'
import { GcpInterconnectIcon } from './GcpInterconnectIcon'
import { GcpVpnIcon } from './GcpVpnIcon'

export const GCP_ICON_MAP: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
  'gcp-vpc': GcpVpcIcon,
  'gcp-compute': GcpComputeIcon,
  'gcp-sql': GcpSqlIcon,
  'gcp-storage': GcpStorageIcon,
  'gcp-functions': GcpFunctionsIcon,
  'gcp-lb': GcpLbIcon,
  'gcp-nat': GcpNatIcon,
  'gcp-dns': GcpDnsIcon,
  'gcp-cdn': GcpCdnIcon,
  'gcp-gke': GcpGkeIcon,
  'gcp-run': GcpRunIcon,
  'gcp-firestore': GcpFirestoreIcon,
  'gcp-memorystore': GcpMemorystoreIcon,
  'gcp-armor': GcpArmorIcon,
  'gcp-firewall': GcpFirewallIcon,
  'gcp-interconnect': GcpInterconnectIcon,
  'gcp-vpn': GcpVpnIcon,
}
