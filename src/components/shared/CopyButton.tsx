import { motion, AnimatePresence } from 'motion/react'
import { useClipboard } from '@/hooks/use-clipboard'

interface CopyButtonProps {
  text: string
  label?: string
  copyKey: string
  className?: string
}

export function CopyButton({ text, label, copyKey, className = '' }: CopyButtonProps) {
  const { copy, isCopied } = useClipboard()
  const copied = isCopied(copyKey)

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => copy(text, copyKey)}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors
        ${copied
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-500 dark:hover:text-slate-300'
        }
        ${className}`}
      title={`Copy ${label ?? 'value'}`}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.svg
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </motion.svg>
        )}
      </AnimatePresence>
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </motion.button>
  )
}
