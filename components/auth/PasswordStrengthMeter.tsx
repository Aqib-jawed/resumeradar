import { useMemo } from 'react'

interface Props { password: string }

function getStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length === 0) return 0
  let score = 0
  if (password.length >= 8)         score++
  if (/[A-Z]/.test(password))       score++
  if (/[0-9]/.test(password))       score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return 1
  if (score === 2) return 2
  return 3
}

const config = {
  0: { label: '',         color: 'bg-dark4',                  width: 'w-0'    },
  1: { label: 'Weak',     color: 'bg-[var(--color-error)]',   width: 'w-1/4'  },
  2: { label: 'Fair',     color: 'bg-[var(--color-warning)]', width: 'w-2/4'  },
  3: { label: 'Strong',   color: 'bg-accent',                 width: 'w-full' },
}

export default function PasswordStrengthMeter({ password }: Props) {
  const strength = useMemo(() => getStrength(password), [password])
  const cfg      = config[strength]

  if (!password) return null

  return (
    <div className="space-y-1.5 mt-1">
      {/* Track */}
      <div className="h-1 w-full bg-dark4 rounded-pill overflow-hidden">
        <div
          className={`h-full rounded-pill transition-all duration-300 ${cfg.color} ${cfg.width}`}
        />
      </div>
      {/* Label */}
      {cfg.label && (
        <p className={`text-xs font-mono ${
          strength === 1 ? 'text-[var(--color-error)]'   :
          strength === 2 ? 'text-[var(--color-warning)]' :
          'text-accent'
        }`}>
          {cfg.label} password
          {strength < 3 && (
            <span className="text-[var(--color-text-muted)] ml-1">
              — add {strength === 1 ? 'uppercase letters, numbers & symbols' : 'a symbol'}
            </span>
          )}
        </p>
      )}
    </div>
  )
}