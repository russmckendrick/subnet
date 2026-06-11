import { useThemeStore } from '@/store/theme-store'
import { tokenize, getTokenColor, type Language } from '@/lib/syntax-highlight'
import { CopyButton } from '@/components/shared/CopyButton'

interface CodeBlockProps {
  code: string
  language: Language
  copyKey: string
}

export function CodeBlock({ code, language, copyKey }: CodeBlockProps) {
  const theme = useThemeStore((s) => s.theme)
  const lines = tokenize(code, language)

  return (
    <div className="relative group">
      <CopyButton
        text={code}
        copyKey={copyKey}
        label="Copy"
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      />
      <pre className="bg-well text-ink-body text-xs font-mono rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
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
