import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  PASSWORD_POLICY,
  getPasswordStrength,
  getStrengthLabel,
} from '@/lib/password-strength'

export interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

/** Policy hints for password requirements */
function PasswordPolicyHints({ password }: { password: string }) {
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
