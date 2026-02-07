interface IconProps {
  className?: string
  color?: string
}

export function AwsTransitGwIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="3" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="21" />
      <line x1="3" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="21" y2="12" />
      <line x1="5.6" y1="5.6" x2="9.2" y2="9.2" />
      <line x1="14.8" y1="14.8" x2="18.4" y2="18.4" />
      <line x1="5.6" y1="18.4" x2="9.2" y2="14.8" />
      <line x1="14.8" y1="9.2" x2="18.4" y2="5.6" />
      <circle cx="12" cy="3" r="1.5" />
      <circle cx="12" cy="21" r="1.5" />
      <circle cx="3" cy="12" r="1.5" />
      <circle cx="21" cy="12" r="1.5" />
    </svg>
  )
}
