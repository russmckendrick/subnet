interface IconProps {
  className?: string
  color?: string
}

export function GcpGkeIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <line x1="3.8" y1="16.5" x2="9.4" y2="13.5" />
      <line x1="14.6" y1="10.5" x2="20.2" y2="7.5" />
      <line x1="3.8" y1="7.5" x2="9.4" y2="10.5" />
      <line x1="14.6" y1="13.5" x2="20.2" y2="16.5" />
    </svg>
  )
}
