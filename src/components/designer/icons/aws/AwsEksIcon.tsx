interface IconProps {
  className?: string
  color?: string
}

export function AwsEksIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <line x1="12" y1="3" x2="12" y2="9.5" />
      <line x1="12" y1="14.5" x2="12" y2="21" />
      <line x1="3.7" y1="7.5" x2="9.8" y2="10.8" />
      <line x1="14.2" y1="13.2" x2="20.3" y2="16.5" />
      <line x1="3.7" y1="16.5" x2="9.8" y2="13.2" />
      <line x1="14.2" y1="10.8" x2="20.3" y2="7.5" />
    </svg>
  )
}
