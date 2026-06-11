interface BadgeProps {
  children: React.ReactNode
  color?: 'green' | 'violet' | 'yellow' | 'cyan' | 'red' | 'neutral'
}

const colorClasses = {
  green: 'bg-sol-green/15 text-sol-green border-sol-green/20',
  violet: 'bg-sol-violet/15 text-sol-violet border-sol-violet/20',
  yellow: 'bg-sol-yellow/15 text-sol-yellow border-sol-yellow/20',
  cyan: 'bg-sol-cyan/15 text-sol-cyan border-sol-cyan/20',
  red: 'bg-sol-red/15 text-sol-red border-sol-red/20',
  neutral: 'bg-sol-base01/15 text-ink border-sol-base01/20',
}

export function Badge({ children, color = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
      {children}
    </span>
  )
}
