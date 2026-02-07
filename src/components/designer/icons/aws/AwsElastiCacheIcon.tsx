interface IconProps {
  className?: string
  color?: string
}

export function AwsElastiCacheIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.657 3.134 3 7 3s7-1.343 7-3V6" />
      <path d="M5 12c0 1.657 3.134 3 7 3s7-1.343 7-3" />
      <path d="M14 14l-1-2h2l-1-2" />
      <circle cx="10" cy="16" r="0.75" fill={color} stroke="none" />
      <circle cx="14" cy="16" r="0.75" fill={color} stroke="none" />
    </svg>
  )
}
