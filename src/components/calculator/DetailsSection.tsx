import { useCalculatorStore } from '@/store/calculator-store'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { SubnetMapContent } from '@/components/visual-map/SubnetMap'
import { CloudContextContent } from '@/components/cloud/CloudContext'
import { BinaryBreakdownContent } from '@/components/calculator/BinaryBreakdown'
import { ExportMenuContent } from '@/components/export/ExportMenu'

export function DetailsSection() {
  const { result, splits } = useCalculatorStore()

  if (!result) return null

  const showingSplits = splits.length > 0

  return (
    <div>
      {!showingSplits && (
        <CollapsibleSection
          title="Address Space Visualization"
          defaultOpen={true}
          delay={0.2}
        >
          <SubnetMapContent />
        </CollapsibleSection>
      )}

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
