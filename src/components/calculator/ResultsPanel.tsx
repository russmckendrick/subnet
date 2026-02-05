import { motion } from 'motion/react'
import { useCalculatorStore, type AppTab } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { Badge } from '@/components/shared/Badge'
import { CopyButton } from '@/components/shared/CopyButton'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function ResultsPanel() {
  const { result, setParentCidr, setActiveTab, rawInput } = useCalculatorStore()
  if (!result) return null

  const rfcColor = result.isPrivate ? 'emerald' : result.rfcType?.includes('CGNAT') ? 'violet' : result.rfcType?.includes('Multicast') ? 'red' : result.rfcType?.includes('Loopback') ? 'amber' : 'cyan'

  const copyAllText = [
    `Network: ${result.networkAddress}/${result.prefixLength}`,
    `Network Address: ${result.networkAddress}`,
    `Broadcast: ${result.broadcastAddress}`,
    `Netmask: ${result.netmask}`,
    `Wildcard: ${result.wildcardMask}`,
    `First Host: ${result.firstHost}`,
    `Last Host: ${result.lastHost}`,
    `Total Addresses: ${formatNumber(result.totalAddresses)}`,
    `Usable Hosts: ${formatNumber(result.usableHosts)}`,
    `Class: ${result.ipClass}`,
    `Type: ${result.rfcType ?? 'Public'}`,
  ].join('\n')

  const secondaryFields = [
    { label: 'Broadcast', value: result.broadcastAddress, copyKey: 'broadcast' },
    { label: 'Netmask', value: result.netmask, copyKey: 'netmask' },
    { label: 'Wildcard', value: result.wildcardMask, copyKey: 'wildcard' },
    { label: 'First Host', value: result.firstHost, copyKey: 'firstHost' },
    { label: 'Last Host', value: result.lastHost, copyKey: 'lastHost' },
    { label: 'Total Addresses', value: formatNumber(result.totalAddresses), copyKey: 'total', mono: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard delay={0.05} className="p-4 sm:p-5">
        {/* Primary tier */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                {result.networkAddress}/{result.prefixLength}
              </span>
              <Badge color={rfcColor as 'emerald'}>
                {result.rfcType ?? 'Public'}
              </Badge>
              <Badge color="slate">
                Class {result.ipClass}
              </Badge>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 mt-2">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                  Network Address
                </span>
                <div className="text-lg font-mono font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  {result.networkAddress}
                  <CopyButton text={result.networkAddress} copyKey="network" />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                  Usable Hosts
                </span>
                <div className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  {formatNumber(result.usableHosts)}
                  <CopyButton text={String(result.usableHosts)} copyKey="usable" />
                </div>
              </div>
            </div>
          </div>
          <CopyButton text={copyAllText} copyKey="copy-all" label="Copy All" />
        </div>

        {/* Secondary tier */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 sm:gap-y-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
          {secondaryFields.map((field) => (
            <div key={field.copyKey}>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                {field.label}
              </span>
              <div className={`text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 ${field.mono === false ? '' : 'font-mono'}`}>
                {field.value}
                <CopyButton text={field.value} copyKey={field.copyKey} />
              </div>
            </div>
          ))}
        </div>

        {/* Split action button */}
        <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex justify-end">
          <button
            onClick={() => {
              setParentCidr(rawInput)
              setActiveTab('splitter' as AppTab)
            }}
            className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-cyan-500/5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
            Split this network
          </button>
        </div>
      </AnimatedCard>
    </motion.div>
  )
}
