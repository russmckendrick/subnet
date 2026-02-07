interface IconProps {
  className?: string
  color?: string
}

export function AwsVpcIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="2" y="2" width="20" height="20" rx="3" strokeDasharray="4 2" />
      <rect x="6" y="6" width="5" height="5" rx="1" />
      <rect x="13" y="6" width="5" height="5" rx="1" />
      <rect x="6" y="13" width="5" height="5" rx="1" />
      <rect x="13" y="13" width="5" height="5" rx="1" />
      <line x1="11" y1="8.5" x2="13" y2="8.5" />
      <line x1="11" y1="15.5" x2="13" y2="15.5" />
      <line x1="8.5" y1="11" x2="8.5" y2="13" />
      <line x1="15.5" y1="11" x2="15.5" y2="13" />
    </svg>
  )
}
