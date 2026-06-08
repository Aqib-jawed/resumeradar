import { forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 font-semibold',
          'transition-all duration-150 rounded-lg border',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          fullWidth && 'w-full',
          variant === 'primary' && 'bg-accent text-dark border-accent hover:bg-[#d4f54a] active:scale-[0.98]',
          variant === 'secondary' && 'bg-dark3 text-[var(--color-text-primary)] border-[var(--color-border-dark)] hover:bg-dark4 active:scale-[0.98]',
          variant === 'ghost' && 'bg-transparent text-[var(--color-text-secondary)] border-transparent hover:bg-dark3 active:scale-[0.98]',
          variant === 'danger' && 'bg-transparent text-[var(--color-error)] border-[var(--color-error)] hover:bg-[rgba(255,77,77,0.1)] active:scale-[0.98]',
          size === 'sm' && 'px-3 py-1.5 text-sm h-8',
          size === 'md' && 'px-4 py-2 text-sm h-10',
          size === 'lg' && 'px-6 py-3 text-base h-12',
          className,
        )}
        {...props}
      >
        {loading ? (
          <><Spinner size={size === 'lg' ? 18 : 15} />{children}</>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button

function Spinner({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}