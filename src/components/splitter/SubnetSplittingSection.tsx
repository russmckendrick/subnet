import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { CopyButton } from '@/components/shared/CopyButton'

const QUICK_PREFIXES = [24, 25, 26, 27, 28]

export function SubnetSplittingSection() {
  const {
    result,
    splits,
    availablePrefixes,
    addSplit,
    removeSplit,
    updateSplitLabel,
    resetSplits,
    remainingSpace,
    rawInput,
  } = useCalculatorStore()

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
      {/* Inline summary bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#586e75] mb-4 font-mono">
        <span className="font-semibold text-[#586e75] dark:text-[#93a1a1]">{rawInput}</span>
        <span className="text-[#93a1a1] dark:text-[#586e75]">&middot;</span>
        <span>{totalSize.toLocaleString()} total</span>
        <span className="text-[#93a1a1] dark:text-[#586e75]">&middot;</span>
        <span>{usedSize.toLocaleString()} allocated ({allocatedPercent}%)</span>
        <span className="text-[#93a1a1] dark:text-[#586e75]">&middot;</span>
        <span>{remainingSpace.toLocaleString()} remaining</span>
      </div>

      {/* Visualization bar */}
      {splits.length > 0 && (
        <div className="mb-4">
          <div className="flex h-16 rounded-lg overflow-hidden border border-[#586e75]/20 bg-[#fdf6e3] dark:bg-[#002b36]/50">
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
                  <div
                    className="absolute inset-x-0 bottom-0 h-1.5"
                    style={{ backgroundColor: split.color }}
                  />
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
                      <span className="text-[9px] text-[#586e75] dark:text-[#586e75] truncate">
                        {split.size.toLocaleString()} addr
                      </span>
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-[#002b36] text-[#93a1a1] text-[10px] font-mono rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-[#586e75]/30">
                      <div className="font-semibold text-[11px] text-[#93a1a1]">{split.label}</div>
                      <div className="text-[#839496] mt-0.5">{split.cidr}</div>
                      <div className="text-[#586e75]">{split.firstHost} — {split.lastHost}</div>
                      <div className="text-[#586e75]">{split.usableHosts.toLocaleString()} usable hosts</div>
                      <div className="text-[#586e75]">{((split.size / totalSize) * 100).toFixed(1)}% of parent</div>
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
                className="flex items-center justify-center bg-[#eee8d5]/50 dark:bg-[#073642]/30"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(88,110,117,0.06) 4px, rgba(88,110,117,0.06) 8px)' }}
              >
                <span className="text-[10px] text-[#93a1a1] dark:text-[#586e75] font-mono">
                  {(remainingSpace / totalSize * 100).toFixed(0)}% free
                </span>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Controls header with add and reset */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-[#586e75] uppercase tracking-wider">
          Subnet Allocations
        </h3>
        <div className="flex items-center gap-2">
          {availablePrefixes.length > 0 && (
            <select
              className="bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 border border-[#586e75]/20
                rounded-lg px-2 py-1.5 text-sm font-mono text-[#586e75] dark:text-[#93a1a1] focus:outline-none"
              defaultValue=""
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                if (!isNaN(val)) {
                  addSplit(val)
                  e.target.value = ''
                }
              }}
            >
              <option value="" disabled>
                + Add subnet
              </option>
              {availablePrefixes.map((p) => (
                <option key={p} value={p}>
                  /{p} ({Math.pow(2, 32 - p).toLocaleString()} addresses)
                </option>
              ))}
            </select>
          )}
          {splits.length > 0 && (
            <a
              href={`/designer?from=${encodeURIComponent(rawInput)}&split=${splits.map((s) => `${s.prefixLength}~${encodeURIComponent(s.label)}`).join(',')}`}
              className="flex items-center gap-1 text-xs text-[#2aa198] hover:text-[#2aa198]/80 transition-colors px-2 py-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M12 8.25v7.5m3.75-3.75H8.25" />
              </svg>
              Designer
            </a>
          )}
          {splits.length > 0 && (
            <button
              onClick={resetSplits}
              className="text-xs text-[#dc322f] hover:text-[#dc322f]/80 transition-colors px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {splits.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[#93a1a1] dark:text-[#586e75] mb-4">
            Add subnets to start planning your network.
          </p>
          {/* Quick-add pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PREFIXES.filter(p => availablePrefixes.includes(p)).map((p) => (
              <button
                key={p}
                onClick={() => addSplit(p)}
                className="group relative text-xs font-mono px-3 py-1.5 rounded-lg border border-[#586e75]/20 bg-[#fdf6e3]/50 dark:bg-[#002b36]/30 text-[#586e75] dark:text-[#93a1a1] hover:border-[#2aa198]/30 hover:bg-[#2aa198]/5 transition-colors"
              >
                /{p}
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] whitespace-nowrap bg-[#002b36] text-[#93a1a1] rounded px-2 py-0.5">
                  {Math.pow(2, 32 - p).toLocaleString()} addr
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[#586e75] uppercase tracking-wider border-b border-[#586e75]/20">
                <th className="text-left py-2 pr-3 font-medium">Label</th>
                <th className="text-left py-2 pr-3 font-medium">CIDR</th>
                <th className="text-left py-2 pr-3 font-medium">Range</th>
                <th className="text-right py-2 pr-3 font-medium">Size</th>
                <th className="text-right py-2 pr-3 font-medium">Usable</th>
                <th className="text-right py-2 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody>
              {splits.map((split, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[#586e75]/10"
                >
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: split.color }} />
                      <input
                        type="text"
                        value={split.label}
                        onChange={(e) => updateSplitLabel(i, e.target.value)}
                        className="bg-transparent text-sm text-[#586e75] dark:text-[#93a1a1] focus:outline-none
                          border-b border-transparent focus:border-[#2aa198]/40 w-24"
                      />
                    </div>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-[#586e75] dark:text-[#839496]">
                    <div className="flex items-center gap-1">
                      {split.cidr}
                      <CopyButton text={split.cidr} copyKey={`split-${i}`} />
                    </div>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-[#93a1a1] dark:text-[#586e75]">
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
                      className="p-1 rounded hover:bg-[#dc322f]/10 text-[#93a1a1] hover:text-[#dc322f] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

          {/* Detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
            {splits.map((split, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-2.5 rounded-lg border border-[#586e75]/10 px-3 py-2 bg-[#fdf6e3]/50 dark:bg-[#002b36]/30"
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
          </div>
        </div>
      )}
    </CollapsibleSection>
  )
}
