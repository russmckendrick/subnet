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
      className={`glass-card rounded-2xl border
        bg-white/90 border-slate-200/80 shadow-sm shadow-slate-900/[0.04]
        dark:bg-slate-900/60 dark:border-slate-700/50 dark:shadow-lg dark:shadow-black/30
        ${className}`}
    >
      {children}
    </motion.div>
  )
}
