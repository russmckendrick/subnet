import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SUBNET_REFERENCE_TABLE } from '@/lib/constants'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { Input } from '@/components/shared/Input'
import { EASE } from '@/components/shared/motion'
import { useCalculatorStore } from '@/store/calculator-store'

export function QuickReference() {
  const [isOpen, setIsOpen] = useState(true)
  const [filter, setFilter] = useState('')
  const { result, setRawInput, setActiveDrawer } = useCalculatorStore()

  const currentPrefix = result?.prefixLength ?? null
  // Anchor the reference to the network being viewed, not a fixed example
  const baseIp = result?.networkAddress ?? '10.0.0.0'

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
    setRawInput(`${baseIp}/${prefix}`)
    setActiveDrawer('none')
  }

  return (
    <AnimatedCard delay={0.5} className="mt-3 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-well/50 transition-colors"
      >
        <div>
          <h3 className="text-xs font-medium text-sol-base01 uppercase tracking-wider">
            CIDR Quick Reference
          </h3>
          <p className="text-[10px] text-ink-muted mt-0.5">
            Based on <span className="font-mono text-sol-cyan">{baseIp}</span> — click a row to load it
          </p>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-ink-muted"
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
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Filter input */}
              <div className="mb-3">
                <Input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter by prefix, addresses, or netmask…"
                  mono
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-sol-base01 uppercase tracking-wider border-b border-line/20">
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
                          className={`border-b border-line/10 cursor-pointer transition-colors hover:bg-sol-cyan/5 ${
                            isActive ? 'bg-sol-cyan/5' : ''
                          }`}
                        >
                          <td className="py-1.5 pr-4 font-semibold text-sol-cyan">
                            <div className="flex items-center gap-1.5">
                              {isActive && (
                                <div className="w-0.5 h-4 bg-sol-cyan rounded-full" />
                              )}
                              /{row.prefix}
                            </div>
                          </td>
                          <td className="py-1.5 pr-4 text-ink-body">{row.netmask}</td>
                          <td className="py-1.5 pr-4 text-right text-ink-body">{row.totalAddresses.toLocaleString()}</td>
                          <td className="py-1.5 pr-2 text-right text-ink-body">{row.usableHosts.toLocaleString()}</td>
                          <td className="py-1.5 text-right">
                            <svg className="w-3 h-3 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
