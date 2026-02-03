import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CopyButton } from '@/components/shared/CopyButton'

interface SubnetInfoCardProps {
  label: string
  value: string
  copyKey: string
  delay?: number
  mono?: boolean
  badge?: React.ReactNode
}

export function SubnetInfoCard({ label, value, copyKey, delay = 0, mono = true, badge }: SubnetInfoCardProps) {
  return (
    <AnimatedCard delay={delay} className="p-4 group hover:border-cyan-500/20 dark:hover:border-cyan-500/20 transition-colors">
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <CopyButton text={value} copyKey={copyKey} />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-lg font-semibold text-slate-900 dark:text-white ${mono ? 'font-mono' : ''}`}>
          {value}
        </span>
        {badge}
      </div>
    </AnimatedCard>
  )
}
