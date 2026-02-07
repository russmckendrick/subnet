interface IconProps {
  className?: string
  color?: string
}

export function AzureDnsIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
      <path d="M5.5 7h13" />
      <path d="M5.5 17h13" />
    </svg>
  )
}
