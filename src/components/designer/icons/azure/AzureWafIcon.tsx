interface IconProps {
  className?: string
  color?: string
}

export function AzureWafIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M12 2l8 4v6c0 5.25-3.5 9.5-8 11c-4.5-1.5-8-5.75-8-11V6l8-4z" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9.5 8L7 5.5" />
      <path d="M14.5 8L17 5.5" />
      <path d="M12 13v3" />
      <path d="M9.5 12L7 14.5" />
      <path d="M14.5 12L17 14.5" />
    </svg>
  )
}
