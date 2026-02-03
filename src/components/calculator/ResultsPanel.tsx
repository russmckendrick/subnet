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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <SubnetInfoCard
          label="Network Address"
          value={result.networkAddress}
          copyKey="network"
          delay={0.05}
          badge={
            <Badge color={rfcColor as 'emerald'}>
              {result.rfcType ?? 'Public'}
            </Badge>
          }
        />
        <SubnetInfoCard
          label="Broadcast Address"
          value={result.broadcastAddress}
          copyKey="broadcast"
          delay={0.1}
        />
        <SubnetInfoCard
          label="Netmask"
          value={result.netmask}
          copyKey="netmask"
          delay={0.15}
        />
        <SubnetInfoCard
          label="Wildcard Mask"
          value={result.wildcardMask}
          copyKey="wildcard"
          delay={0.2}
        />
        <SubnetInfoCard
          label="First Usable Host"
          value={result.firstHost}
          copyKey="firstHost"
          delay={0.25}
        />
        <SubnetInfoCard
          label="Last Usable Host"
          value={result.lastHost}
          copyKey="lastHost"
          delay={0.3}
        />
        <SubnetInfoCard
          label="Total Addresses"
          value={formatNumber(result.totalAddresses)}
          copyKey="total"
          delay={0.35}
          mono={false}
        />
        <SubnetInfoCard
          label="Usable Hosts"
          value={formatNumber(result.usableHosts)}
          copyKey="usable"
          delay={0.4}
          mono={false}
          badge={
            <Badge color="slate">
              /{result.prefixLength} &middot; Class {result.ipClass}
            </Badge>
          }
        />
      </div>
    </motion.div>
  )
}
