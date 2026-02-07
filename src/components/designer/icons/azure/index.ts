import { AzureVnetIcon } from './AzureVnetIcon'
import { AzureVmIcon } from './AzureVmIcon'
import { AzureSqlIcon } from './AzureSqlIcon'
import { AzureBlobIcon } from './AzureBlobIcon'
import { AzureFunctionsIcon } from './AzureFunctionsIcon'
import { AzureLbIcon } from './AzureLbIcon'
import { AzureAppGwIcon } from './AzureAppGwIcon'
import { AzureNatIcon } from './AzureNatIcon'
import { AzureDnsIcon } from './AzureDnsIcon'
import { AzureFrontDoorIcon } from './AzureFrontDoorIcon'
import { AzureAksIcon } from './AzureAksIcon'
import { AzureContainerIcon } from './AzureContainerIcon'
import { AzureCosmosIcon } from './AzureCosmosIcon'
import { AzureRedisIcon } from './AzureRedisIcon'
import { AzureNsgIcon } from './AzureNsgIcon'
import { AzureWafIcon } from './AzureWafIcon'
import { AzureVpnGwIcon } from './AzureVpnGwIcon'
import { AzureExpressRouteIcon } from './AzureExpressRouteIcon'

export const AZURE_ICON_MAP: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
  'azure-vnet': AzureVnetIcon,
  'azure-vm': AzureVmIcon,
  'azure-sql': AzureSqlIcon,
  'azure-blob': AzureBlobIcon,
  'azure-functions': AzureFunctionsIcon,
  'azure-lb': AzureLbIcon,
  'azure-appgw': AzureAppGwIcon,
  'azure-nat': AzureNatIcon,
  'azure-dns': AzureDnsIcon,
  'azure-frontdoor': AzureFrontDoorIcon,
  'azure-aks': AzureAksIcon,
  'azure-container': AzureContainerIcon,
  'azure-cosmos': AzureCosmosIcon,
  'azure-redis': AzureRedisIcon,
  'azure-nsg': AzureNsgIcon,
  'azure-waf': AzureWafIcon,
  'azure-vpngw': AzureVpnGwIcon,
  'azure-expressroute': AzureExpressRouteIcon,
}
