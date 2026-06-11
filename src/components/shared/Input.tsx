import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

/** The single focus/border treatment for all form fields. */
const fieldBase =
  'w-full rounded-lg bg-well text-ink border transition-colors placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-sol-cyan/15 focus:border-sol-cyan/40'

function fieldClasses(invalid: boolean, mono: boolean, extra: string) {
  return `${fieldBase} ${invalid ? 'border-sol-red/50' : 'border-line/25'} ${mono ? 'font-mono' : ''} ${extra}`
}

interface FieldProps {
  invalid?: boolean
  mono?: boolean
}

type InputProps = FieldProps & InputHTMLAttributes<HTMLInputElement>

export function Input({ invalid = false, mono = false, className = '', ...rest }: InputProps) {
  return <input className={fieldClasses(invalid, mono, `text-sm px-3 py-2 ${className}`)} {...rest} />
}

type TextareaProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ invalid = false, mono = false, className = '', ...rest }: TextareaProps) {
  return (
    <textarea
      className={fieldClasses(invalid, mono, `text-sm px-3 py-2 resize-y ${className}`)}
      {...rest}
    />
  )
}

type SelectProps = FieldProps & SelectHTMLAttributes<HTMLSelectElement>

export function Select({ invalid = false, mono = false, className = '', children, ...rest }: SelectProps) {
  return (
    <div className="relative inline-flex w-full">
      <select
        className={fieldClasses(invalid, mono, `text-sm px-3 py-2 pr-8 appearance-none cursor-pointer ${className}`)}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
