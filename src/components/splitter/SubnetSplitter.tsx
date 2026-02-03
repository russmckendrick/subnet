import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { SubnetMap } from '@/components/visual-map/SubnetMap'
import { CopyButton } from '@/components/shared/CopyButton'
import { parseCidr } from '@/lib/cidr'

export function SubnetSplitter() {
  const {
    parentCidr,
    setParentCidr,
    splits,
    availablePrefixes,
    addSplit,
    removeSplit,
    updateSplitLabel,
    resetSplits,
    remainingSpace,
  } = useCalculatorStore()

  const parentResult = parseCidr(parentCidr)

  return (
    <div className="space-y-4">
      {/* Parent CIDR input */}
      <AnimatedCard className="p-5">
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Parent Network
        </h3>
        <input
          type="text"
          value={parentCidr}
          onChange={(e) => setParentCidr(e.target.value)}
          placeholder="e.g. 10.0.0.0/16"
          className="w-full bg-black/[0.03] dark:bg-white/[0.05] rounded-xl px-4 py-3 font-mono text-lg
            text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600
            border border-black/[0.04] dark:border-white/[0.06] focus:outline-none focus:border-cyan-500/40"
          spellCheck={false}
        />
        {parentResult && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {parentResult.totalAddresses.toLocaleString()} total addresses available
          </p>
        )}
      </AnimatedCard>

      {/* Visual map */}
      {parentResult && <SubnetMap />}

      {/* Controls */}
      {parentResult && (
        <AnimatedCard delay={0.1} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Subnet Allocations
            </h3>
            <div className="flex items-center gap-2">
              {availablePrefixes.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    id="add-prefix"
                    className="bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]
                      rounded-lg px-2 py-1.5 text-sm font-mono text-slate-700 dark:text-slate-200 focus:outline-none"
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
                      + Add /{'{prefix}'}
                    </option>
                    {availablePrefixes.map((p) => (
                      <option key={p} value={p}>
                        /{p} ({Math.pow(2, 32 - p).toLocaleString()} addresses)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {splits.length > 0 && (
                <button
                  onClick={resetSplits}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {splits.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
              Add subnets using the dropdown above to start planning your network.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-black/[0.04] dark:border-white/[0.06]">
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
                      className="border-b border-black/[0.02] dark:border-white/[0.03]"
                    >
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: split.color }} />
                          <input
                            type="text"
                            value={split.label}
                            onChange={(e) => updateSplitLabel(i, e.target.value)}
                            className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none
                              border-b border-transparent focus:border-cyan-500/40 w-24"
                          />
                        </div>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          {split.cidr}
                          <CopyButton text={split.cidr} copyKey={`split-${i}`} />
                        </div>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {split.firstHost} - {split.lastHost}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {split.size.toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {split.usableHosts.toLocaleString()}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => removeSplit(i)}
                          className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
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
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Remaining</span>
                  <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {remainingSpace.toLocaleString()} addresses
                  </span>
                </div>
              )}
            </div>
          )}
        </AnimatedCard>
      )}
    </div>
  )
}
