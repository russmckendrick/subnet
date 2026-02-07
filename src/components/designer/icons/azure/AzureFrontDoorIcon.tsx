interface IconProps {
  className?: string
  color?: string
}

export function AzureFrontDoorIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M4 8h16" />
      <rect x="7" y="11" width="4" height="6" rx="0.5" />
      <rect x="13" y="11" width="4" height="6" rx="0.5" />
      <circle cx="10" cy="14" r="0.5" fill={color} stroke="none" />
      <circle cx="16" cy="14" r="0.5" fill={color} stroke="none" />
    </svg>
  )
}
