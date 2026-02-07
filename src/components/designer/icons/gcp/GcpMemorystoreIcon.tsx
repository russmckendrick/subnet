interface IconProps {
  className?: string
  color?: string
}

export function GcpMemorystoreIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <rect x="3" y="11" width="18" height="5" rx="1" />
      <circle cx="6" cy="6.5" r="1" />
      <circle cx="6" cy="13.5" r="1" />
      <line x1="9" y1="6.5" x2="18" y2="6.5" />
      <line x1="9" y1="13.5" x2="18" y2="13.5" />
      <path d="M9 18l3 3 3-3" />
      <line x1="12" y1="16" x2="12" y2="21" />
    </svg>
  )
}
