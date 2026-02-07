interface IconProps {
  className?: string
  color?: string
}

export function AwsEcsIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="2" y="3" width="9" height="8" rx="1.5" />
      <rect x="13" y="3" width="9" height="8" rx="1.5" />
      <rect x="2" y="13" width="9" height="8" rx="1.5" />
      <rect x="13" y="13" width="9" height="8" rx="1.5" />
      <circle cx="5" cy="6" r="0.75" fill={color} stroke="none" />
      <circle cx="16" cy="6" r="0.75" fill={color} stroke="none" />
      <circle cx="5" cy="16" r="0.75" fill={color} stroke="none" />
      <circle cx="16" cy="16" r="0.75" fill={color} stroke="none" />
    </svg>
  )
}
