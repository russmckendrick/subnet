import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { Badge } from '@/components/shared/Badge'
import { CopyButton } from '@/components/shared/CopyButton'
import { RdapSectionContent } from '@/components/whois/RdapSection'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function ResultsPanel() {
  const { result } = useCalculatorStore()
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
              <span className="text-2xl font-mono font-bold text-[#586e75] dark:text-[#93a1a1]">
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
                <span className="text-[10px] text-[#586e75] dark:text-[#586e75] uppercase tracking-wider font-medium">
                  Network Address
                </span>
                <div className="text-lg font-mono font-semibold text-[#586e75] dark:text-[#93a1a1] flex items-center gap-1.5">
                  {result.networkAddress}
                  <CopyButton text={result.networkAddress} copyKey="network" />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#586e75] dark:text-[#586e75] uppercase tracking-wider font-medium">
                  Usable Hosts
                </span>
                <div className="text-lg font-semibold text-[#2aa198] flex items-center gap-1.5">
                  {formatNumber(result.usableHosts)}
                  <CopyButton text={String(result.usableHosts)} copyKey="usable" />
                </div>
              </div>
            </div>
          </div>
          <CopyButton text={copyAllText} copyKey="copy-all" label="Copy All" />
        </div>

        {/* Secondary tier */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 sm:gap-y-3 pt-3 border-t border-[#586e75]/20">
          {secondaryFields.map((field) => (
            <div key={field.copyKey}>
              <span className="text-[10px] text-[#586e75] dark:text-[#586e75] uppercase tracking-wider font-medium">
                {field.label}
              </span>
              <div className={`text-sm font-semibold text-[#657b83] dark:text-[#839496] flex items-center gap-1 ${field.mono === false ? '' : 'font-mono'}`}>
                {field.value}
                <CopyButton text={field.value} copyKey={field.copyKey} />
              </div>
            </div>
          ))}
        </div>

        {/* RDAP / WHOIS */}
        <div className="pt-3 mt-3 border-t border-[#586e75]/20">
          <h4 className="text-[10px] text-[#586e75] dark:text-[#586e75] uppercase tracking-wider font-medium mb-3">
            RDAP / WHOIS Lookup
          </h4>
          <RdapSectionContent />
        </div>
      </AnimatedCard>
    </motion.div>
  )
}
