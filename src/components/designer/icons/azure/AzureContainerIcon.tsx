interface IconProps {
  className?: string
  color?: string
}

export function AzureContainerIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M12 2L3 7l9 5l9-5l-9-5z" />
      <path d="M3 7v10l9 5V12" />
      <path d="M21 7v10l-9 5V12" />
      <path d="M3 12l9 5l9-5" />
    </svg>
  )
}
