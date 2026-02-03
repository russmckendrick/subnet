import { useCalculatorStore } from '@/store/calculator-store'
import { ProviderCard } from './ProviderCard'
import { AnimatedCard } from '@/components/shared/AnimatedCard'

export function CloudContext() {
  const { result } = useCalculatorStore()
  if (!result) return null

  const providers = [
    result.cloudContext.aws,
    result.cloudContext.azure,
    result.cloudContext.gcp,
  ]

  return (
    <AnimatedCard delay={0.5} className="p-5 mt-3">
      <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        Cloud Provider Context
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {providers.map((p) => (
          <ProviderCard key={p.provider.id} data={p} prefix={result.prefixLength} />
        ))}
      </div>
    </AnimatedCard>
  )
}
