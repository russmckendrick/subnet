import { useCalculatorStore } from '@/store/calculator-store'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { SubnetMapContent } from '@/components/visual-map/SubnetMap'
import { CloudContextContent } from '@/components/cloud/CloudContext'
import { BinaryBreakdownContent } from '@/components/calculator/BinaryBreakdown'
import { ExportMenuContent } from '@/components/export/ExportMenu'

export function AddressSpaceSection() {
  const { result, splits } = useCalculatorStore()

  if (!result) return null

  const showingSplits = splits.length > 0
  const isReserved = result.rfcType !== null

  if (showingSplits) return null

  return (
    <CollapsibleSection
      key={`viz-${isReserved}`}
      title="Address Space Visualization"
      defaultOpen={isReserved}
      delay={0.2}
    >
      <SubnetMapContent />
    </CollapsibleSection>
  )
}

export function DetailsSection() {
  const { result } = useCalculatorStore()

  if (!result) return null

  return (
    <div>
      <CollapsibleSection title="Cloud Provider Context" defaultOpen={false} delay={0.25}>
        <CloudContextContent />
      </CollapsibleSection>

      <CollapsibleSection title="Binary Breakdown" defaultOpen={false} delay={0.3}>
        <BinaryBreakdownContent />
      </CollapsibleSection>

      <CollapsibleSection title="Export" defaultOpen={false} delay={0.35}>
        <ExportMenuContent />
      </CollapsibleSection>
    </div>
  )
}
