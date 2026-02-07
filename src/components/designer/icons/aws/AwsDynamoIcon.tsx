interface IconProps {
  className?: string
  color?: string
}

export function AwsDynamoIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.657 3.134 3 7 3s7-1.343 7-3V6" />
      <path d="M5 12c0 1.657 3.134 3 7 3s7-1.343 7-3" />
      <path d="M13 9l2.5 4-2.5 4" />
      <path d="M11 9L8.5 13l2.5 4" />
    </svg>
  )
}
