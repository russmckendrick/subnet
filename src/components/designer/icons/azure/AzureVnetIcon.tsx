interface IconProps {
  className?: string
  color?: string
}

export function AzureVnetIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="2" y="2" width="20" height="20" rx="3" strokeDasharray="4 2" />
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
