interface IconProps {
  className?: string
  color?: string
}

export function AzureAppGwIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M12 2L3 7v10l9 5l9-5V7l-9-5z" />
      <path d="M12 8v8" />
      <path d="M8 10l4-2l4 2" />
      <path d="M8 14l4 2l4-2" />
    </svg>
  )
}
