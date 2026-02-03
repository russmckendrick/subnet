import { useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function CidrInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { rawInput, setRawInput, result } = useCalculatorStore()
  useKeyboardShortcuts(inputRef)

  const isValid = result !== null
  const hasInput = rawInput.trim().length > 0

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <div
        className={`relative glass-card rounded-2xl border-2 transition-colors duration-300 shadow-xl
          ${hasInput && isValid
            ? 'border-cyan-500/40 dark:border-cyan-500/30 shadow-cyan-500/10'
            : hasInput && !isValid
            ? 'border-red-500/40 dark:border-red-500/30 shadow-red-500/10'
            : 'border-black/[0.06] dark:border-white/[0.1]'
          }
          bg-white/80 dark:bg-white/[0.06]`}
      >
        <div className="flex items-center px-5 py-4">
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 mr-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Enter CIDR notation... (e.g. 10.0.0.0/16)"
            className="flex-1 bg-transparent text-xl font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          {hasInput && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setRawInput('')}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>

        {hasInput && !isValid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-5 pb-3 overflow-hidden"
          >
            <p className="text-sm text-red-500 dark:text-red-400">
              Invalid CIDR notation. Use format: 192.168.1.0/24
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
