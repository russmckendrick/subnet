interface IconProps {
  className?: string
  color?: string
}

export function AzureNatIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M1 12h3" />
      <path d="M20 12h3" />
      <path d="M8 12h8" />
      <path d="M13 9l3 3-3 3" />
    </svg>
  )
}
