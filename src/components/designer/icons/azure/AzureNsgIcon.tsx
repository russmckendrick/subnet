interface IconProps {
  className?: string
  color?: string
}

export function AzureNsgIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M12 2l8 4v6c0 5.25-3.5 9.5-8 11c-4.5-1.5-8-5.75-8-11V6l8-4z" />
      <path d="M8 12h8" />
      <path d="M8 9h8" />
      <path d="M8 15h8" />
    </svg>
  )
}
