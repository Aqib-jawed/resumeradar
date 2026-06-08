import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-dark-2)]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full h-11 px-3.5 rounded-lg text-sm',
              'bg-white border text-[var(--color-text-dark)]',
              'placeholder:text-[var(--color-text-muted)]',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              leftIcon && 'pl-10',
              error
                ? 'border-[var(--color-error)] focus:ring-[rgba(255,77,77,0.2)]'
                : 'border-[var(--color-border-light)] focus:border-dark focus:ring-[rgba(0,0,0,0.08)]',
              className,
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-error)] flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
export default Input