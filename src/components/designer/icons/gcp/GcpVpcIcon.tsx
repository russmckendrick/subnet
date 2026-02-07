interface IconProps {
  className?: string
  color?: string
}

export function GcpVpcIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="2" y="3" width="20" height="18" rx="2" strokeDasharray="4 2" />
      <rect x="5" y="7" width="6" height="4" rx="1" />
      <rect x="13" y="7" width="6" height="4" rx="1" />
      <rect x="5" y="13" width="6" height="4" rx="1" />
      <rect x="13" y="13" width="6" height="4" rx="1" />
      <line x1="11" y1="9" x2="13" y2="9" />
      <line x1="11" y1="15" x2="13" y2="15" />
      <line x1="8" y1="11" x2="8" y2="13" />
      <line x1="16" y1="11" x2="16" y2="13" />
    </svg>
  )
}
