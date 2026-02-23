import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authApi, isApiError } from '@/api/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface EmailVerificationBannerProps {
  email: string
  verified?: boolean
  className?: string
}

export function EmailVerificationBanner({
  email,
  verified = false,
  className,
}: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)
    try {
      await authApi.resendVerification({ email })
      toast.success('Verification email sent')
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Failed to resend')
      } else {
        toast.error('Failed to resend verification email')
      }
    } finally {
      setIsResending(false)
    }
  }

  if (verified) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-secondary/50 p-4 animate-fade-in',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Verify your email address
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            We&apos;ve sent a verification link to <strong>{email}</strong>. Click
            the link to unlock full workspace features.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-8 px-3"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
          >
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              'Resend verification email'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
