import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from './password-strength'
import { ErrorBanner } from './error-banner'
import { SecurityNotePanel } from './security-note-panel'
import { PASSWORD_POLICY } from './password-strength'
import { cn } from '@/lib/utils'

const schema = z
  .object({
    newPassword: z
      .string()
      .min(PASSWORD_POLICY.minLength, `Password must be at least ${PASSWORD_POLICY.minLength} characters`)
      .refine((p) => /[a-z]/.test(p), 'Include at least one lowercase letter')
      .refine((p) => /[A-Z]/.test(p), 'Include at least one uppercase letter')
      .refine((p) => /\d/.test(p), 'Include at least one number')
      .refine((p) => /[^a-zA-Z0-9]/.test(p), 'Include at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type PasswordResetFormData = z.infer<typeof schema>

export interface PasswordResetFormCardProps {
  /** Token from URL - required for form to be shown; parent uses it for API call */
  token: string
  onSubmit: (data: PasswordResetFormData) => Promise<void>
  isLoading?: boolean
  /** Error to display (e.g. invalid/expired token) */
  error?: string
  /** Token verification status - if invalid/expired, show error state */
  tokenValid?: boolean
  className?: string
}

/**
 * Token-aware reset form: new password, confirm password,
 * strength meter, policy hints, real-time validation.
 */
export function PasswordResetFormCard({
  token: _token,
  onSubmit,
  isLoading = false,
  error,
  tokenValid = true,
  className,
}: PasswordResetFormCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('newPassword')
  const { ref: registerRef, ...newPasswordRest } = register('newPassword')

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  if (!tokenValid || error) {
    return (
      <div className={cn('space-y-6', className)}>
        <ErrorBanner
          message={
            error ??
            'This password reset link is invalid or has expired. Please request a new one.'
          }
          title="Invalid or expired link"
          action={
            <Link
              to="/auth/password-reset"
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Request new reset link
            </Link>
          }
        />
        <SecurityNotePanel />
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
      noValidate
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <KeyRound
          className="h-6 w-6 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">
          Choose a strong password: at least {PASSWORD_POLICY.minLength}{' '}
          characters with uppercase, lowercase, numbers, and symbols.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Input
            ref={(el) => {
              firstInputRef.current = el
              registerRef(el)
            }}
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            {...newPasswordRest}
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? 'new-password-error' : undefined}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <PasswordStrengthIndicator password={password ?? ''} />
        {errors.newPassword && (
          <p
            id="new-password-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? 'confirm-password-error' : undefined
          }
        />
        {errors.confirmPassword && (
          <p
            id="confirm-password-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Reset password'}
      </Button>

      <SecurityNotePanel />
    </form>
  )
}
