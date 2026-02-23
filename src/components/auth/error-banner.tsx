import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ErrorBannerProps {
  /** Error message to display */
  message: string
  /** Optional title */
  title?: string
  /** Optional action (e.g. retry button) */
  action?: React.ReactNode
  className?: string
}

/**
 * Reusable error banner for global or page-level errors.
 * Use for token invalid/expired, server errors, etc.
 */
export function ErrorBanner({
  message,
  title = 'Something went wrong',
  action,
  className,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 shrink-0 text-destructive"
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {action && <div className="pl-8">{action}</div>}
    </div>
  )
}
