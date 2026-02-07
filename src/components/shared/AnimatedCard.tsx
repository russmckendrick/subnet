import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`rounded-lg border
        bg-[#eee8d5] border-[#93a1a1]/30 shadow-sm
        dark:bg-[#073642] dark:border-[#586e75]/30 dark:shadow-none
        ${className}`}
    >
      {children}
    </motion.div>
  )
}
