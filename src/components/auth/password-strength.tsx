import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/** Password strength: 0-4 (weak to strong) */
export function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
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

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password])
  const percent = (strength / 4) * 100

  if (!password) return null

  return (
    <div className={cn('space-y-1', className)} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength">
      <Progress value={percent} className="h-1.5" />
      {strength > 0 && (
        <p className="text-xs text-muted-foreground">
          {getStrengthLabel(strength)}
        </p>
      )}
    </div>
  )
}
