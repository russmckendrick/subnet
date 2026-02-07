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
  const usedSize = splits.reduce((sum, s) => sum + s.size, 0)
  const totalSize = result.totalAddresses
  const usagePercent = totalSize > 0 ? Math.round((usedSize / totalSize) * 100) : 0

  return (
    <div>
      <CollapsibleSection
        title={showingSplits ? `Address Space Visualization — ${usagePercent}% allocated` : 'Address Space Visualization'}
        defaultOpen={true}
        delay={0.2}
      >
        <SubnetMapContent />
      </CollapsibleSection>

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
