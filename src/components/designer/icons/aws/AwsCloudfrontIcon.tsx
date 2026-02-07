interface IconProps {
  className?: string
  color?: string
}

export function AwsCloudfrontIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M6.5 18h11a4.5 4.5 0 001.393-8.776A5.5 5.5 0 0013.5 4a5.5 5.5 0 00-5.261 3.874A4.5 4.5 0 006.5 18z" />
      <line x1="8" y1="21" x2="8" y2="18" />
      <line x1="12" y1="21" x2="12" y2="18" />
      <line x1="16" y1="21" x2="16" y2="18" />
      <line x1="5" y1="22" x2="19" y2="22" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  )
}
