import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { ipv4ToString } from '@/lib/ipv4'
import { parseCidr } from '@/lib/cidr'

export function SubnetMap() {
  const { result, splits, remainingSpace, parentCidr, activeTab } = useCalculatorStore()

  const isSplitterMode = activeTab === 'splitter'
  const showingSplits = splits.length > 0

  // Use parentCidr when in splitter mode, otherwise use calculator result
  const parentResult = isSplitterMode ? parseCidr(parentCidr) : null
  const displayResult = isSplitterMode ? parentResult : result
  const totalSize = displayResult?.totalAddresses ?? 0

  if (!displayResult) return null

  // For the calculator view, break the address space into logical blocks
  const prefixBlocks = displayResult && !showingSplits ? (() => {
    const prefix = displayResult.prefixLength
    const subPrefix = Math.min(prefix + 4, 32)
    const blockCount = Math.pow(2, subPrefix - prefix)
    const blockSize = Math.pow(2, 32 - subPrefix)
    return Array.from({ length: Math.min(blockCount, 64) }, (_, i) => {
      const startAddr = (displayResult.networkNum + i * blockSize) >>> 0
      return {
        index: i,
        startAddr: ipv4ToString(startAddr),
        size: blockSize,
        isFirst: i === 0,
        isLast: i === blockCount - 1,
      }
    })
  })() : []

  // Calculate usage percentage for the splitter
  const usedSize = splits.reduce((sum, s) => sum + s.size, 0)
  const usagePercent = totalSize > 0 ? Math.round((usedSize / totalSize) * 100) : 0

  return (
    <CollapsibleSection title={showingSplits ? `Address Space Visualization — ${usagePercent}% allocated` : 'Address Space Visualization'} defaultOpen={true} delay={0.4}>

      {showingSplits ? (
        <div className="space-y-3">
          {/* Proportional bar for splits */}
          <div className="flex h-16 rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] bg-slate-50 dark:bg-slate-900/50">
            {splits.map((split, i) => {
              const widthPercent = (split.size / totalSize) * 100
              return (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative group cursor-pointer border-r border-white/20 dark:border-black/20 last:border-r-0 overflow-hidden"
                  style={{ backgroundColor: split.color + '30' }}
                >
                  {/* Colored bottom bar */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1.5"
                    style={{ backgroundColor: split.color }}
                  />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
                    <span className="text-[11px] font-semibold truncate max-w-full px-0.5"
                      style={{ color: split.color }}>
                      {widthPercent > 8 ? split.label : ''}
                    </span>
                    <span className="text-[11px] font-mono font-bold truncate"
                      style={{ color: split.color }}>
                      /{split.prefixLength}
                    </span>
                    {widthPercent > 12 && (
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                        {split.size.toLocaleString()} addr
                      </span>
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-slate-900 text-white text-[10px] font-mono rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-white/10">
                      <div className="font-semibold text-[11px]">{split.label}</div>
                      <div className="text-slate-300 mt-0.5">{split.cidr}</div>
                      <div className="text-slate-400">{split.firstHost} — {split.lastHost}</div>
                      <div className="text-slate-400">{split.usableHosts.toLocaleString()} usable hosts</div>
                      <div className="text-slate-400">{((split.size / totalSize) * 100).toFixed(1)}% of parent</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            {remainingSpace > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(remainingSpace / totalSize) * 100}%` }}
                transition={{ duration: 0.5, delay: splits.length * 0.1 }}
                className="flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(148,163,184,0.06) 4px, rgba(148,163,184,0.06) 8px)' }}
              >
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {(remainingSpace / totalSize * 100).toFixed(0)}% free
                </span>
              </motion.div>
            )}
          </div>

          {/* Individual subnet detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {splits.map((split, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.06] px-3 py-2 bg-black/[0.01] dark:bg-white/[0.02]"
              >
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: split.color }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {split.label}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {split.cidr} · {split.usableHosts.toLocaleString()} hosts
                  </div>
                </div>
                <div className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                  {((split.size / totalSize) * 100).toFixed(1)}%
                </div>
              </motion.div>
            ))}
            {remainingSpace > 0 && (
              <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-black/[0.06] dark:border-white/[0.06] px-3 py-2">
                <div className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Unallocated</div>
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {remainingSpace.toLocaleString()} addresses
                  </div>
                </div>
                <div className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                  {((remainingSpace / totalSize) * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      ) : displayResult ? (
        <div className="space-y-3">
          {/* Compact proportional bar showing the address range */}
          <div className="relative h-10 rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 z-10" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-amber-500/20"
            />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-500 z-10" />
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
                {displayResult.networkAddress}
              </span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-bold">
                /{displayResult.prefixLength}
              </span>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
                {displayResult.broadcastAddress}
              </span>
            </div>
          </div>

          {/* Sub-block grid (compact) */}
          <div className="flex gap-px rounded-lg overflow-hidden">
            {prefixBlocks.map((block, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.01, duration: 0.3 }}
                className="flex-1 h-6 group relative cursor-pointer"
                style={{
                  backgroundColor: block.isFirst
                    ? 'rgb(6, 182, 212)'
                    : block.isLast
                    ? 'rgb(245, 158, 11)'
                    : `rgba(6, 182, 212, ${0.08 + (i % 2) * 0.06})`,
                }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900 text-white text-[10px] font-mono rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    {block.startAddr}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats summary */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Network
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500/20 border border-cyan-500/30" />
                {displayResult.usableHosts.toLocaleString()} usable hosts
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Broadcast
              </span>
            </div>
            <span className="font-mono text-slate-400 dark:text-slate-500">
              {displayResult.totalAddresses.toLocaleString()} total
            </span>
          </div>
        </div>
      ) : null}
    </CollapsibleSection>
  )
}
