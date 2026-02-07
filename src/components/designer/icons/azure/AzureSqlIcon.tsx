interface IconProps {
  className?: string
  color?: string
}

export function AzureSqlIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.657 3.582 3 8 3s8-1.343 8-3V5" />
      <path d="M4 10c0 1.657 3.582 3 8 3s8-1.343 8-3" />
      <path d="M4 15c0 1.657 3.582 3 8 3s8-1.343 8-3" />
    </svg>
  )
}
