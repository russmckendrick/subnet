interface IconProps {
  className?: string
  color?: string
}

export function AwsRdsIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
      <path d="M4 10c0 1.657 3.582 3 8 3s8-1.343 8-3" />
      <path d="M4 14c0 1.657 3.582 3 8 3s8-1.343 8-3" />
    </svg>
  )
}
