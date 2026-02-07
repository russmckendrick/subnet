interface IconProps {
  className?: string
  color?: string
}

export function GcpFirewallIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="2" y1="17" x2="22" y2="17" />
      <line x1="8" y1="3" x2="8" y2="10" />
      <line x1="16" y1="3" x2="16" y2="10" />
      <line x1="12" y1="10" x2="12" y2="17" />
      <line x1="8" y1="17" x2="8" y2="21" />
      <line x1="16" y1="17" x2="16" y2="21" />
    </svg>
  )
}
