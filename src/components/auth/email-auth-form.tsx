import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordStrengthIndicator } from './password-strength'
import { PASSWORD_POLICY } from '@/lib/password-strength'
import { ForgotPasswordLink } from './forgot-password-link'
import { TermsCheckbox } from './terms-checkbox'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

const signupSchema = z
  .object({
    email: z.string().email('Invalid email'),
    password: z
      .string()
      .min(PASSWORD_POLICY.minLength, `Password must be at least ${PASSWORD_POLICY.minLength} characters`)
      .refine((p) => /[a-z]/.test(p), 'Include at least one lowercase letter')
      .refine((p) => /[A-Z]/.test(p), 'Include at least one uppercase letter')
      .refine((p) => /\d/.test(p), 'Include at least one number')
      .refine((p) => /[^a-zA-Z0-9]/.test(p), 'Include at least one special character'),
    confirmPassword: z.string(),
    workspaceName: z.string().optional(),
    rememberMe: z.boolean().optional(),
    agreeToTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>

export interface EmailAuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (data: LoginFormData | SignupFormData) => Promise<void>
  isLoading?: boolean
  className?: string
}

function LoginFormInner({
  onSubmit,
  isLoading,
  className,
}: {
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading: boolean
  className?: string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-4', className)}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@studio.com"
          autoComplete="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={!!errors.password}
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
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={watch('rememberMe')}
            onCheckedChange={(v) => setValue('rememberMe', v === true)}
          />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>
        <ForgotPasswordLink />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}

function SignupFormInner({
  onSubmit,
  isLoading,
  className,
}: {
  onSubmit: (data: SignupFormData) => Promise<void>
  isLoading: boolean
  className?: string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { agreeToTerms: false },
  })

  const password = watch('password')
  const agreeToTerms = watch('agreeToTerms')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-4', className)}
    >
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@studio.com"
          autoComplete="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
            aria-invalid={!!errors.password}
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
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
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
      <div className="space-y-2">
        <Label htmlFor="signup-workspace">Workspace name (optional)</Label>
        <Input
          id="signup-workspace"
          placeholder="My Studio"
          {...register('workspaceName')}
        />
      </div>
      <TermsCheckbox
        checked={agreeToTerms}
        onCheckedChange={(v) => setValue('agreeToTerms', v)}
        error={errors.agreeToTerms?.message}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}

export function EmailAuthForm({
  mode,
  onSubmit,
  isLoading = false,
  className,
}: EmailAuthFormProps) {
  if (mode === 'login') {
    return (
      <LoginFormInner
        onSubmit={onSubmit as (d: LoginFormData) => Promise<void>}
        isLoading={isLoading}
        className={className}
      />
    )
  }
  return (
    <SignupFormInner
      onSubmit={onSubmit as (d: SignupFormData) => Promise<void>}
      isLoading={isLoading}
      className={className}
    />
  )
}
