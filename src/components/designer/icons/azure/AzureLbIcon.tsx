interface IconProps {
  className?: string
  color?: string
}

export function AzureLbIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <circle cx="12" cy="4.5" r="2.5" />
      <circle cx="5" cy="19.5" r="2.5" />
      <circle cx="12" cy="19.5" r="2.5" />
      <circle cx="19" cy="19.5" r="2.5" />
      <path d="M12 7v10" />
      <path d="M10.5 7.5L6.5 17" />
      <path d="M13.5 7.5L17.5 17" />
    </svg>
  )
}
