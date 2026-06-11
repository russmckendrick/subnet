import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { config } from '@/lib/config'
import { DUR } from '@/components/shared/motion'

const EXAMPLES = ['192.168.1.0/24', '10.0.0.0/16', '172.16.0.0/12']

/**
 * First-visit discovery strip under the CIDR input: example networks,
 * tool shortcuts, and the command-palette hint. Hidden once the user
 * navigates away from the default CIDR.
 */
export function ExampleChips() {
  const { rawInput, setRawInput, setActiveDrawer, setCommandPaletteOpen, splits } = useCalculatorStore()

  // Only show on the untouched default view
  if (rawInput !== config.defaultCidr || splits.length > 0) return null

  const chipClass =
    'text-xs font-mono px-2.5 py-1 rounded-lg border border-line/20 bg-surface text-ink-body hover:border-sol-cyan/40 hover:text-sol-cyan transition-colors cursor-pointer'
  const actionClass =
    'text-xs px-2.5 py-1 rounded-lg text-sol-cyan hover:bg-sol-cyan/10 transition-colors cursor-pointer'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DUR.slow, delay: 0.15 }}
      className="flex flex-wrap items-center gap-2 -mt-1 mb-4 px-1"
    >
      <span className="text-xs text-ink-muted">Try:</span>
      {EXAMPLES.map((cidr) => (
        <button key={cidr} type="button" className={chipClass} onClick={() => setRawInput(cidr)}>
          {cidr}
        </button>
      ))}

      <span className="hidden sm:inline w-px h-4 bg-line/20 mx-1" aria-hidden="true" />

      <button type="button" className={actionClass} onClick={() => setActiveDrawer('reference')}>
        Browse reference
      </button>
      <button type="button" className={actionClass} onClick={() => setActiveDrawer('supernet')}>
        Aggregate routes
      </button>

      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden sm:flex items-center gap-1.5 ml-auto text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer"
      >
        <kbd className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-line/20">/</kbd>
        for all commands
      </button>
    </motion.div>
  )
}
