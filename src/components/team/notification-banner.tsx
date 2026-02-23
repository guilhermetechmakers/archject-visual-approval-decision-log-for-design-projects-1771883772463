import { CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationBannerProps {
  message: string
  variant?: 'success' | 'info' | 'warning'
  onDismiss?: () => void
  className?: string
}

const variantStyles = {
  success: 'bg-success/10 border-success/30 text-foreground',
  info: 'bg-primary/10 border-primary/30 text-foreground',
  warning: 'bg-warning/30 border-warning/50 text-foreground',
}

export function NotificationBanner({
  message,
  variant = 'success',
  onDismiss,
  className,
}: NotificationBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border px-4 py-3',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
