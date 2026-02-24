import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthContainer } from '@/components/auth'
import {
  StatusIcon,
  TokenExpiryHint,
  ResendVerificationControl,
  DashboardCTA,
  SupportLink,
} from '@/components/auth/email-verification'
import { parseTokenFromSearchParams } from '@/lib/verification-token-parser'
import { authApi, isApiError } from '@/api/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error' | 'pending'

const resendEmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

type ResendEmailFormData = z.infer<typeof resendEmailSchema>

const STATUS_HEADINGS: Record<VerificationStatus, string> = {
  idle: 'Email verification',
  verifying: 'Verifying your email',
  success: 'Your email is verified',
  error: 'Verification link is invalid or expired',
  pending: 'Check your email',
}

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const emailFromState = (location.state as { email?: string } | null)?.email ?? null
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendEmailFormData>({
    resolver: zodResolver(resendEmailSchema),
    defaultValues: { email: '' },
  })

  const parseAndValidateToken = useCallback(() => {
    const result = parseTokenFromSearchParams(searchParams)
    if (result.isValid && result.token) {
      setToken(result.token)
      return result.token
    }
    if (result.error === 'Token is required' || !searchParams.get('token')) {
      setVerificationStatus('pending')
      return null
    }
    setVerificationStatus('error')
    setErrorMessage(result.error ?? 'Verification link is invalid or expired.')
    return null
  }, [searchParams])

  const verifyToken = useCallback(
    async (t: string) => {
      setVerificationStatus('verifying')
      setErrorMessage(null)
      try {
        const res = await authApi.verifyToken({ token: t })
        if (res.success && res.verified) {
          setVerificationStatus('success')
          toast.success(res.message ?? 'Your email is verified.')
        } else {
          setVerificationStatus('error')
          setErrorMessage(
            res.message ?? 'Verification link is invalid or expired.'
          )
        }
      } catch (e) {
        setVerificationStatus('error')
        if (isApiError(e)) {
          setErrorMessage(e.message ?? 'Verification failed.')
        } else {
          setErrorMessage('Verification link is invalid or expired.')
        }
        toast.error('Verification failed')
      }
    },
    []
  )

  useEffect(() => {
    const t = parseAndValidateToken()
    if (t) {
      verifyToken(t)
    }
  }, [parseAndValidateToken, verifyToken])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds((c) => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const handleResend = async (data?: ResendEmailFormData) => {
    if (cooldownSeconds > 0 || isResending) return
    const emailToUse = data?.email?.trim() || emailFromState
    if (!emailFromState && !emailToUse) {
      return
    }
    setIsResending(true)
    try {
      const res = await authApi.resendVerificationToken({
        email: emailToUse || undefined,
        token: token ?? undefined,
      })
      if (res.success) {
        toast.success(res.message ?? 'A new verification email has been sent.')
        setCooldownSeconds(res.cooldownSeconds ?? 60)
      } else {
        toast.error(res.message ?? 'Failed to resend verification email.')
        setCooldownSeconds(res.cooldownSeconds ?? 60)
      }
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Failed to resend')
        if (typeof e.cooldownSeconds === 'number') {
          setCooldownSeconds(e.cooldownSeconds)
        } else if (e.status === 429) {
          setCooldownSeconds(900)
        }
      } else {
        toast.error('Failed to resend verification email')
      }
    } finally {
      setIsResending(false)
    }
  }

  const onResendSubmit = handleSubmit((data) => handleResend(data))

  const statusIconType =
    verificationStatus === 'verifying'
      ? 'verifying'
      : verificationStatus === 'success'
        ? 'success'
        : verificationStatus === 'error'
          ? 'error'
          : verificationStatus === 'pending'
            ? 'neutral'
            : 'neutral'

  const statusHeading = STATUS_HEADINGS[verificationStatus]

  return (
    <AuthContainer
      title="Email verification"
      description="Confirm your email address to unlock full workspace features."
    >
      <div
        className="space-y-6 animate-fade-in"
        role="status"
        aria-live="polite"
        aria-label={
          verificationStatus === 'verifying'
            ? 'Verifying your email'
            : verificationStatus === 'success'
              ? 'Email verified successfully'
              : verificationStatus === 'error'
                ? 'Verification failed'
                : 'Email verification'
        }
      >
        {/* Status card - uses design tokens (border, bg, shadow) */}
        <Card
          className={cn(
            'rounded-2xl border shadow-card transition-all duration-200',
            verificationStatus === 'success' &&
              'border-success/30 bg-success/5 hover:shadow-card-hover',
            verificationStatus === 'error' &&
              'border-destructive/30 bg-destructive/5 hover:shadow-card-hover',
            verificationStatus === 'verifying' &&
              'border-border bg-secondary/30',
            (verificationStatus === 'idle' || verificationStatus === 'pending') &&
              'border-border bg-card'
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <StatusIcon status={statusIconType} size="lg" />
              <div className="flex-1 min-w-0">
                {verificationStatus === 'verifying' ? (
                  <>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="mt-2 h-4 w-full max-w-sm" />
                    <Skeleton className="mt-1 h-4 w-3/4 max-w-xs" />
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-foreground">
                      {statusHeading}
                    </h2>
                    {verificationStatus === 'success' && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        You now have access to all workspace features. Create
                        decisions, share client links, and export audit records.
                      </p>
                    )}
                    {verificationStatus === 'error' && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {errorMessage}
                      </p>
                    )}
                    {verificationStatus === 'pending' && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {emailFromState
                          ? `We've sent a verification link to ${emailFromState}. Click the link to verify your account and unlock full workspace features.`
                          : "We've sent a verification link to your email. Click the link to verify your account. If you didn't receive it, enter your email below to resend."}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <div className="space-y-4">
          {verificationStatus === 'success' && (
            <DashboardCTA verified={true} className="animate-fade-in" />
          )}

          {(verificationStatus === 'pending' || verificationStatus === 'error') && (
            <>
              {emailFromState ? (
                <div className="space-y-4">
                  <ResendVerificationControl
                    onResend={() => handleResend()}
                    isResending={isResending}
                    cooldownSeconds={cooldownSeconds}
                    buttonType="button"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <SupportLink />
                    <Link
                      to="/auth/login"
                      className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      Back to login
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={onResendSubmit} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="resend-email">
                      Email address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="resend-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={cn(
                        'rounded-lg bg-input border-border',
                        errors.email && 'border-destructive focus-visible:ring-destructive'
                      )}
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'resend-email-error' : undefined}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p
                        id="resend-email-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <ResendVerificationControl
                    onResend={() => {}}
                    isResending={isResending}
                    cooldownSeconds={cooldownSeconds}
                    buttonType="submit"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <SupportLink />
                    <Link
                      to="/auth/login"
                      className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      Back to login
                    </Link>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Security notes */}
        <TokenExpiryHint tokenLifetimeHours={24} />
      </div>
    </AuthContainer>
  )
}
