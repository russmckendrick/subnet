import type { ReactNode } from 'react'
import { CopyButton } from './CopyButton'

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

/**
 * The uppercase micro-label used above values and section groups.
 * Solarized base01 reads as emphasized in light mode and secondary in
 * dark mode, so it is intentionally mode-invariant.
 */
export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <div className={`text-[10px] text-sol-base01 uppercase tracking-wider font-medium ${className}`}>
      {children}
    </div>
  )
}

interface LabelValueProps {
  label: ReactNode
  children: ReactNode
  mono?: boolean
  /** When set (with copyKey), renders a copy button beside the value. */
  copyText?: string
  copyKey?: string
  className?: string
  valueClassName?: string
}

/** Label-over-value pair — the repeated data-display pattern. */
export function LabelValue({
  label,
  children,
  mono = true,
  copyText,
  copyKey,
  className = '',
  valueClassName = '',
}: LabelValueProps) {
  return (
    <div className={className}>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span
          className={`text-sm font-semibold text-ink-body break-all ${mono ? 'font-mono' : ''} ${valueClassName}`}
        >
          {children}
        </span>
        {copyText !== undefined && copyKey !== undefined && (
          <CopyButton text={copyText} copyKey={copyKey} />
        )}
      </div>
    </div>
  )
}
