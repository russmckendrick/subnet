import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CopyButton } from '@/components/shared/CopyButton'

interface SubnetInfoRow {
  label: string
  value: string
  copyKey: string
  mono?: boolean
  badge?: React.ReactNode
}

interface SubnetInfoCardProps {
  rows: SubnetInfoRow[]
  delay?: number
}

export function SubnetInfoCard({ rows, delay = 0 }: SubnetInfoCardProps) {
  return (
    <AnimatedCard delay={delay} className="p-3 group hover:border-cyan-500/20 dark:hover:border-cyan-500/20 transition-colors">
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.copyKey}>
            <div className="flex items-start justify-between mb-0.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {row.label}
              </span>
              <CopyButton text={row.value} copyKey={row.copyKey} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold text-slate-900 dark:text-white ${row.mono !== false ? 'font-mono' : ''}`}>
                {row.value}
              </span>
              {row.badge}
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  )
}
