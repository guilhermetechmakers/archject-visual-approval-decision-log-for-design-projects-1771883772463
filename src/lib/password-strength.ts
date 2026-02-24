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
