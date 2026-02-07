interface IconProps {
  className?: string
  color?: string
}

export function AwsSgIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M12 2l8 4v6c0 5.25-3.5 9.5-8 11-4.5-1.5-8-5.75-8-11V6l8-4z" />
      <rect x="9.5" y="10" width="5" height="5" rx="1" />
      <path d="M10.5 10V8.5a1.5 1.5 0 013 0V10" />
      <circle cx="12" cy="12.5" r="0.75" fill={color} stroke="none" />
    </svg>
  )
}
