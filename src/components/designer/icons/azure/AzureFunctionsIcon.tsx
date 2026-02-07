interface IconProps {
  className?: string
  color?: string
}

export function AzureFunctionsIcon({ className, color = '#0078D4' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M13 2L4.094 12.688l4.5.312L7 22l8.906-10.688-4.5-.312L13 2z" />
    </svg>
  )
}
