import { useCalculatorStore } from '@/store/calculator-store'
import { ProviderCard } from './ProviderCard'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'

export function CloudContext() {
  const { result } = useCalculatorStore()
  if (!result) return null

  const providers = [
    result.cloudContext.aws,
    result.cloudContext.azure,
    result.cloudContext.gcp,
  ]

  return (
    <CollapsibleSection title="Cloud Provider Context" defaultOpen={false} delay={0.35}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {providers.map((p) => (
          <ProviderCard key={p.provider.id} data={p} prefix={result.prefixLength} />
        ))}
      </div>
    </CollapsibleSection>
  )
}
