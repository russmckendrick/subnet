interface IconProps {
  className?: string
  color?: string
}

export function AwsVpnGwIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <circle cx="8" cy="12" r="2.5" />
      <path d="M8 9.5v-1" />
      <path d="M8 14.5v1" />
      <path d="M5.5 12h-1" />
      <path d="M10.5 12h1" />
      <line x1="13" y1="10" x2="19" y2="10" />
      <line x1="13" y1="12" x2="19" y2="12" />
      <line x1="13" y1="14" x2="19" y2="14" />
      <path d="M6 7V5h4v2" />
      <path d="M14 7V5h4v2" />
    </svg>
  )
}
