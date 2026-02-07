interface IconProps {
  className?: string
  color?: string
}

export function AwsLambdaIcon({ className, color = '#FF9900' }: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} stroke={color}>
      <path d="M4 20h4l4-8.5L16.5 20H20" />
      <path d="M8 4h2.5l5.5 11" />
      <rect x="3" y="2" width="18" height="20" rx="2" />
    </svg>
  )
}
