import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { getBinaryBits, formatBinaryWithDots } from '@/lib/binary'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'

function BinaryBreakdownInner() {
  const { result } = useCalculatorStore()
  if (!result) return null

  const bits = getBinaryBits(result.networkNum, result.prefixLength)
  const octets = formatBinaryWithDots(bits)

  const maskBits = getBinaryBits(result.netmaskNum, result.prefixLength)
  const maskOctets = formatBinaryWithDots(maskBits)

  return (
    <div className="space-y-3">
      {/* Network address binary */}
      <div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
          Network Address
        </span>
        <div className="flex items-center gap-1.5 mt-1 font-mono text-sm sm:text-base">
          {octets.map((octet, oi) => (
            <div key={oi} className="flex items-center">
              {oi > 0 && <span className="text-slate-300 dark:text-slate-600 mx-1">.</span>}
              <div className="flex">
                {octet.map((bit, bi) => (
                  <motion.span
                    key={bi}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + (oi * 8 + bi) * 0.015 }}
                    className={`w-[0.65rem] text-center font-semibold ${
                      bit.type === 'network'
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {bit.value}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Netmask binary */}
      <div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
          Netmask
        </span>
        <div className="flex items-center gap-1.5 mt-1 font-mono text-sm sm:text-base">
          {maskOctets.map((octet, oi) => (
            <div key={oi} className="flex items-center">
              {oi > 0 && <span className="text-slate-300 dark:text-slate-600 mx-1">.</span>}
              <div className="flex">
                {octet.map((bit, bi) => (
                  <span
                    key={bi}
                    className={`w-[0.65rem] text-center font-semibold ${
                      bit.type === 'network'
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {bit.value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-cyan-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Network ({result.prefixLength} bits)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Host ({32 - result.prefixLength} bits)
          </span>
        </div>
      </div>
    </div>
  )
}

/** Content-only export for use in tabbed panels */
export function BinaryBreakdownContent() {
  return <BinaryBreakdownInner />
}

export function BinaryBreakdown() {
  const { result } = useCalculatorStore()
  if (!result) return null

  return (
    <CollapsibleSection title="Binary Breakdown" defaultOpen={false} delay={0.3}>
      <BinaryBreakdownInner />
    </CollapsibleSection>
  )
}
