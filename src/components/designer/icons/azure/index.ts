import { AzureAksIcon } from './AzureAksIcon'
import { AzureAppGwIcon } from './AzureAppGwIcon'
import { AzureAppServicesIcon } from './AzureAppServicesIcon'
import { AzureBlobIcon } from './AzureBlobIcon'
import { AzureContainerIcon } from './AzureContainerIcon'
import { AzureCosmosIcon } from './AzureCosmosIcon'
import { AzureDnsIcon } from './AzureDnsIcon'
import { AzureExpressRouteIcon } from './AzureExpressRouteIcon'
import { AzureFilesIcon } from './AzureFilesIcon'
import { AzureFirewallIcon } from './AzureFirewallIcon'
import { AzureFrontDoorIcon } from './AzureFrontDoorIcon'
import { AzureFunctionsIcon } from './AzureFunctionsIcon'
import { AzureLbIcon } from './AzureLbIcon'
import { AzureNatIcon } from './AzureNatIcon'
import { AzureNsgIcon } from './AzureNsgIcon'
import { AzurePrivateLinkIcon } from './AzurePrivateLinkIcon'
import { AzureRecoveryServicesVaultsIcon } from './AzureRecoveryServicesVaultsIcon'
import { AzureRedisIcon } from './AzureRedisIcon'
import { AzureSqlIcon } from './AzureSqlIcon'
import { AzureSubnetIcon } from './AzureSubnetIcon'
import { AzureVmIcon } from './AzureVmIcon'
import { AzureVnetIcon } from './AzureVnetIcon'
import { AzureVpnGwIcon } from './AzureVpnGwIcon'
import { AzureWafIcon } from './AzureWafIcon'

export const AZURE_ICON_MAP: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
  'azure-aks': AzureAksIcon,
  'azure-appgw': AzureAppGwIcon,
  'azure-appservices': AzureAppServicesIcon,
  'azure-blob': AzureBlobIcon,
  'azure-container': AzureContainerIcon,
  'azure-cosmos': AzureCosmosIcon,
  'azure-dns': AzureDnsIcon,
  'azure-expressroute': AzureExpressRouteIcon,
  'azure-files': AzureFilesIcon,
  'azure-firewall': AzureFirewallIcon,
  'azure-frontdoor': AzureFrontDoorIcon,
  'azure-functions': AzureFunctionsIcon,
  'azure-lb': AzureLbIcon,
  'azure-nat': AzureNatIcon,
  'azure-nsg': AzureNsgIcon,
  'azure-privatelink': AzurePrivateLinkIcon,
  'azure-recoveryservicesvaults': AzureRecoveryServicesVaultsIcon,
  'azure-redis': AzureRedisIcon,
  'azure-sql': AzureSqlIcon,
  'azure-subnet': AzureSubnetIcon,
  'azure-vm': AzureVmIcon,
  'azure-vnet': AzureVnetIcon,
  'azure-vpngw': AzureVpnGwIcon,
  'azure-waf': AzureWafIcon,
}
