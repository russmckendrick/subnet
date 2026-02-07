interface BadgeProps {
  children: React.ReactNode
  color?: 'emerald' | 'violet' | 'amber' | 'cyan' | 'red' | 'slate'
}

const colorClasses = {
  emerald: 'bg-[#859900]/15 text-[#859900] border-[#859900]/20',
  violet: 'bg-[#6c71c4]/15 text-[#6c71c4] border-[#6c71c4]/20',
  amber: 'bg-[#b58900]/15 text-[#b58900] border-[#b58900]/20',
  cyan: 'bg-[#2aa198]/15 text-[#2aa198] border-[#2aa198]/20',
  red: 'bg-[#dc322f]/15 text-[#dc322f] border-[#dc322f]/20',
  slate: 'bg-[#586e75]/15 text-[#586e75] dark:text-[#93a1a1] border-[#586e75]/20',
}

export function Badge({ children, color = 'slate' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
      {children}
    </span>
  )
}
