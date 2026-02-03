import { useEffect, useCallback, type RefObject } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'

export function useKeyboardShortcuts(inputRef: RefObject<HTMLInputElement | null>) {
  const { rawInput, setRawInput } = useCalculatorStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // "/" focuses the input (unless already typing in an input)
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
        return
      }

      // Only handle arrow keys when input is focused
      if (document.activeElement !== inputRef.current) return

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const slashIndex = rawInput.lastIndexOf('/')
        if (slashIndex === -1) return

        const ipPart = rawInput.slice(0, slashIndex)
        const currentPrefix = parseInt(rawInput.slice(slashIndex + 1), 10)
        if (isNaN(currentPrefix)) return

        const newPrefix =
          e.key === 'ArrowUp'
            ? Math.min(32, currentPrefix + 1)
            : Math.max(0, currentPrefix - 1)

        setRawInput(`${ipPart}/${newPrefix}`)
      }

      // Escape clears and blurs
      if (e.key === 'Escape') {
        inputRef.current?.blur()
      }
    },
    [rawInput, setRawInput, inputRef],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
