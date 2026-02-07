interface IconProps {
  className?: string
  color?: string
}

export function AzureVpnGwIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M12 12.5v4" />
      <path d="M10 16.5h4" />
    </svg>
  )
}
