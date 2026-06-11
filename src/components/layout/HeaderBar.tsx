import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useThemeStore } from '@/store/theme-store'

interface HeaderBarProps {
  /** When set, the logo becomes a link (designer → calculator back-navigation). */
  logoHref?: string
  logoAriaLabel?: string
  title: ReactNode
  subtitle?: string
  actions: ReactNode
  /** Bottom border + solid background — used by the full-width designer shell. */
  bordered?: boolean
  width?: 'contained' | 'full'
}

/** The one header chrome shared by the calculator and designer shells. */
export function HeaderBar({
  logoHref,
  logoAriaLabel,
  title,
  subtitle,
  actions,
  bordered = false,
  width = 'contained',
}: HeaderBarProps) {
  const theme = useThemeStore((s) => s.theme)

  const logo = (
    <img
      src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="subnet.fit logo"
      className="h-8 w-auto"
    />
  )

  return (
    <header className={`relative z-10 ${bordered ? 'border-b border-line/20 bg-canvas' : ''}`}>
      <div
        className={`flex items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 w-full ${
          width === 'contained' ? 'max-w-6xl mx-auto' : ''
        }`}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 min-w-0 sm:gap-3"
        >
          {logoHref ? (
            <a href={logoHref} aria-label={logoAriaLabel} className="shrink-0 transition-opacity hover:opacity-80">
              {logo}
            </a>
          ) : (
            logo
          )}
          <div className="min-w-0">
            {title}
            {subtitle && (
              <p className="hidden min-[480px]:block text-[10px] text-sol-base01 -mt-0.5 tracking-wide uppercase leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1.5 sm:gap-2 shrink-0"
        >
          {actions}
        </motion.div>
      </div>
    </header>
  )
}
