import { motion } from 'motion/react'
import { useThemeStore } from '@/store/theme-store'

export function Header() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            subnet<span className="text-cyan-600 dark:text-cyan-400">.fit</span>
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 -mt-0.5 tracking-wide uppercase">
            CIDR Calculator & Network Planner
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-black/[0.03] dark:bg-white/[0.05] px-2.5 py-1.5 rounded-lg">
          <kbd className="font-mono text-[10px] bg-white/60 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/[0.06] dark:border-white/10">/</kbd>
          <span>to focus</span>
          <kbd className="font-mono text-[10px] bg-white/60 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/[0.06] dark:border-white/10 ml-1">&#8593;&#8595;</kbd>
          <span>prefix</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </motion.div>
        </button>
      </motion.div>
    </header>
  )
}
