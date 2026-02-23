import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error'

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const parseAndValidateToken = useCallback(() => {
    const result = parseTokenFromSearchParams(searchParams)
    if (result.isValid && result.token) {
      setToken(result.token)
      return result.token
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

  const handleResend = async () => {
    if (cooldownSeconds > 0 || isResending) return
    setIsResending(true)
    try {
      const res = await authApi.resendVerificationToken({
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
        if (e.status === 429 && typeof e.cooldownSeconds === 'number') {
          setCooldownSeconds(e.cooldownSeconds)
        } else if (e.status === 429) {
          setCooldownSeconds(60)
        }
      } else {
        toast.error('Failed to resend verification email')
      }
    } finally {
      setIsResending(false)
    }
  }

  const statusIconType =
    verificationStatus === 'verifying'
      ? 'verifying'
      : verificationStatus === 'success'
        ? 'success'
        : verificationStatus === 'error'
          ? 'error'
          : 'neutral'

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
        {/* Status card */}
        <div
          className={cn(
            'rounded-2xl border p-6 shadow-card transition-shadow duration-200',
            verificationStatus === 'success' &&
              'border-success/30 bg-success/5 hover:shadow-card-hover',
            verificationStatus === 'error' &&
              'border-destructive/30 bg-destructive/5 hover:shadow-card-hover',
            verificationStatus === 'verifying' &&
              'border-border bg-secondary/30',
            verificationStatus === 'idle' && 'border-border bg-card'
          )}
        >
          <div className="flex items-start gap-4">
            <StatusIcon status={statusIconType} size="lg" />
            <div className="flex-1 min-w-0">
              {verificationStatus === 'verifying' && (
                <>
                  <h2 className="text-lg font-semibold text-foreground">
                    Verifying your email…
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please wait while we confirm your email address.
                  </p>
                </>
              )}
              {verificationStatus === 'success' && (
                <>
                  <h2 className="text-lg font-semibold text-foreground">
                    Your email is verified.
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You now have access to all workspace features. Create
                    decisions, share client links, and export audit records.
                  </p>
                </>
              )}
              {verificationStatus === 'error' && (
                <>
                  <h2 className="text-lg font-semibold text-foreground">
                    Verification link is invalid or expired.
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {errorMessage}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="space-y-4">
          {verificationStatus === 'success' && (
            <DashboardCTA verified={true} className="animate-fade-in" />
          )}

          {verificationStatus === 'error' && (
            <>
              <ResendVerificationControl
                onResend={handleResend}
                isResending={isResending}
                cooldownSeconds={cooldownSeconds}
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
            </>
          )}
        </div>

        {/* Security notes */}
        <TokenExpiryHint tokenLifetimeHours={24} />
      </div>
    </AuthContainer>
  )
}
