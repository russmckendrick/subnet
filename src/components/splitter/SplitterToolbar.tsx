import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { useClipboard } from '@/hooks/use-clipboard'
import { Button } from '@/components/shared/Button'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { SectionLabel } from '@/components/shared/LabelValue'

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

  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const { copy, isCopied } = useClipboard()
  const copied = isCopied('splitter-copy-all')

  useEffect(() => {
    if (!moreOpen) return
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as HTMLElement)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreOpen])

  if (splits.length === 0) return null

  // Emit full CIDRs (not bare prefixes) so the designer reproduces exact subnet addresses,
  // including when the calculator is in explicit mode after a designer handoff.
  const designerHref = `/designer?from=${encodeURIComponent(rawInput)}&split=${splits.map((s) => `${s.cidr}~${encodeURIComponent(s.label)}`).join(',')}`
  const allCidrs = splits.map((s) => `${s.label}: ${s.cidr}`).join('\n')

  // Quick prefixes shown inline, the rest go in the "More" dropdown
  const inlineQuick = QUICK_PREFIXES.filter(p => availablePrefixes.includes(p))
  const morePrefixes = availablePrefixes.filter(p => !QUICK_PREFIXES.includes(p))
  const hasMore = morePrefixes.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2 justify-between mb-3 rounded-lg border border-line/10 bg-well/35 px-2 py-2">
      {/* Left: inline quick-add pills + actions */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Inline quick-add prefix pills */}
        {inlineQuick.map((p) => (
          <Button
            key={p}
            variant="outline"
            size="xs"
            onClick={() => addSplit(p)}
            aria-label={`Add /${p} subnet`}
            className="font-mono font-semibold"
          >
            /{p}
          </Button>
        ))}

        {/* More dropdown for non-quick prefixes */}
        {hasMore && (
          <div className="relative" ref={moreRef}>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className="font-mono"
              title="More prefix sizes"
            >
              More…
            </Button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-72 bg-well border border-line/20 rounded-lg shadow-lg z-50 p-3"
                  role="menu"
                >
                  <SectionLabel className="mb-2">All Available Prefixes</SectionLabel>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 -mx-1 px-1">
                    {morePrefixes.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => { addSplit(p); setMoreOpen(false) }}
                        role="menuitem"
                        className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg text-ink hover:text-sol-cyan hover:bg-surface transition-colors"
                      >
                        <span className="font-mono font-semibold">/{p}</span>
                        <span className="text-[11px] text-ink-muted">
                          {Math.pow(2, 32 - p).toLocaleString()} addresses
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Divider between add pills and utility actions */}
        {(inlineQuick.length > 0 || hasMore) && (
          <div className="w-px h-4 bg-line/15 mx-0.5" />
        )}

        {/* Copy All */}
        <button
          type="button"
          onClick={() => copy(allCidrs, 'splitter-copy-all')}
          className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors ${
            copied
              ? 'text-sol-green bg-sol-green/10'
              : 'text-ink hover:text-sol-cyan hover:bg-surface'
          }`}
          title="Copy All CIDRs"
          aria-label={copied ? 'Copied all subnet CIDRs' : 'Copy all subnet CIDRs'}
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

        <div className="w-px h-4 bg-line/15" />

        {/* Reset */}
        <button
          type="button"
          onClick={resetSplits}
          className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg text-ink hover:text-sol-red hover:bg-sol-red/5 transition-colors"
          title="Reset All Subnets"
          aria-label="Reset all subnets"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          <span>Reset</span>
        </button>
      </div>

      {/* Right: view toggle + Designer link */}
      <div className="flex items-center gap-2">
        <SegmentedControl
          options={[
            { value: 'table' as ViewMode, label: 'Table' },
            { value: 'cards' as ViewMode, label: 'Cards' },
          ]}
          value={viewMode}
          onChange={onViewModeChange}
          size="xs"
          role="tablist"
          ariaLabel="Subnet split view"
        />

        <div className="w-px h-4 bg-line/15" />

        {/* Open in Designer */}
        <a
          href={designerHref}
          className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg text-sol-cyan hover:bg-sol-cyan/10 transition-colors"
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
