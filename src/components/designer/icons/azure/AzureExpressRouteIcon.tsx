interface IconProps {
  className?: string
  color?: string
}

export function AzureExpressRouteIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <circle cx="4" cy="12" r="2.5" />
      <circle cx="20" cy="12" r="2.5" />
      <path d="M6.5 12h4" />
      <path d="M13.5 12h4" />
      <path d="M10.5 9l3 3-3 3" />
      <path d="M3 5l1 2" />
      <path d="M5 5l-1 2" />
      <path d="M19 5l1 2" />
      <path d="M21 5l-1 2" />
    </svg>
  )
}
