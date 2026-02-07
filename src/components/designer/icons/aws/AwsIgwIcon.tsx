interface IconProps {
  className?: string
  color?: string
}

export function AwsIgwIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M9 5.5l-1 1" />
      <path d="M16 17.5l-1 1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}
