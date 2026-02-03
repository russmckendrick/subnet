import { useState, useCallback } from 'react'

export function useClipboard(timeout = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = useCallback(
    async (text: string, key?: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopiedKey(key ?? text)
        setTimeout(() => setCopiedKey(null), timeout)
        return true
      } catch {
        return false
      }
    },
    [timeout],
  )

  const isCopied = useCallback(
    (key: string) => copiedKey === key,
    [copiedKey],
  )

  return { copy, isCopied }
}
