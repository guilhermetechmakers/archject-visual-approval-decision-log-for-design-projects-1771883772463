import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthContainer } from '@/components/auth'
import { PasswordStrengthIndicator } from '@/components/auth'
import { authApi, isApiError } from '@/api/auth'
import { toast } from 'sonner'

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (p) => /\d/.test(p) || /[^a-zA-Z0-9]/.test(p),
        'Include a number or special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordWithTokenPage() {
  const { token } = useParams<{ token: string }>()
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('newPassword')

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Invalid reset link')
      return
    }
    try {
      await authApi.resetPassword({
        token,
        newPassword: data.newPassword,
      })
      setSuccess(true)
      toast.success('Password reset successfully')
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Failed to reset password')
      } else {
        toast.error('Failed to reset password')
      }
    }
  }

  if (success) {
    return (
      <AuthContainer
        title="Password reset"
        description="Your password has been updated successfully."
      >
        <div className="space-y-6 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            You can now sign in with your new password.
          </p>
          <Link to="/auth/login">
            <Button className="w-full">Sign in</Button>
          </Link>
        </div>
      </AuthContainer>
    )
  }

  if (!token) {
    return (
      <AuthContainer
        title="Invalid link"
        description="This password reset link is invalid or has expired."
      >
        <Link to="/auth/password-reset">
          <Button className="w-full">Request new link</Button>
        </Link>
      </AuthContainer>
    )
  }

  return (
    <AuthContainer
      title="Set new password"
      description="Enter your new password below"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
          <KeyRound className="h-6 w-6 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Choose a strong password with at least 8 characters, including a
            number or special character.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('newPassword')}
              aria-invalid={!!errors.newPassword}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            <p className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Reset password
        </Button>
        <p className="text-center">
          <Link
            to="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to login
          </Link>
        </p>
      </form>
    </AuthContainer>
  )
}
