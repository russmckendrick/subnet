import { useClipboard } from '@/hooks/use-clipboard'
import { useThemeStore } from '@/store/theme-store'
import { tokenize, getTokenColor, type Language } from '@/lib/syntax-highlight'
import { motion } from 'motion/react'

interface CodeBlockProps {
  code: string
  language: Language
  copyKey: string
}

export function CodeBlock({ code, language, copyKey }: CodeBlockProps) {
  const { copy, isCopied } = useClipboard()
  const theme = useThemeStore((s) => s.theme)
  const lines = tokenize(code, language)

  return (
    <div className="relative group">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => copy(code, copyKey)}
        className={`absolute top-2 right-2 z-10 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
          isCopied(copyKey)
            ? 'bg-[#859900]/20 text-[#859900]'
            : 'bg-[#eee8d5] dark:bg-[#073642] text-[#93a1a1] dark:text-[#586e75] hover:text-[#586e75] dark:hover:text-[#93a1a1] opacity-0 group-hover:opacity-100'
        }`}
      >
        {isCopied(copyKey) ? 'Copied!' : 'Copy'}
      </motion.button>
      <pre className="bg-[#fdf6e3] dark:bg-[#002b36] text-[#657b83] dark:text-[#839496] text-xs font-mono rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
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
    </div>
  )
}
