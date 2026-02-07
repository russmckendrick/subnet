import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { useThemeStore } from '@/store/theme-store'
import { commands, filterCommands, detectCidrInput, type Command } from '@/lib/commands'
import { toJSON, toCSV, toTerraformAws, toTerraformAzure, toTerraformGcp } from '@/lib/export'
import { toAwsCli, toAzureCli, toGcloudCli } from '@/lib/export-cli'
import { CommandGroup } from './CommandGroup'
import { CommandItem } from './CommandItem'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, result, splits, setRawInput, setActiveDrawer, resetSplits, setInputMode } = useCalculatorStore()
  const { toggleTheme } = useThemeStore()

  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset state when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('')
      setActiveIndex(0)
      // Focus input after animation starts
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [commandPaletteOpen])

  // Body scroll lock
  useEffect(() => {
    if (commandPaletteOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [commandPaletteOpen])

  const hasResult = result !== null
  const cidrDetection = useMemo(() => detectCidrInput(search), [search])

  const filtered = useMemo(() => {
    const base = filterCommands(commands, search, hasResult)
    if (cidrDetection) {
      const syntheticCommand: Command = {
        id: `navigate:${cidrDetection}`,
        label: `Navigate to ${cidrDetection}`,
        description: 'Calculate this CIDR block',
        category: 'Navigate',
        keywords: [],
        icon: 'globe',
        action: `navigate:${cidrDetection}`,
      }
      return [syntheticCommand, ...base]
    }
    return base
  }, [search, hasResult, cidrDetection])

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0)
  }, [filtered.length, search])

  // Build a flat list of items with group headers for rendering
  const groupedItems = useMemo(() => {
    const result: Array<{ type: 'group'; category: string } | { type: 'command'; command: Command; flatIndex: number }> = []
    let currentCategory = ''
    let flatIndex = 0

    for (const cmd of filtered) {
      if (cmd.category !== currentCategory) {
        currentCategory = cmd.category
        result.push({ type: 'group', category: currentCategory })
      }
      result.push({ type: 'command', command: cmd, flatIndex })
      flatIndex++
    }
    return result
  }, [filtered])

  const executeCommand = useCallback((action: string) => {
    setCommandPaletteOpen(false)

    if (action === 'focus-input') {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLInputElement>('[data-cidr-input]')
        el?.focus()
        el?.select()
      })
      return
    }

    if (action.startsWith('navigate:')) {
      const cidr = action.slice('navigate:'.length)
      setRawInput(cidr)
      return
    }

    if (action === 'open-reference') { setActiveDrawer('reference'); return }
    if (action === 'open-supernet') { setActiveDrawer('supernet'); return }
    if (action === 'toggle-theme') { toggleTheme(); return }
    if (action === 'clear-input') { setRawInput(''); return }
    if (action === 'reset-splits') { resetSplits(); return }
    if (action === 'mode-guided') { setInputMode('guided'); return }
    if (action === 'mode-cidr') { setInputMode('cidr'); return }

    if (action === 'share-url') {
      navigator.clipboard.writeText(window.location.href)
      return
    }

    // Export actions
    if (action.startsWith('export:') && result) {
      let content = ''
      switch (action) {
        case 'export:json': content = toJSON(result, splits.length > 0 ? splits : undefined); break
        case 'export:csv': content = toCSV(result, splits.length > 0 ? splits : undefined); break
        case 'export:tf-aws': content = toTerraformAws(result, splits.length > 0 ? splits : undefined); break
        case 'export:tf-azure': content = toTerraformAzure(result, splits.length > 0 ? splits : undefined); break
        case 'export:tf-gcp': content = toTerraformGcp(result, splits.length > 0 ? splits : undefined); break
        case 'export:cli-aws': content = toAwsCli(result, splits.length > 0 ? splits : undefined); break
        case 'export:cli-azure': content = toAzureCli(result, splits.length > 0 ? splits : undefined); break
        case 'export:cli-gcp': content = toGcloudCli(result, splits.length > 0 ? splits : undefined); break
      }
      if (content) navigator.clipboard.writeText(content)
    }
  }, [result, splits, setRawInput, setActiveDrawer, resetSplits, setInputMode, toggleTheme, setCommandPaletteOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[activeIndex]
      if (cmd) executeCommand(cmd.action)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setCommandPaletteOpen(false)
    }
  }, [filtered, activeIndex, executeCommand, setCommandPaletteOpen])

  const activeItemId = filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="fixed inset-0 z-50 flex justify-center pt-4 sm:pt-[20vh] pointer-events-none"
          >
            <div
              className="w-full max-w-lg mx-4 pointer-events-auto h-fit max-h-[min(480px,70vh)] flex flex-col
                bg-[#fdf6e3] dark:bg-[#002b36] border border-[#93a1a1]/20 dark:border-[#586e75]/30
                rounded-lg shadow-2xl overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#93a1a1]/20 dark:border-[#586e75]/20">
                <svg className="w-4 h-4 shrink-0 text-[#93a1a1] dark:text-[#586e75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or CIDR..."
                  className="flex-1 bg-transparent text-base font-mono text-[#586e75] dark:text-[#93a1a1] placeholder:text-[#93a1a1]/40 dark:placeholder:text-[#586e75]/40 focus:outline-none"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="command-palette-list"
                  aria-activedescendant={activeItemId}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>

              {/* Results */}
              <div
                ref={listRef}
                id="command-palette-list"
                role="listbox"
                className="flex-1 overflow-y-auto py-1.5"
              >
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-[#93a1a1] dark:text-[#586e75]">
                    No matching commands
                  </div>
                ) : (
                  groupedItems.map((item) => {
                    if (item.type === 'group') {
                      return <CommandGroup key={`group-${item.category}`} label={item.category} />
                    }
                    return (
                      <CommandItem
                        key={item.command.id}
                        id={`cmd-${item.command.id}`}
                        command={item.command}
                        isActive={item.flatIndex === activeIndex}
                        onSelect={() => executeCommand(item.command.action)}
                        onMouseEnter={() => setActiveIndex(item.flatIndex)}
                      />
                    )
                  })
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-[#93a1a1]/20 dark:border-[#586e75]/20 text-[10px] text-[#93a1a1] dark:text-[#586e75]">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-[#eee8d5] dark:bg-[#073642] px-1 py-0.5 rounded text-[9px]">&#8593;&#8595;</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-[#eee8d5] dark:bg-[#073642] px-1 py-0.5 rounded text-[9px]">&#9166;</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-[#eee8d5] dark:bg-[#073642] px-1 py-0.5 rounded text-[9px]">esc</kbd>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
