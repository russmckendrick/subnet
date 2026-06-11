import { useCalculatorStore } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { Button } from '@/components/shared/Button'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { SubnetMapContent } from '@/components/visual-map/SubnetMap'
import { CloudContextContent } from '@/components/cloud/CloudContext'
import { BinaryBreakdownContent } from '@/components/calculator/BinaryBreakdown'

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
  const { result, setExportModalOpen } = useCalculatorStore()

  if (!result) return null

  return (
    <div>
      <CollapsibleSection title="Cloud Provider Context" defaultOpen={false} delay={0.25}>
        <CloudContextContent />
      </CollapsibleSection>

      <CollapsibleSection title="Binary Breakdown" defaultOpen={false} delay={0.3}>
        <BinaryBreakdownContent />
      </CollapsibleSection>

      <AnimatedCard delay={0.35} className="p-3 sm:p-4 mt-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-medium text-sol-base01 uppercase tracking-wider">
              Export & Share
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              JSON, CSV, Terraform, CLI commands, and share links
            </p>
          </div>
          <Button onClick={() => setExportModalOpen(true)} aria-label="Open export dialog">
            Open
            <kbd className="hidden sm:inline font-mono text-[10px] bg-well px-1.5 py-0.5 rounded border border-line/20 ml-1">
              ⌘E
            </kbd>
          </Button>
        </div>
      </AnimatedCard>
    </div>
  )
}
