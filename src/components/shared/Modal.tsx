import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeIn, modalPop } from './motion'
import { IconButton } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  /** Required for chrome="default"; rendered in the header bar. */
  title?: string
  size?: 'md' | 'lg'
  align?: 'center' | 'top'
  /** "none" renders the panel without header/background — caller owns the chrome. */
  chrome?: 'default' | 'none'
  /** Accessible name when chrome="none" (no visible title). */
  ariaLabel?: string
  panelClassName?: string
  onKeyDown?: (e: KeyboardEvent) => void
  children: ReactNode
}

const sizeClasses = { md: 'max-w-lg', lg: 'max-w-xl' } as const

/** Shared modal: backdrop, Escape, scroll lock, focus restore, pop animation. */
export function Modal({
  isOpen,
  onClose,
  title,
  size = 'lg',
  align = 'center',
  chrome = 'default',
  ariaLabel,
  panelClassName = '',
  onKeyDown,
  children,
}: ModalProps) {
  const titleId = useId()
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      previouslyFocusedRef.current?.focus()
      previouslyFocusedRef.current = null
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const alignClasses =
    align === 'top' ? 'items-start pt-4 sm:pt-[20vh]' : 'items-center p-4'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            {...fadeIn}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            {...modalPop}
            className={`fixed inset-0 z-50 flex justify-center ${alignClasses} pointer-events-none`}
          >
            <div
              role="dialog"
              aria-modal="true"
              {...(chrome === 'default' ? { 'aria-labelledby': titleId } : { 'aria-label': ariaLabel })}
              onKeyDown={onKeyDown}
              className={
                chrome === 'default'
                  ? `bg-surface border border-line/20 rounded-lg shadow-2xl w-full ${sizeClasses[size]} mx-4 pointer-events-auto max-h-[80vh] flex flex-col overflow-hidden ${panelClassName}`
                  : `w-full ${sizeClasses[size]} mx-4 pointer-events-auto h-fit flex flex-col ${panelClassName}`
              }
              onClick={(e) => e.stopPropagation()}
            >
              {chrome === 'default' && (
                <div className="flex items-center justify-between px-5 py-3 border-b border-line/15 shrink-0">
                  <h2 id={titleId} className="text-sm font-semibold text-ink">
                    {title}
                  </h2>
                  <IconButton size="sm" variant="ghost" aria-label={`Close ${title ?? 'dialog'}`} onClick={onClose}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </IconButton>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
