import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { SubnetMapContent } from '@/components/visual-map/SubnetMap'
import { CloudContextContent } from '@/components/cloud/CloudContext'
import { BinaryBreakdownContent } from '@/components/calculator/BinaryBreakdown'
import { ExportMenuContent } from '@/components/export/ExportMenu'

type DetailTab = 'visualization' | 'cloud' | 'binary' | 'export'

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'visualization', label: 'Visualization' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'binary', label: 'Binary' },
  { id: 'export', label: 'Export' },
]

export function CalculatorDetails() {
  const { result } = useCalculatorStore()
  const [activeDetail, setActiveDetail] = useState<DetailTab>('visualization')

  if (!result) return null

  return (
    <AnimatedCard delay={0.2} className="p-3 sm:p-4 mt-2">
      {/* Mini tab bar */}
      <div className="flex gap-1 p-0.5 rounded-md bg-[#fdf6e3] dark:bg-[#002b36] mb-4 w-fit">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveDetail(tab.id)}
            className={`relative text-xs py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeDetail === tab.id
                ? 'text-[#586e75] dark:text-[#93a1a1]'
                : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1]'
            }`}
          >
            {activeDetail === tab.id && (
              <motion.div
                layoutId="activeDetailTab"
                className="absolute inset-0 bg-[#eee8d5] dark:bg-[#073642] rounded-md shadow-sm"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDetail}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {activeDetail === 'visualization' && <SubnetMapContent />}
          {activeDetail === 'cloud' && <CloudContextContent />}
          {activeDetail === 'binary' && <BinaryBreakdownContent />}
          {activeDetail === 'export' && <ExportMenuContent />}
        </motion.div>
      </AnimatePresence>
    </AnimatedCard>
  )
}
