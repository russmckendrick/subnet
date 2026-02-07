interface IconProps {
  className?: string
  color?: string
}

export function GcpFirestoreIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M8 21l4-7 4 7H8z" />
      <path d="M10 14l2-4 2 4" />
      <path d="M11 10l1-3 1 3" />
      <path d="M6 3h5v4H6V3z" />
      <path d="M13 5h5v4h-5V5z" />
      <line x1="8.5" y1="7" x2="8.5" y2="14" />
      <line x1="15.5" y1="9" x2="15.5" y2="14" />
    </svg>
  )
}
