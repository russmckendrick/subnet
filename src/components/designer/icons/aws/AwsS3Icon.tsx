interface IconProps {
  className?: string
  color?: string
}

export function AwsS3Icon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M5 6l1-3h12l1 3" />
      <path d="M5 6v13a2 2 0 002 2h10a2 2 0 002-2V6" />
      <path d="M5 6h14" />
      <path d="M5 11h14" />
      <line x1="9" y1="6" x2="9" y2="3" />
      <line x1="15" y1="6" x2="15" y2="3" />
      <circle cx="12" cy="15.5" r="2" />
    </svg>
  )
}
