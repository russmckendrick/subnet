import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CopyButton } from '@/components/shared/CopyButton'
import { SectionLabel } from '@/components/shared/LabelValue'

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
    <AnimatedCard delay={delay} className="p-3 group hover:border-sol-cyan/20 transition-colors">
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.copyKey}>
            <div className="flex items-start justify-between mb-0.5">
              <SectionLabel>{row.label}</SectionLabel>
              <CopyButton text={row.value} copyKey={row.copyKey} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold text-ink ${row.mono !== false ? 'font-mono' : ''}`}>
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
