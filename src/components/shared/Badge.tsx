interface BadgeProps {
  children: React.ReactNode
  color?: 'emerald' | 'violet' | 'amber' | 'cyan' | 'red' | 'slate'
}

const colorClasses = {
  emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  violet: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/20',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
  red: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
  slate: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20',
}

export function Badge({ children, color = 'slate' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
      {children}
    </span>
  )
}
