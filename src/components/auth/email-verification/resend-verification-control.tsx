import { Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ResendVerificationControlProps {
  onResend: () => void
  isResending: boolean
  cooldownSeconds: number
  disabled?: boolean
  className?: string
  /** When "submit", button submits parent form; use when inside a form with validation */
  buttonType?: 'button' | 'submit'
}

/**
 * Handles resend verification API call, enforces cooldown, displays countdown.
 */
export function ResendVerificationControl({
  onResend,
  isResending,
  cooldownSeconds,
  disabled = false,
  className,
  buttonType = 'button',
}: ResendVerificationControlProps) {
  const isDisabled = disabled || isResending || cooldownSeconds > 0

  return (
    <Button
      type={buttonType}
      onClick={buttonType === 'button' ? onResend : undefined}
      disabled={isDisabled}
      className={cn(
        'w-full rounded-pill bg-primary text-primary-foreground hover:bg-primary/90',
        'transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100',
        className
      )}
      aria-label={
        cooldownSeconds > 0
          ? `Resend verification email in ${cooldownSeconds} seconds`
          : 'Resend verification email'
      }
    >
      {isResending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : cooldownSeconds > 0 ? (
        <>Resend in {cooldownSeconds}s</>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Resend verification email
        </>
      )}
    </Button>
  )
}
