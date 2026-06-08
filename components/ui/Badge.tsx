import { clsx } from 'clsx'

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono',
      variant === 'default' && 'bg-dark3 text-[var(--color-text-secondary)] border border-[var(--color-border-dark)]',
      variant === 'accent'  && 'bg-[var(--color-accent-dim)] text-accent border border-[var(--color-accent-border)]',
      variant === 'success' && 'bg-[rgba(34,197,94,0.1)] text-[var(--color-success)] border border-[rgba(34,197,94,0.2)]',
      variant === 'warning' && 'bg-[rgba(245,158,11,0.1)] text-[var(--color-warning)] border border-[rgba(245,158,11,0.2)]',
      variant === 'error'   && 'bg-[rgba(255,77,77,0.1)] text-[var(--color-error)] border border-[rgba(255,77,77,0.2)]',
      variant === 'muted'   && 'bg-dark4 text-[var(--color-text-muted)] border border-transparent',
      className,
    )}>
      {children}
    </span>
  )
}