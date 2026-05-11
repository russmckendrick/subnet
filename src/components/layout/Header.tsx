import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useThemeStore } from '@/store/theme-store'
import { useCalculatorStore } from '@/store/calculator-store'

export function Header() {
  const { theme, toggleTheme } = useThemeStore()
  const { setActiveDrawer, setCommandPaletteOpen, rawInput, result, splits } = useCalculatorStore()

  const designerHref = useMemo(() => {
    if (!result || !rawInput) return '/designer'
    const params: string[] = [`from=${encodeURIComponent(rawInput)}`]
    if (splits.length > 0) {
      params.push(`split=${splits.map((s) => `${s.prefixLength}~${encodeURIComponent(s.label)}`).join(',')}`)
    }
    return `/designer?${params.join('&')}`
  }, [rawInput, result, splits])

  return (
    <header className="relative z-10 flex items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 min-w-0 sm:gap-3"
      >
        <img
          src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
          alt="subnet.fit logo"
          className="h-8 w-auto sm:h-9"
        />
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[#586e75] dark:text-[#93a1a1] tracking-tight">
            subnet<span className="text-[#2aa198]">.fit</span>
          </h1>
          <p className="hidden min-[480px]:block text-[10px] text-[#586e75] dark:text-[#586e75] -mt-0.5 tracking-wide uppercase leading-tight">
            CIDR Calculator & Network Planner
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1.5 sm:gap-2 shrink-0"
      >
        {/* Designer link */}
        <a
          href={designerHref}
          className="flex items-center gap-1.5 text-xs text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
          aria-label="Open Network Designer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M12 8.25v7.5m3.75-3.75H8.25" />
          </svg>
          <span className="hidden sm:inline">Designer</span>
        </a>

        {/* Reference drawer button */}
        <button
          type="button"
          onClick={() => setActiveDrawer('reference')}
          className="flex items-center gap-1.5 text-xs text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
          aria-label="Open CIDR Reference"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <span className="hidden sm:inline">Reference</span>
        </button>

        {/* Supernet drawer button */}
        <button
          type="button"
          onClick={() => setActiveDrawer('supernet')}
          className="flex items-center gap-1.5 text-xs text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
          aria-label="Open Supernet Tool"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <span className="hidden sm:inline">Supernet</span>
        </button>

        {/* Command palette trigger (mobile) */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="sm:hidden flex items-center gap-1.5 text-xs text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
          aria-label="Open command palette"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>

        {/* Keyboard hints */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-1.5 text-xs text-[#586e75] bg-[#eee8d5] dark:bg-[#073642] px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Open command palette"
        >
          <kbd className="font-mono text-[10px] bg-[#fdf6e3] dark:bg-[#002b36] px-1.5 py-0.5 rounded border border-[#93a1a1]/20 dark:border-[#586e75]/30">/</kbd>
          <span>commands</span>
          <kbd className="font-mono text-[10px] bg-[#fdf6e3] dark:bg-[#002b36] px-1.5 py-0.5 rounded border border-[#93a1a1]/20 dark:border-[#586e75]/30 ml-1">&#8593;&#8595;</kbd>
          <span>prefix</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-[#eee8d5] dark:bg-[#073642] hover:bg-[#eee8d5]/80 dark:hover:bg-[#073642]/80 transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-[#b58900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[#586e75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </motion.div>
        </button>
      </motion.div>
    </header>
  )
}
