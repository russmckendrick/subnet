interface IconProps {
  className?: string
  color?: string
}

export function GcpLbIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="7" y1="12" x2="17" y2="5" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="12" x2="17" y2="19" />
    </svg>
  )
}
