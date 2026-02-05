import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { SubnetInfoCard } from './SubnetInfoCard'
import { Badge } from '@/components/shared/Badge'

function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function ResultsPanel() {
  const { result } = useCalculatorStore()
  if (!result) return null

  const rfcColor = result.isPrivate ? 'emerald' : result.rfcType?.includes('CGNAT') ? 'violet' : result.rfcType?.includes('Multicast') ? 'red' : result.rfcType?.includes('Loopback') ? 'amber' : 'cyan'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Address Range */}
        <SubnetInfoCard
          delay={0.05}
          rows={[
            {
              label: 'Network Address',
              value: result.networkAddress,
              copyKey: 'network',
              badge: (
                <Badge color={rfcColor as 'emerald'}>
                  {result.rfcType ?? 'Public'}
                </Badge>
              ),
            },
            {
              label: 'Broadcast Address',
              value: result.broadcastAddress,
              copyKey: 'broadcast',
            },
          ]}
        />

        {/* Masks */}
        <SubnetInfoCard
          delay={0.1}
          rows={[
            {
              label: 'Netmask',
              value: result.netmask,
              copyKey: 'netmask',
            },
            {
              label: 'Wildcard Mask',
              value: result.wildcardMask,
              copyKey: 'wildcard',
            },
          ]}
        />

        {/* Host Range */}
        <SubnetInfoCard
          delay={0.15}
          rows={[
            {
              label: 'First Usable Host',
              value: result.firstHost,
              copyKey: 'firstHost',
            },
            {
              label: 'Last Usable Host',
              value: result.lastHost,
              copyKey: 'lastHost',
            },
          ]}
        />

        {/* Counts */}
        <SubnetInfoCard
          delay={0.2}
          rows={[
            {
              label: 'Total Addresses',
              value: formatNumber(result.totalAddresses),
              copyKey: 'total',
              mono: false,
            },
            {
              label: 'Usable Hosts',
              value: formatNumber(result.usableHosts),
              copyKey: 'usable',
              mono: false,
              badge: (
                <Badge color="slate">
                  /{result.prefixLength} &middot; Class {result.ipClass}
                </Badge>
              ),
            },
          ]}
        />
      </div>
    </motion.div>
  )
}
