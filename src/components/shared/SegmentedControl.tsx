import type { ReactNode } from 'react'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
  title?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'xs' | 'sm'
  ariaLabel: string
  /** tablist for view/tab switching, radiogroup for mutually-exclusive settings. */
  role?: 'radiogroup' | 'tablist'
  className?: string
}

const sizeClasses = {
  xs: 'text-[11px] px-2 py-0.5 gap-1',
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
} as const

/** Pill-style segmented switch used for mode toggles, provider pickers, and tab bars. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  ariaLabel,
  role = 'radiogroup',
  className = '',
}: SegmentedControlProps<T>) {
  const itemRole = role === 'tablist' ? 'tab' : 'radio'

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-0.5 rounded-lg bg-well border border-line/20 p-0.5 ${className}`}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            type="button"
            key={option.value}
            role={itemRole}
            {...(itemRole === 'tab' ? { 'aria-selected': selected } : { 'aria-checked': selected })}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer ${sizeClasses[size]} ${
              selected
                ? 'bg-sol-cyan/10 text-sol-cyan'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
