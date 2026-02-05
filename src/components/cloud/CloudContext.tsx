import { useCalculatorStore } from '@/store/calculator-store'
import { ProviderCard } from './ProviderCard'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'

function CloudContextInner() {
  const { result } = useCalculatorStore()
  if (!result) return null

  const providers = [
    result.cloudContext.aws,
    result.cloudContext.azure,
    result.cloudContext.gcp,
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {providers.map((p) => (
        <ProviderCard key={p.provider.id} data={p} prefix={result.prefixLength} />
      ))}
    </div>
  )
}

/** Content-only export for use in tabbed panels */
export function CloudContextContent() {
  return <CloudContextInner />
}

export function CloudContext() {
  const { result } = useCalculatorStore()
  if (!result) return null

  return (
    <CollapsibleSection title="Cloud Provider Context" defaultOpen={false} delay={0.35}>
      <CloudContextInner />
    </CollapsibleSection>
  )
}
