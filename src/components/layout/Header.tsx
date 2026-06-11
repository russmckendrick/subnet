import { useMemo } from 'react'
import { useCalculatorStore } from '@/store/calculator-store'
import { Button } from '@/components/shared/Button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { HeaderBar } from './HeaderBar'

export function Header() {
  const { setActiveDrawer, setCommandPaletteOpen, rawInput, result, splits } = useCalculatorStore()

  const designerHref = useMemo(() => {
    if (!result || !rawInput) return '/designer'
    const params: string[] = [`from=${encodeURIComponent(rawInput)}`]
    if (splits.length > 0) {
      params.push(`split=${splits.map((s) => `${s.prefixLength}~${encodeURIComponent(s.label)}`).join(',')}`)
    }
    return `/designer?${params.join('&')}`
  }, [rawInput, result, splits])

  return (
    <HeaderBar
      title={
        <h1 className="text-base sm:text-lg font-bold text-ink tracking-tight whitespace-nowrap truncate">
          subnet<span className="text-sol-cyan">.fit</span>
        </h1>
      }
      subtitle="CIDR Calculator & Network Planner"
      actions={
        <>
          <Button
            href={designerHref}
            aria-label="Open Network Designer"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M12 8.25v7.5m3.75-3.75H8.25" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Designer</span>
          </Button>

          <Button
            onClick={() => setActiveDrawer('reference')}
            aria-label="Open CIDR Reference"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Reference</span>
          </Button>

          <Button
            onClick={() => setActiveDrawer('supernet')}
            aria-label="Open Supernet Tool"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Supernet</span>
          </Button>

          {/* Command palette trigger (mobile) */}
          <span className="sm:hidden">
            <Button
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Open command palette"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              }
            />
          </span>

          {/* Keyboard hints (desktop) */}
          <span className="hidden sm:inline-flex">
            <Button onClick={() => setCommandPaletteOpen(true)} aria-label="Open command palette">
              <kbd className="font-mono text-[10px] bg-well px-1.5 py-0.5 rounded border border-line/20">/</kbd>
              <span>commands</span>
              <kbd className="font-mono text-[10px] bg-well px-1.5 py-0.5 rounded border border-line/20 ml-1">&#8593;&#8595;</kbd>
              <span>prefix</span>
            </Button>
          </span>

          <ThemeToggle />
        </>
      }
    />
  )
}
