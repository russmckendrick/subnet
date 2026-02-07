interface IconProps {
  className?: string
  color?: string
}

export function GcpCdnIcon({ className, color = '#4285F4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M19.5 9A7.5 7.5 0 1 0 8 17.5h10a4.5 4.5 0 1 0-.5-9z" />
      <polyline points="14 14 17 11 14 8" />
      <line x1="7" y1="11" x2="17" y2="11" />
    </svg>
  )
}
