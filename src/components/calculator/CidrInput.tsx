import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { parseCidr } from '@/lib/cidr'
import { ipv4ToString, parseIPv4 } from '@/lib/ipv4'
import { Select } from '@/components/shared/Input'
import { SegmentedControl } from '@/components/shared/SegmentedControl'

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
  const { rawInput, setRawInput, inputMode, setInputMode, handoff, restoreHandoff, dismissHandoff } = useCalculatorStore()
  useKeyboardShortcuts(inputRef)

  const advancedMode = inputMode === 'cidr'

  // For the split mode, we keep a local IP string so user can type partial IPs.
  const [splitIp, setSplitIp] = useState(() => extractIp(rawInput))
  const [cidrDraft, setCidrDraft] = useState<{ value: string; baseRawInput: string } | null>(null)

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

  // Sync local IP only when the store value actually changes (URL nav, example
  // chips, reference rows, supernet undo…). Typing partial/invalid IPs never
  // gets stomped, because then the store value stays the same.
  const storeIp = extractIp(rawInput)
  const [prevRawInput, setPrevRawInput] = useState(rawInput)
  if (rawInput !== prevRawInput) {
    setPrevRawInput(rawInput)
    if (splitIp !== storeIp) {
      setSplitIp(storeIp)
    }
  }

  const visibleCidrInput = cidrDraft?.baseRawInput === rawInput ? cidrDraft.value : rawInput
  const trimmedCidrInput = visibleCidrInput.trim()
  const trimmedSplitIp = splitIp.trim()
  const localIsValid = advancedMode
    ? trimmedCidrInput.length > 0 && parseCidr(trimmedCidrInput) !== null
    : trimmedSplitIp.length > 0 && parseIPv4(trimmedSplitIp) !== null
  const hasInput = advancedMode ? trimmedCidrInput.length > 0 : trimmedSplitIp.length > 0

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleIpChange = useCallback((newIp: string) => {
    setSplitIp(newIp)
    const trimmed = newIp.trim()
    if (trimmed) {
      const parsed = parseIPv4(trimmed)
      if (parsed !== null) {
        setRawInput(`${trimmed}/${currentPrefix}`)
      }
    } else {
      setRawInput('')
    }
  }, [currentPrefix, setRawInput])

  const handlePrefixChange = useCallback((newPrefix: number) => {
    const trimmed = splitIp.trim()
    if (trimmed && parseIPv4(trimmed) !== null) {
      setRawInput(`${trimmed}/${newPrefix}`)
    }
  }, [splitIp, setRawInput])

  const handleCidrChange = useCallback((nextValue: string) => {
    const trimmed = nextValue.trim()
    if (!trimmed) {
      setCidrDraft(null)
      setRawInput('')
      return
    }

    if (parseCidr(trimmed)) {
      setCidrDraft(null)
      setRawInput(trimmed)
    } else {
      setCidrDraft({ value: nextValue, baseRawInput: rawInput })
    }
  }, [rawInput, setRawInput])

  const handleClear = useCallback(() => {
    setSplitIp('')
    setCidrDraft(null)
    setRawInput('')
  }, [setRawInput])

  const borderClass = hasInput && localIsValid
    ? 'border-sol-green/40'
    : hasInput && !localIsValid
    ? 'border-sol-red/40'
    : 'border-line/20'

  const modeToggleButtons = (
    <SegmentedControl
      options={[
        { value: 'guided', label: 'Guided' },
        { value: 'cidr', label: 'CIDR' },
      ]}
      value={inputMode}
      onChange={setInputMode}
      size="xs"
      ariaLabel="Input mode"
      className="shrink-0"
    />
  )

  const modeToggleDesktop = (
    <>
      <div className="w-px h-5 bg-line/20 mx-1.5" />
      {modeToggleButtons}
    </>
  )

  const globeIcon = (
    <div className="flex items-center gap-3 text-ink-muted mr-3">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    </div>
  )

  const clearButton = hasInput && (
    <motion.button
      type="button"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={handleClear}
      className="p-1.5 rounded-lg hover:bg-well text-ink-muted transition-colors shrink-0"
      aria-label="Clear CIDR input"
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
                name="cidr"
                value={visibleCidrInput}
                onChange={(e) => handleCidrChange(e.target.value)}
                placeholder="Enter CIDR notation… e.g. 10.0.0.0/16"
                className="flex-1 bg-transparent text-xl font-mono font-medium text-ink placeholder:text-ink-muted/40 focus:outline-none"
                spellCheck={false}
                autoComplete="off"
                data-cidr-input
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
                name="ip-address"
                value={splitIp}
                onChange={(e) => handleIpChange(e.target.value)}
                placeholder="IP address… e.g. 10.0.0.0"
                className="flex-1 min-w-0 bg-transparent text-xl font-mono font-medium text-ink placeholder:text-ink-muted/40 focus:outline-none"
                spellCheck={false}
                autoComplete="off"
                data-cidr-input
              />
              <div className="shrink-0 flex items-center">
                <span className="text-ink-muted text-xl font-mono mr-1">/</span>
                <Select
                  value={currentPrefix}
                  onChange={(e) => handlePrefixChange(Number(e.target.value))}
                  name="prefix-length"
                  aria-label="Prefix length"
                  mono
                  className="font-medium"
                >
                  {PREFIX_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isMobile ? `/${opt.value}` : `/${opt.value} — ${opt.netmask}`}
                    </option>
                  ))}
                </Select>
              </div>
              {clearButton}
              <div className="hidden sm:flex items-center">{modeToggleDesktop}</div>
            </div>
            <div className="flex sm:hidden justify-end mt-2">
              {modeToggleButtons}
            </div>
          </div>
        )}

        {hasInput && !localIsValid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 pb-2.5 overflow-hidden"
          >
            <p className="text-sm text-sol-red">
              {advancedMode
                ? 'Enter CIDR notation like 192.168.1.0/24. The current calculation is unchanged until the CIDR is valid.'
                : 'Enter an IPv4 address like 192.168.1.0. The selected prefix is preserved.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Supernet handoff notice */}
      {handoff && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-sol-cyan/10 border border-sol-cyan/20 text-xs text-ink">
            <svg className="w-3.5 h-3.5 text-sol-cyan shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <span className="min-w-0">
              Loaded supernet result <span className="font-mono text-sol-cyan">{handoff.next}</span>
            </span>
            <button
              type="button"
              onClick={restoreHandoff}
              className="ml-auto shrink-0 font-medium text-sol-cyan hover:text-sol-cyan/80 transition-colors cursor-pointer"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={dismissHandoff}
              aria-label="Dismiss supernet notice"
              className="shrink-0 p-0.5 rounded text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
