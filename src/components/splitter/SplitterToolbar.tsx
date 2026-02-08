import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { useClipboard } from '@/hooks/use-clipboard'

const QUICK_PREFIXES = [24, 25, 26, 27, 28]

type ViewMode = 'table' | 'cards'

interface SplitterToolbarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function SplitterToolbar({ viewMode, onViewModeChange }: SplitterToolbarProps) {
  const {
    splits,
    availablePrefixes,
    addSplit,
    resetSplits,
    rawInput,
  } = useCalculatorStore()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { copy, isCopied } = useClipboard()
  const copied = isCopied('splitter-copy-all')

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  if (splits.length === 0) return null

  const designerHref = `/designer?from=${encodeURIComponent(rawInput)}&split=${splits.map((s) => `${s.prefixLength}~${encodeURIComponent(s.label)}`).join(',')}`
  const allCidrs = splits.map((s) => `${s.label}: ${s.cidr}`).join('\n')

  const handleAdd = (prefix: number) => {
    addSplit(prefix)
    setDropdownOpen(false)
  }

  return (
    <div className="flex items-center justify-between mb-3">
      {/* Left: actions */}
      <div className="flex items-center gap-1">
        {/* Add subnet dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={availablePrefixes.length === 0}
            className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#eee8d5] dark:hover:bg-[#073642] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={availablePrefixes.length === 0 ? 'Fully allocated' : 'Add Subnet'}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add</span>
          </button>

          <AnimatePresence>
            {dropdownOpen && availablePrefixes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 w-80 bg-[#fdf6e3] dark:bg-[#002b36] border border-[#93a1a1]/20 dark:border-[#586e75]/20 rounded-lg shadow-lg z-50 p-4 space-y-4"
              >
                {/* Quick prefixes */}
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#93a1a1] dark:text-[#586e75] mb-2.5">
                    Quick Add
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PREFIXES.filter(p => availablePrefixes.includes(p)).map((p) => (
                      <button
                        key={p}
                        onClick={() => handleAdd(p)}
                        className="text-xs font-mono px-3 py-2 rounded-lg border border-[#586e75]/20 text-[#586e75] dark:text-[#93a1a1] hover:border-[#2aa198]/30 hover:bg-[#2aa198]/5 hover:text-[#2aa198] transition-colors"
                      >
                        <div className="font-semibold">/{p}</div>
                        <div className="text-[10px] text-[#93a1a1] dark:text-[#586e75] mt-0.5">
                          {Math.pow(2, 32 - p).toLocaleString()} addr
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#93a1a1]/15 dark:border-[#586e75]/20" />

                {/* All available */}
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#93a1a1] dark:text-[#586e75] mb-2.5">
                    All Available
                  </span>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 -mx-1 px-1">
                    {availablePrefixes.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleAdd(p)}
                        className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#eee8d5] dark:hover:bg-[#073642] transition-colors"
                      >
                        <span className="font-mono font-semibold">/{p}</span>
                        <span className="text-[11px] text-[#93a1a1] dark:text-[#586e75]">
                          {Math.pow(2, 32 - p).toLocaleString()} addresses
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Copy All */}
        <button
          onClick={() => copy(allCidrs, 'splitter-copy-all')}
          className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors ${
            copied
              ? 'text-[#859900] bg-[#859900]/10'
              : 'text-[#586e75] dark:text-[#93a1a1] hover:text-[#2aa198] hover:bg-[#eee8d5] dark:hover:bg-[#073642]'
          }`}
          title="Copy All CIDRs"
        >
          {copied ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <div className="w-px h-4 bg-[#93a1a1]/15 dark:bg-[#586e75]/15" />

        {/* Reset */}
        <button
          onClick={resetSplits}
          className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg text-[#586e75] dark:text-[#93a1a1] hover:text-[#dc322f] hover:bg-[#dc322f]/5 transition-colors"
          title="Reset All Subnets"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          <span>Reset</span>
        </button>
      </div>

      {/* Right: view toggle + Designer link */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 bg-[#eee8d5]/50 dark:bg-[#073642]/50 rounded-lg p-0.5">
          {([
            { id: 'table' as ViewMode, label: 'Table' },
            { id: 'cards' as ViewMode, label: 'Cards' },
          ]).map((mode) => {
            const isActive = viewMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => onViewModeChange(mode.id)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded transition-all ${
                  isActive
                    ? 'bg-[#2aa198]/15 text-[#2aa198]'
                    : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1]'
                }`}
              >
                {mode.label}
              </button>
            )
          })}
        </div>

        <div className="w-px h-4 bg-[#93a1a1]/15 dark:bg-[#586e75]/15" />

        {/* Open in Designer */}
        <a
          href={designerHref}
          className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg text-[#2aa198] hover:bg-[#2aa198]/10 transition-colors"
          title="Open in Designer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M12 8.25v7.5m3.75-3.75H8.25" />
          </svg>
          <span>Open in Designer</span>
        </a>
      </div>
    </div>
  )
}
