import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { ipv4ToString } from '@/lib/ipv4'

function SubnetMapInner() {
  const { result } = useCalculatorStore()

  if (!result) return null

  // Break the address space into logical blocks
  const prefix = result.prefixLength
  const subPrefix = Math.min(prefix + 4, 32)
  const blockCount = Math.pow(2, subPrefix - prefix)
  const blockSize = Math.pow(2, 32 - subPrefix)
  const prefixBlocks = Array.from({ length: Math.min(blockCount, 64) }, (_, i) => {
    const startAddr = (result.networkNum + i * blockSize) >>> 0
    return {
      index: i,
      startAddr: ipv4ToString(startAddr),
      size: blockSize,
      isFirst: i === 0,
      isLast: i === blockCount - 1,
    }
  })

  return (
    <div className="space-y-3">
      {/* Compact proportional bar showing the address range */}
      <div className="relative h-10 rounded-lg overflow-hidden border border-[#586e75]/20">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#268bd2] z-10" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 bg-gradient-to-r from-[#268bd2]/20 via-[#268bd2]/10 to-[#d33682]/20"
        />
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#d33682] z-10" />
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-[10px] font-mono text-[#268bd2] font-semibold">
            {result.networkAddress}
          </span>
          <span className="text-xs font-mono text-[#586e75] dark:text-[#93a1a1] font-bold">
            /{result.prefixLength}
          </span>
          <span className="text-[10px] font-mono text-[#d33682] font-semibold">
            {result.broadcastAddress}
          </span>
        </div>
      </div>

      {/* Sub-block grid (compact) with gradient */}
      <div className="flex gap-px rounded-lg overflow-hidden">
        {prefixBlocks.map((block, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.01, duration: 0.3 }}
            className="flex-1 h-6 group relative cursor-pointer"
            style={{
              backgroundColor: block.isFirst
                ? '#268bd2'
                : block.isLast
                ? '#d33682'
                : (() => {
                    const total = prefixBlocks.length - 1
                    const t = total > 0 ? i / total : 0
                    const r = Math.round(38 + (211 - 38) * t)
                    const g = Math.round(139 + (54 - 139) * t)
                    const b = Math.round(210 + (130 - 210) * t)
                    return `rgba(${r}, ${g}, ${b}, 0.15)`
                  })(),
            }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-[#002b36] text-[#93a1a1] text-[10px] font-mono rounded px-2 py-1 whitespace-nowrap shadow-lg">
                {block.startAddr}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats summary */}
      <div className="flex items-center justify-between text-[11px] text-[#586e75]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#268bd2]" />
            Network
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#268bd2]/20 border border-[#268bd2]/30" />
            {result.usableHosts.toLocaleString()} usable hosts
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#d33682]" />
            Broadcast
          </span>
        </div>
        <span className="font-mono text-[#93a1a1] dark:text-[#586e75]">
          {result.totalAddresses.toLocaleString()} total
        </span>
      </div>
    </div>
  )
}

/** Content-only export (no CollapsibleSection wrapper) for use in tabbed panels */
export function SubnetMapContent() {
  return <SubnetMapInner />
}

export function SubnetMap() {
  const { result } = useCalculatorStore()

  if (!result) return null

  return (
    <CollapsibleSection title="Address Space Visualization" defaultOpen={true} delay={0.4}>
      <SubnetMapInner />
    </CollapsibleSection>
  )
}
