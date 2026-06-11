import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'soft' | 'primary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'xs' | 'sm' | 'md'

const base =
  'inline-flex items-center justify-center rounded-lg font-medium border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'text-[11px] px-2 py-1 gap-1',
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-xs px-4 py-2.5 gap-2',
}

const variantClasses: Record<ButtonVariant, string> = {
  soft: 'border-transparent bg-surface text-ink hover:bg-surface/80',
  primary: 'border-transparent bg-sol-cyan text-sol-base3 hover:bg-sol-cyan/80',
  ghost: 'border-transparent text-ink-muted hover:text-ink hover:bg-surface/60',
  danger: 'border-transparent bg-surface text-sol-red hover:bg-sol-red/10',
  outline: 'bg-well text-ink border-line/20 hover:border-sol-cyan/30 hover:text-sol-cyan',
}

const activeClasses = 'bg-sol-cyan/10 text-sol-cyan border-sol-cyan/20'

interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Cyan-tinted pressed/selected state, overrides the variant colors. */
  active?: boolean
  icon?: ReactNode
  className?: string
  children?: ReactNode
}

type ButtonAsButton = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined }
type ButtonAsLink = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

/** The app's one button. Renders an <a> when `href` is given. */
export function Button({
  variant = 'soft',
  size = 'sm',
  active = false,
  icon,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = `${base} ${sizeClasses[size]} ${active ? activeClasses : variantClasses[variant]} ${className}`

  if (rest.href !== undefined) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a className={classes} {...anchorProps}>
        {icon}
        {children}
      </a>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type="button" className={classes} {...buttonProps}>
      {icon}
      {children}
    </button>
  )
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  'aria-label': string
  size?: 'sm' | 'md'
  variant?: 'soft' | 'ghost' | 'danger'
  children: ReactNode
}

const iconSizeClasses = { sm: 'p-1.5', md: 'p-2' } as const

const iconVariantClasses = {
  soft: 'bg-surface text-ink hover:bg-surface/80',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface',
  danger: 'text-ink-muted hover:text-sol-red hover:bg-sol-red/10',
} as const

/** Square icon-only button — aria-label is required. */
export function IconButton({
  size = 'md',
  variant = 'soft',
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${iconSizeClasses[size]} ${iconVariantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
