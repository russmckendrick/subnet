import { useEffect, useId, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Focus trap: focus drawer when opened
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
      drawerRef.current.focus()
    } else {
      previouslyFocusedRef.current?.focus()
      previouslyFocusedRef.current = null
    }
  }, [isOpen])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel — right on desktop, bottom on mobile */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] z-50 outline-none
              bg-[#fdf6e3] dark:bg-[#002b36] border-l border-[#93a1a1]/20 dark:border-[#586e75]/20
              shadow-2xl flex flex-col overscroll-contain"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#93a1a1]/20 dark:border-[#586e75]/20">
              <h2 id={titleId} className="text-sm font-semibold text-[#586e75] dark:text-[#93a1a1] uppercase tracking-wider">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#eee8d5] dark:hover:bg-[#073642] text-[#93a1a1] dark:text-[#586e75] transition-colors"
                aria-label={`Close ${title}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
