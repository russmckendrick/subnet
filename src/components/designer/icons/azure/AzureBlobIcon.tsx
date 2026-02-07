interface IconProps {
  className?: string
  color?: string
}

export function AzureBlobIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <circle cx="6" cy="6.5" r="0.75" fill={color} stroke="none" />
      <circle cx="9" cy="6.5" r="0.75" fill={color} stroke="none" />
      <rect x="6" y="12" width="5" height="5" rx="1" />
      <rect x="13" y="12" width="5" height="5" rx="1" />
    </svg>
  )
}
