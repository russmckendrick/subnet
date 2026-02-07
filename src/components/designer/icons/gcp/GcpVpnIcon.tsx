interface IconProps {
  className?: string
  color?: string
}

export function GcpVpnIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="5" y="4" width="14" height="16" rx="3" strokeDasharray="4 2" />
      <rect x="8" y="9" width="8" height="7" rx="1" />
      <circle cx="12" cy="12" r="1.5" />
      <line x1="12" y1="13.5" x2="12" y2="15" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    </svg>
  )
}
