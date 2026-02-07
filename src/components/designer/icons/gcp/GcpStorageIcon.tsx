interface IconProps {
  className?: string
  color?: string
}

export function GcpStorageIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M4 4h16l-2 16H6L4 4z" />
      <path d="M4 4c0 1.5 3.582 2.5 8 2.5S20 5.5 20 4" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8.5" y1="14" x2="15.5" y2="14" />
    </svg>
  )
}
