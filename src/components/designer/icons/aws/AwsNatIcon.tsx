interface IconProps {
  className?: string
  color?: string
}

export function AwsNatIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M8 12h8" />
      <path d="M13 9l3 3-3 3" />
      <line x1="12" y1="3" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <circle cx="12" cy="3" r="1" fill={color} stroke="none" />
      <path d="M10 21h4" />
    </svg>
  )
}
