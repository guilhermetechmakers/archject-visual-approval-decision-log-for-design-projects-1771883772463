import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SuccessStateCardProps {
  /** Main success message */
  message: string
  /** Optional secondary/helper text */
  helperText?: string
  /** Primary CTA label */
  primaryActionLabel: string
  /** Primary CTA route */
  primaryActionTo: string
  /** Optional secondary CTA */
  secondaryAction?: {
    label: string
    to: string
  }
  /** Optional resend action (e.g. "Resend email") - shows rate limit note */
  resendAction?: {
    label: string
    onClick: () => void
    isRateLimited?: boolean
  }
  className?: string
}

/**
 * Success confirmation card for password reset flows.
 * Shows confirmation message, link to Login, optional Sign Up, and resend.
 */
export function SuccessStateCard({
  message,
  helperText,
  primaryActionLabel,
  primaryActionTo,
  secondaryAction,
  resendAction,
  className,
}: SuccessStateCardProps) {
  return (
    <div
      className={cn('space-y-6 animate-fade-in', className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
        <CheckCircle
          className="h-8 w-8 shrink-0 text-success"
          aria-hidden
        />
        <div>
          <p className="font-medium text-foreground">{message}</p>
          {helperText && (
            <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Link to={primaryActionTo}>
          <Button className="w-full">{primaryActionLabel}</Button>
        </Link>
        {secondaryAction && (
          <Link to={secondaryAction.to} className="block">
            <Button variant="outline" className="w-full">
              {secondaryAction.label}
            </Button>
          </Link>
        )}
        {resendAction && (
          <div className="pt-2">
            <button
              type="button"
              onClick={resendAction.onClick}
              disabled={resendAction.isRateLimited}
              className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              {resendAction.label}
            </button>
            {resendAction.isRateLimited && (
              <p className="mt-1 text-xs text-muted-foreground">
                Please wait a few minutes before requesting another email.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
