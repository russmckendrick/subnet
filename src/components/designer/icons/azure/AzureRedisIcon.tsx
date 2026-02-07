interface IconProps {
  className?: string
  color?: string
}

export function AzureRedisIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <ellipse cx="12" cy="7" rx="8" ry="3" />
      <path d="M4 7v5c0 1.657 3.582 3 8 3s8-1.343 8-3V7" />
      <path d="M15 14.5v4" />
      <path d="M13 16.5l2-2l2 2" />
      <path d="M13 18.5l2-2l2 2" />
    </svg>
  )
}
