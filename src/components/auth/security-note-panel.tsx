import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SecurityNotePanelProps {
  /** Token lifetime in minutes (e.g. 60) */
  tokenLifetimeMinutes?: number
  /** Support contact info */
  supportContact?: string
  className?: string
}

/**
 * Security note panel with token lifetime, support contact,
 * and advice against reusing tokens.
 */
export function SecurityNotePanel({
  tokenLifetimeMinutes = 60,
  supportContact = 'support@archject.com',
  className,
}: SecurityNotePanelProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border border-border bg-secondary/30 p-4',
        className
      )}
    >
      <Shield
        className="h-5 w-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          Reset links expire in {tokenLifetimeMinutes} minutes and can only be
          used once. Do not share or reuse links.
        </p>
        <p>
          Need help? Contact{' '}
          <a
            href={`mailto:${supportContact}`}
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            {supportContact}
          </a>
        </p>
      </div>
    </div>
  )
}
