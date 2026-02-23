import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/** Password policy - min 12 chars, uppercase, lowercase, number, symbol */
export const PASSWORD_POLICY = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
} as const

/** Password strength: 0-4 (weak to strong) */
export function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= PASSWORD_POLICY.minLength) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

export function getStrengthLabel(strength: number): string {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[strength] ?? ''
}

export function getStrengthColor(strength: number): string {
  if (strength <= 1) return 'bg-destructive'
  if (strength <= 2) return 'bg-warning'
  if (strength <= 3) return 'bg-primary'
  return 'bg-success'
}

export interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

/** Policy hints for password requirements */
export function PasswordPolicyHints({ password }: { password: string }) {
  const checks = [
    {
      met: password.length >= PASSWORD_POLICY.minLength,
      label: `At least ${PASSWORD_POLICY.minLength} characters`,
    },
    { met: /[a-z]/.test(password), label: 'One lowercase letter' },
    { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { met: /\d/.test(password), label: 'One number' },
    { met: /[^a-zA-Z0-9]/.test(password), label: 'One special character' },
  ]
  return (
    <ul
      id="password-strength-hint"
      className="mt-1 space-y-0.5 text-xs text-muted-foreground"
      aria-live="polite"
    >
      {checks.map((c) => (
        <li
          key={c.label}
          className={cn(
            'flex items-center gap-2',
            c.met ? 'text-success' : 'text-muted-foreground'
          )}
        >
          <span
            className={cn(
              'inline-block h-1.5 w-1.5 rounded-full',
              c.met ? 'bg-success' : 'bg-muted-foreground/50'
            )}
          />
          {c.label}
        </li>
      ))}
    </ul>
  )
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password])
  const percent = (strength / 4) * 100

  if (!password) return null

  return (
    <div
      className={cn('space-y-2', className)}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Password strength"
    >
      <div className="space-y-1">
        <Progress value={percent} className="h-1.5" />
        {strength > 0 && (
          <p className="text-xs text-muted-foreground">
            {getStrengthLabel(strength)}
          </p>
        )}
      </div>
      <PasswordPolicyHints password={password} />
    </div>
  )
}
