import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SUBNET_REFERENCE_TABLE } from '@/lib/constants'
import { AnimatedCard } from '@/components/shared/AnimatedCard'

export function QuickReference() {
  const [isOpen, setIsOpen] = useState(true)

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
            <div className="px-4 pb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-black/[0.04] dark:border-white/[0.06]">
                    <th className="text-left py-2 pr-4 font-medium">Prefix</th>
                    <th className="text-left py-2 pr-4 font-medium">Netmask</th>
                    <th className="text-right py-2 pr-4 font-medium">Addresses</th>
                    <th className="text-right py-2 font-medium">Usable</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {SUBNET_REFERENCE_TABLE.filter((r) => r.prefix >= 8).map((row) => (
                    <tr
                      key={row.prefix}
                      className="border-b border-black/[0.02] dark:border-white/[0.03] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-1.5 pr-4 text-cyan-600 dark:text-cyan-400 font-semibold">/{row.prefix}</td>
                      <td className="py-1.5 pr-4 text-slate-700 dark:text-slate-300">{row.netmask}</td>
                      <td className="py-1.5 pr-4 text-right text-slate-600 dark:text-slate-400">{row.totalAddresses.toLocaleString()}</td>
                      <td className="py-1.5 text-right text-slate-600 dark:text-slate-400">{row.usableHosts.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  )
}
