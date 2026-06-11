import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cardEntrance } from './motion'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      {...cardEntrance(delay)}
      className={`rounded-lg border bg-surface border-line/30 shadow-sm dark:shadow-none ${className}`}
    >
      {children}
    </motion.div>
  )
}
