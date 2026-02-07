interface IconProps {
  className?: string
  color?: string
}

export function GcpNatIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="8" y="4" width="8" height="16" rx="2" />
      <path d="M3 12h5" />
      <path d="M16 12h5" />
      <polyline points="18 9 21 12 18 15" />
      <path d="M12 8v3" />
      <path d="M12 13v3" />
    </svg>
  )
}
