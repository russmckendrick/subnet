import { useId, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AnimatedCard } from './AnimatedCard'

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  delay?: number
}

export function CollapsibleSection({ title, children, defaultOpen = true, delay = 0 }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = useId()

  return (
    <AnimatedCard delay={delay} className="p-3 sm:p-4 mt-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between group cursor-pointer rounded-md"
      >
        <h3 className="text-xs font-medium text-[#586e75] dark:text-[#586e75] uppercase tracking-wider">
          {title}
        </h3>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-[#93a1a1] dark:text-[#586e75] group-hover:text-[#586e75] dark:group-hover:text-[#93a1a1] transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  )
}
