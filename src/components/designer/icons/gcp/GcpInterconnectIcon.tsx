interface IconProps {
  className?: string
  color?: string
}

export function GcpInterconnectIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="2" y="8" width="6" height="8" rx="1" />
      <rect x="16" y="8" width="6" height="8" rx="1" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <polyline points="13 7 16 10 13 13" />
      <polyline points="11 11 8 14 11 17" />
    </svg>
  )
}
