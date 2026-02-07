interface IconProps {
  className?: string
  color?: string
}

const defaultProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function RouterIcon({ className, color = '#2aa198' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="7" cy="12" r="1.5" fill={color} stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      <path d="M16 9l2 3-2 3" />
      <path d="M2 12h-1M23 12h-1" />
    </svg>
  )
}

export function SwitchIcon({ className, color = '#268bd2' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <rect x="2" y="7" width="20" height="10" rx="2" />
      <line x1="6" y1="10" x2="6" y2="14" />
      <line x1="10" y1="10" x2="10" y2="14" />
      <line x1="14" y1="10" x2="14" y2="14" />
      <line x1="18" y1="10" x2="18" y2="14" />
    </svg>
  )
}

export function FirewallIcon({ className, color = '#dc322f' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18" />
      <path d="M9 3v6M15 9v6M9 15v6" />
    </svg>
  )
}

export function ServerIcon({ className, color = '#586e75' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <rect x="4" y="2" width="16" height="6" rx="1.5" />
      <rect x="4" y="10" width="16" height="6" rx="1.5" />
      <circle cx="7.5" cy="5" r="1" fill={color} stroke="none" />
      <circle cx="7.5" cy="13" r="1" fill={color} stroke="none" />
      <path d="M12 18v3M8 21h8" />
    </svg>
  )
}

export function DatabaseIcon({ className, color = '#6c71c4' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.657 3.582 3 8 3s8-1.343 8-3V5" />
      <path d="M4 12c0 1.657 3.582 3 8 3s8-1.343 8-3" />
    </svg>
  )
}

export function LoadBalancerIcon({ className, color = '#b58900' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <circle cx="12" cy="5" r="3" />
      <circle cx="5" cy="19" r="3" />
      <circle cx="19" cy="19" r="3" />
      <path d="M10.5 7.5L6.5 16.5" />
      <path d="M13.5 7.5L17.5 16.5" />
    </svg>
  )
}

export function InternetGatewayIcon({ className, color = '#859900' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  )
}

export function CloudIcon({ className, color = '#839496' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <path d="M6.5 19h11a4.5 4.5 0 001.393-8.776A5.5 5.5 0 0013.5 4a5.5 5.5 0 00-5.261 3.874A4.5 4.5 0 006.5 19z" />
    </svg>
  )
}

export function VpcIcon({ className, color = '#cb4b16' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <rect x="2" y="2" width="20" height="20" rx="3" strokeDasharray="4 2" />
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M12 6v12M6 12h12" />
    </svg>
  )
}

export function SubnetIcon({ className, color = '#2aa198' }: IconProps) {
  return (
    <svg {...defaultProps} className={className} stroke={color}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  )
}

export const RESOURCE_ICONS: Record<string, React.ComponentType<IconProps>> = {
  router: RouterIcon,
  switch: SwitchIcon,
  firewall: FirewallIcon,
  server: ServerIcon,
  database: DatabaseIcon,
  'load-balancer': LoadBalancerIcon,
  'internet-gateway': InternetGatewayIcon,
  cloud: CloudIcon,
  vpc: VpcIcon,
  subnet: SubnetIcon,
}
