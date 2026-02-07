import { motion } from 'motion/react'
import { useClipboard } from '@/hooks/use-clipboard'
import { useThemeStore } from '@/store/theme-store'
import { tokenize, getTokenColor } from '@/lib/syntax-highlight'

interface TerminalFrameProps {
  title: string
  providerColor: string
  code: string
  copyKey: string
}

export function TerminalFrame({ title, providerColor, code, copyKey }: TerminalFrameProps) {
  const { copy, isCopied } = useClipboard()
  const theme = useThemeStore((s) => s.theme)
  const lines = tokenize(code, 'shell')

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg overflow-hidden border border-[#93a1a1]/20 dark:border-[#586e75]/30"
    >
      {/* Title bar */}
      <div className="bg-[#eee8d5] dark:bg-[#002b36] px-3 py-2 flex items-center justify-between border-b border-[#93a1a1]/20 dark:border-[#586e75]/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#dc322f]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#b58900]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#859900]" />
          </div>
          <span className="text-xs font-medium ml-1" style={{ color: providerColor }}>
            {title}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => copy(code, copyKey)}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
            isCopied(copyKey)
              ? 'bg-[#859900]/20 text-[#859900]'
              : 'text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1]'
          }`}
        >
          {isCopied(copyKey) ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>
      {/* Terminal body */}
      <pre className="bg-[#fdf6e3] dark:bg-[#002b36] text-[#657b83] dark:text-[#839496] text-xs font-mono p-4 overflow-x-auto max-h-64 overflow-y-auto">
        <code>
          {lines.map((lineTokens, i) => (
            <span key={i}>
              {lineTokens.map((token, j) => (
                <span key={j} style={{ color: getTokenColor(token.type, theme) }}>
                  {token.value}
                </span>
              ))}
              {i < lines.length - 1 ? '\n' : ''}
            </span>
          ))}
        </code>
      </pre>
    </motion.div>
  )
}
