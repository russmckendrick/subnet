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
      <div className="flex gap-1 p-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] mb-4 w-fit">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveDetail(tab.id)}
            className={`relative text-xs py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeDetail === tab.id
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {activeDetail === tab.id && (
              <motion.div
                layoutId="activeDetailTab"
                className="absolute inset-0 bg-white dark:bg-white/[0.12] rounded-md shadow-sm"
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
