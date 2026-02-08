import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { CopyButton } from '@/components/shared/CopyButton'
import { AllocationBar } from '@/components/splitter/AllocationBar'
import { SplitterToolbar } from '@/components/splitter/SplitterToolbar'

const QUICK_PREFIXES = [24, 25, 26, 27, 28]

type ViewMode = 'table' | 'cards'

export function SubnetSplittingSection() {
  const {
    result,
    splits,
    availablePrefixes,
    addSplit,
    removeSplit,
    updateSplitLabel,
    updateSplitColor,
    remainingSpace,
    rawInput,
  } = useCalculatorStore()

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  if (!result) return null

  const usedSize = splits.reduce((sum, s) => sum + s.size, 0)
  const totalSize = result.totalAddresses
  const allocatedPercent = totalSize > 0 ? ((usedSize / totalSize) * 100).toFixed(1) : '0'
  const isReserved = result.rfcType !== null

  return (
    <CollapsibleSection
      key={`splitter-${isReserved}`}
      title="Subnet Splitting"
      defaultOpen={isReserved}
      delay={0.1}
    >
      {/* Summary text */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#586e75] mb-4 font-mono">
        <span className="font-semibold text-[#586e75] dark:text-[#93a1a1]">{rawInput}</span>
        <span className="text-[#93a1a1] dark:text-[#586e75]">&middot;</span>
        <span>{totalSize.toLocaleString()} total</span>
        <span className="text-[#93a1a1] dark:text-[#586e75]">&middot;</span>
        <span>{usedSize.toLocaleString()} allocated ({allocatedPercent}%)</span>
        <span className="text-[#93a1a1] dark:text-[#586e75]">&middot;</span>
        <span>{remainingSpace.toLocaleString()} remaining</span>
      </div>

      {/* Allocation bar */}
      {splits.length > 0 && (
        <div className="mb-4">
          <AllocationBar
            splits={splits}
            totalSize={totalSize}
            remainingSpace={remainingSpace}
            hoveredIndex={hoveredIndex}
            onHoverIndex={setHoveredIndex}
          />
        </div>
      )}

      {/* Toolbar: actions left, view toggle right */}
      <SplitterToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      {splits.length === 0 ? (
        <div className="text-center py-8">
          {/* Network icon */}
          <svg className="w-10 h-10 mx-auto mb-3 text-[#93a1a1]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <p className="text-sm font-medium text-[#586e75] dark:text-[#93a1a1] mb-1">
            Split this network into subnets
          </p>
          <p className="text-xs text-[#93a1a1] dark:text-[#586e75] mb-5">
            Choose a prefix size to allocate your first subnet
          </p>
          {/* Quick-add pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PREFIXES.filter(p => availablePrefixes.includes(p)).map((p, i) => (
              <motion.button
                key={p}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => addSplit(p)}
                className="group text-xs font-mono px-4 py-2.5 rounded-lg border border-[#586e75]/20 bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 text-[#586e75] dark:text-[#93a1a1] hover:border-[#2aa198]/30 hover:bg-[#2aa198]/5 transition-colors"
              >
                <div className="font-semibold">/{p}</div>
                <div className="text-[10px] text-[#93a1a1] dark:text-[#586e75] mt-0.5">
                  {Math.pow(2, 32 - p).toLocaleString()} addr
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[#586e75] uppercase tracking-wider border-b-2 border-[#586e75]/20">
                    <th className="text-left py-2 pr-3 font-medium">Label</th>
                    <th className="text-left py-2 pr-3 font-medium">CIDR</th>
                    <th className="text-left py-2 pr-3 font-medium hidden sm:table-cell">Range</th>
                    <th className="text-right py-2 pr-3 font-medium">Size</th>
                    <th className="text-right py-2 pr-3 font-medium">Usable</th>
                    <th className="text-right py-2 font-medium w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {splits.map((split, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`border-b border-[#586e75]/10 transition-colors group ${
                        hoveredIndex === i
                          ? 'bg-[#fdf6e3]/50 dark:bg-[#002b36]/30'
                          : 'hover:bg-[#fdf6e3]/30 dark:hover:bg-[#002b36]/20'
                      }`}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2.5">
                          {/* Color swatch — clickable to open native color picker */}
                          <label className="relative shrink-0 cursor-pointer">
                            <div
                              className="w-4 h-4 rounded-md ring-1 ring-black/10 transition-transform hover:scale-110"
                              style={{ backgroundColor: split.color }}
                            />
                            <input
                              type="color"
                              value={split.color}
                              onChange={(e) => updateSplitColor(i, e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={split.label}
                              onChange={(e) => updateSplitLabel(i, e.target.value)}
                              className="bg-transparent text-sm text-[#586e75] dark:text-[#93a1a1] focus:outline-none
                                border-b border-transparent hover:border-[#586e75]/20 focus:border-[#2aa198]/40 w-28 sm:w-36 transition-colors"
                            />
                            {/* Pencil icon on hover */}
                            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-[#93a1a1]/0 group-hover:text-[#93a1a1]/40 transition-colors pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-[#586e75] dark:text-[#839496]">
                        <div className="flex items-center gap-1">
                          {split.cidr}
                          <CopyButton text={split.cidr} copyKey={`split-${i}`} />
                        </div>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-[#93a1a1] dark:text-[#586e75] hidden sm:table-cell">
                        {split.firstHost} - {split.lastHost}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-[#657b83] dark:text-[#839496]">
                        {split.size.toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-[#657b83] dark:text-[#839496]">
                        {split.usableHosts.toLocaleString()}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => removeSplit(i)}
                          className="p-1.5 rounded-lg hover:bg-[#dc322f]/10 text-[#93a1a1] hover:text-[#dc322f] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {remainingSpace > 0 && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#586e75]/20">
                  <span className="text-xs text-[#586e75]">Remaining</span>
                  <span className="text-xs font-mono font-semibold text-[#586e75] dark:text-[#93a1a1]">
                    {remainingSpace.toLocaleString()} addresses
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
            >
              {splits.map((split, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 transition-colors cursor-default ${
                    hoveredIndex === i
                      ? 'border-[#586e75]/30'
                      : 'border-[#586e75]/10 hover:border-[#586e75]/20'
                  }`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: split.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-[#586e75] dark:text-[#93a1a1] truncate">
                      {split.label}
                    </div>
                    <div className="text-[10px] font-mono text-[#93a1a1] dark:text-[#586e75]">
                      {split.cidr} · {split.usableHosts.toLocaleString()} hosts
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-[#93a1a1] dark:text-[#586e75] shrink-0">
                    {((split.size / totalSize) * 100).toFixed(1)}%
                  </div>
                </motion.div>
              ))}
              {remainingSpace > 0 && (
                <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-[#586e75]/20 px-3 py-2">
                  <div className="w-3 h-3 rounded-sm bg-[#93a1a1] dark:bg-[#586e75] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-[#93a1a1] dark:text-[#586e75]">Unallocated</div>
                    <div className="text-[10px] font-mono text-[#93a1a1] dark:text-[#586e75]">
                      {remainingSpace.toLocaleString()} addresses
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-[#93a1a1] dark:text-[#586e75] shrink-0">
                    {((remainingSpace / totalSize) * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </CollapsibleSection>
  )
}
