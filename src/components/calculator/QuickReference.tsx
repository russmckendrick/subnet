import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SUBNET_REFERENCE_TABLE } from '@/lib/constants'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { useCalculatorStore, type AppTab } from '@/store/calculator-store'

export function QuickReference() {
  const [isOpen, setIsOpen] = useState(true)
  const [filter, setFilter] = useState('')
  const { result, setRawInput, setActiveTab } = useCalculatorStore()

  const currentPrefix = result?.prefixLength ?? null

  const filteredRows = SUBNET_REFERENCE_TABLE.filter((r) => {
    if (r.prefix < 8) return false
    if (!filter.trim()) return true
    const q = filter.trim().toLowerCase()
    // Match prefix number, address count, or netmask
    return (
      `/${r.prefix}`.includes(q) ||
      r.prefix.toString().includes(q) ||
      r.totalAddresses.toLocaleString().includes(q) ||
      r.netmask.includes(q)
    )
  })

  const handleRowClick = (prefix: number) => {
    setRawInput(`10.0.0.0/${prefix}`)
    setActiveTab('calculator' as AppTab)
  }

  return (
    <AnimatedCard delay={0.5} className="mt-3 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          CIDR Quick Reference
        </h3>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Filter input */}
              <div className="mb-3">
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter by prefix, addresses, or netmask..."
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] rounded-lg px-3 py-2 text-sm font-mono
                    text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600
                    border border-black/[0.04] dark:border-white/[0.06] focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-black/[0.04] dark:border-white/[0.06]">
                      <th className="text-left py-2 pr-4 font-medium">Prefix</th>
                      <th className="text-left py-2 pr-4 font-medium">Netmask</th>
                      <th className="text-right py-2 pr-4 font-medium">Addresses</th>
                      <th className="text-right py-2 pr-2 font-medium">Usable</th>
                      <th className="w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {filteredRows.map((row) => {
                      const isActive = currentPrefix === row.prefix
                      return (
                        <tr
                          key={row.prefix}
                          onClick={() => handleRowClick(row.prefix)}
                          className={`border-b border-black/[0.02] dark:border-white/[0.03] cursor-pointer transition-colors hover:bg-cyan-500/5 ${
                            isActive ? 'bg-cyan-500/5' : ''
                          }`}
                        >
                          <td className={`py-1.5 pr-4 font-semibold ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                            <div className="flex items-center gap-1.5">
                              {isActive && (
                                <div className="w-0.5 h-4 bg-cyan-500 rounded-full" />
                              )}
                              /{row.prefix}
                            </div>
                          </td>
                          <td className="py-1.5 pr-4 text-slate-700 dark:text-slate-300">{row.netmask}</td>
                          <td className="py-1.5 pr-4 text-right text-slate-600 dark:text-slate-400">{row.totalAddresses.toLocaleString()}</td>
                          <td className="py-1.5 pr-2 text-right text-slate-600 dark:text-slate-400">{row.usableHosts.toLocaleString()}</td>
                          <td className="py-1.5 text-right">
                            <svg className="w-3 h-3 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  )
}
