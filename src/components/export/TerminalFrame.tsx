import { motion } from 'motion/react'
import { useThemeStore } from '@/store/theme-store'
import { tokenize, getTokenColor } from '@/lib/syntax-highlight'
import { CopyButton } from '@/components/shared/CopyButton'

interface TerminalFrameProps {
  title: string
  providerColor: string
  code: string
  copyKey: string
}

export function TerminalFrame({ title, providerColor, code, copyKey }: TerminalFrameProps) {
  const theme = useThemeStore((s) => s.theme)
  const lines = tokenize(code, 'shell')

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg overflow-hidden border border-line/20"
    >
      {/* Title bar */}
      <div className="bg-surface px-3 py-2 flex items-center justify-between border-b border-line/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-sol-red" />
            <div className="w-2.5 h-2.5 rounded-full bg-sol-yellow" />
            <div className="w-2.5 h-2.5 rounded-full bg-sol-green" />
          </div>
          <span className="text-xs font-medium ml-1" style={{ color: providerColor }}>
            {title}
          </span>
        </div>
        <CopyButton text={code} copyKey={copyKey} label="Copy" />
      </div>
      {/* Terminal body */}
      <pre className="bg-well text-ink-body text-xs font-mono p-4 overflow-x-auto max-h-64 overflow-y-auto">
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
