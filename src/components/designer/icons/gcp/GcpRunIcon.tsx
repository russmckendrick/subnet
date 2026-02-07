interface IconProps {
  className?: string
  color?: string
}

export function GcpRunIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <polygon points="10,8 10,16 16,12" />
    </svg>
  )
}
