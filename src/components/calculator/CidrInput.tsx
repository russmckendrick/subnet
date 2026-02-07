import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { ipv4ToString } from '@/lib/ipv4'
import { config } from '@/lib/config'

const PREFIX_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const mask = i === 0 ? 0 : (~0 << (32 - i)) >>> 0
  return {
    value: i,
    label: `/${i}`,
    netmask: ipv4ToString(mask),
  }
})

function extractPrefix(raw: string): number {
  const slashIdx = raw.lastIndexOf('/')
  if (slashIdx === -1) return 24
  const n = parseInt(raw.slice(slashIdx + 1), 10)
  return isNaN(n) ? 24 : Math.max(0, Math.min(32, n))
}

function extractIp(raw: string): string {
  const slashIdx = raw.lastIndexOf('/')
  return slashIdx === -1 ? raw.trim() : raw.slice(0, slashIdx)
}

export function CidrInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { rawInput, setRawInput, result } = useCalculatorStore()
  useKeyboardShortcuts(inputRef)

  const [advancedMode, setAdvancedMode] = useState(config.defaultInputMode === 'cidr')

  // For the split mode, we keep a local IP string so user can type partial IPs.
  const [splitIp, setSplitIp] = useState(() => extractIp(rawInput))
  const [splitIpSource, setSplitIpSource] = useState<'local' | 'store'>('store')

  // Track mobile breakpoint for responsive prefix dropdown text
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false
  )

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // Derive prefix from store
  const currentPrefix = extractPrefix(rawInput)

  // When store value changes from store (URL hash etc) and we didn't cause it, sync splitIp
  const storeIp = extractIp(rawInput)
  if (splitIpSource === 'store' && splitIp !== storeIp) {
    setSplitIp(storeIp)
  }

  const isValid = result !== null
  const hasInput = rawInput.trim().length > 0

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleIpChange = useCallback((newIp: string) => {
    setSplitIp(newIp)
    setSplitIpSource('local')
    if (newIp.trim()) {
      setRawInput(`${newIp}/${currentPrefix}`)
    } else {
      setRawInput('')
    }
    queueMicrotask(() => setSplitIpSource('store'))
  }, [currentPrefix, setRawInput])

  const handlePrefixChange = useCallback((newPrefix: number) => {
    if (splitIp.trim()) {
      setRawInput(`${splitIp}/${newPrefix}`)
    }
  }, [splitIp, setRawInput])

  const handleClear = useCallback(() => {
    setSplitIp('')
    setSplitIpSource('store')
    setRawInput('')
  }, [setRawInput])

  const borderClass = hasInput && isValid
    ? 'border-[#859900]/40'
    : hasInput && !isValid
    ? 'border-[#dc322f]/40'
    : 'border-[#93a1a1]/20 dark:border-[#586e75]/30'

  const modeToggleButtons = (
    <div className="flex gap-0.5 shrink-0">
      <button
        onClick={() => setAdvancedMode(false)}
        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
          !advancedMode
            ? 'bg-[#2aa198]/10 text-[#2aa198] border border-[#2aa198]/20'
            : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1] border border-transparent'
        }`}
      >
        Guided
      </button>
      <button
        onClick={() => setAdvancedMode(true)}
        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
          advancedMode
            ? 'bg-[#2aa198]/10 text-[#2aa198] border border-[#2aa198]/20'
            : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1] border border-transparent'
        }`}
      >
        CIDR
      </button>
    </div>
  )

  const modeToggleDesktop = (
    <>
      <div className="w-px h-5 bg-[#93a1a1]/20 dark:bg-[#586e75]/20 mx-1.5" />
      {modeToggleButtons}
    </>
  )

  const globeIcon = (
    <div className="flex items-center gap-3 text-[#93a1a1] dark:text-[#586e75] mr-3">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    </div>
  )

  const clearButton = hasInput && (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={handleClear}
      className="p-1.5 rounded-lg hover:bg-[#fdf6e3] dark:hover:bg-[#002b36] text-[#93a1a1] transition-colors shrink-0"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </motion.button>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mb-4"
    >
      <div
        className={`relative rounded-lg border transition-colors duration-300 bg-transparent ${borderClass}`}
      >
        {advancedMode ? (
          <div className="px-4 py-3">
            <div className="flex items-center">
              {globeIcon}
              <input
                ref={inputRef}
                type="text"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Enter CIDR notation... (e.g. 10.0.0.0/16)"
                className="flex-1 bg-transparent text-xl font-mono font-medium text-[#586e75] dark:text-[#93a1a1] placeholder:text-[#93a1a1]/40 dark:placeholder:text-[#586e75]/40 focus:outline-none"
                spellCheck={false}
                autoComplete="off"
              />
              {clearButton}
              <div className="hidden sm:flex items-center">{modeToggleDesktop}</div>
            </div>
            <div className="flex sm:hidden justify-end mt-2">
              {modeToggleButtons}
            </div>
          </div>
        ) : (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              {globeIcon}
              <input
                ref={inputRef}
                type="text"
                value={splitIp}
                onChange={(e) => handleIpChange(e.target.value)}
                placeholder="IP address (e.g. 10.0.0.0)"
                className="flex-1 min-w-0 bg-transparent text-xl font-mono font-medium text-[#586e75] dark:text-[#93a1a1] placeholder:text-[#93a1a1]/40 dark:placeholder:text-[#586e75]/40 focus:outline-none"
                spellCheck={false}
                autoComplete="off"
              />
              <div className="shrink-0 flex items-center">
                <span className="text-[#93a1a1] dark:text-[#586e75] text-xl font-mono mr-1">/</span>
                <select
                  value={currentPrefix}
                  onChange={(e) => handlePrefixChange(Number(e.target.value))}
                  className="bg-[#fdf6e3] dark:bg-[#002b36] text-[#586e75] dark:text-[#93a1a1] text-sm font-mono font-medium rounded-lg px-2 py-1.5 border border-[#93a1a1]/20 dark:border-[#586e75]/30 focus:outline-none focus:ring-2 focus:ring-[#2aa198]/30 cursor-pointer appearance-none pr-7"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23586e75' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.3rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                >
                  {PREFIX_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isMobile ? `/${opt.value}` : `/${opt.value} — ${opt.netmask}`}
                    </option>
                  ))}
                </select>
              </div>
              {clearButton}
              <div className="hidden sm:flex items-center">{modeToggleDesktop}</div>
            </div>
            <div className="flex sm:hidden justify-end mt-2">
              {modeToggleButtons}
            </div>
          </div>
        )}

        {hasInput && !isValid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 pb-2.5 overflow-hidden"
          >
            <p className="text-sm text-[#dc322f]">
              Invalid {advancedMode ? 'CIDR notation. Use format: 192.168.1.0/24' : 'IP address. Use format: 192.168.1.0'}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
