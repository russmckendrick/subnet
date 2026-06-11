import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { Badge } from '@/components/shared/Badge'
import { CopyButton } from '@/components/shared/CopyButton'
import { SectionLabel, LabelValue } from '@/components/shared/LabelValue'
import { RdapSectionContent } from '@/components/whois/RdapSection'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function ResultsPanel() {
  const { result } = useCalculatorStore()
  if (!result) return null

  const rfcColor = result.isPrivate ? 'green' : result.rfcType?.includes('CGNAT') ? 'violet' : result.rfcType?.includes('Multicast') ? 'red' : result.rfcType?.includes('Loopback') ? 'yellow' : 'cyan'

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
              <span className="text-2xl font-mono font-bold text-ink">
                {result.networkAddress}/{result.prefixLength}
              </span>
              <Badge color={rfcColor as 'green'}>
                {result.rfcType ?? 'Public'}
              </Badge>
              <Badge color="neutral">
                Class {result.ipClass}
              </Badge>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 mt-2">
              <div>
                <SectionLabel>Network Address</SectionLabel>
                <div className="text-lg font-mono font-semibold text-ink flex items-center gap-1.5">
                  {result.networkAddress}
                  <CopyButton text={result.networkAddress} copyKey="network" />
                </div>
              </div>
              <div>
                <SectionLabel>Usable Hosts</SectionLabel>
                <div className="text-lg font-semibold text-sol-cyan flex items-center gap-1.5">
                  {formatNumber(result.usableHosts)}
                  <CopyButton text={String(result.usableHosts)} copyKey="usable" />
                </div>
              </div>
            </div>
          </div>
          <CopyButton text={copyAllText} copyKey="copy-all" label="Copy All" />
        </div>

        {/* Secondary tier */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 sm:gap-y-3 pt-3 border-t border-line/20">
          {secondaryFields.map((field) => (
            <LabelValue
              key={field.copyKey}
              label={field.label}
              copyText={field.value}
              copyKey={field.copyKey}
              mono={field.mono !== false}
            >
              {field.value}
            </LabelValue>
          ))}
        </div>

        {/* RDAP / WHOIS */}
        <div className="pt-3 mt-3 border-t border-line/20">
          <div className="mb-3">
            <SectionLabel>Registration (WHOIS / RDAP)</SectionLabel>
            <p className="text-[10px] text-ink-muted mt-0.5">
              Who this range is registered to — fetched from the regional internet registry for public IPs
            </p>
          </div>
          <RdapSectionContent />
        </div>
      </AnimatedCard>
    </motion.div>
  )
}
