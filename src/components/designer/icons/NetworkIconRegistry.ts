import type { ComponentType } from 'react'
import {
  CdnIcon,
  CloudIcon,
  DatabaseIcon,
  DnsIcon,
  FirewallIcon,
  InternetGatewayIcon,
  LoadBalancerIcon,
  NatGatewayIcon,
  RouterIcon,
  ServerIcon,
  SubnetIcon,
  SwitchIcon,
  VpcIcon,
} from './NetworkIcons'

interface IconProps {
  className?: string
  color?: string
}

export const RESOURCE_ICONS: Record<string, ComponentType<IconProps>> = {
  router: RouterIcon,
  switch: SwitchIcon,
  firewall: FirewallIcon,
  server: ServerIcon,
  database: DatabaseIcon,
  'load-balancer': LoadBalancerIcon,
  'internet-gateway': InternetGatewayIcon,
  'nat-gateway': NatGatewayIcon,
  dns: DnsIcon,
  cdn: CdnIcon,
  cloud: CloudIcon,
  vpc: VpcIcon,
  subnet: SubnetIcon,
}
