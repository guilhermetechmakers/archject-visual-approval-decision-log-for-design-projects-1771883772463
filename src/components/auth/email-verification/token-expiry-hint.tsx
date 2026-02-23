import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TokenExpiryHintProps {
  /** Token lifetime in hours (e.g. 24) */
  tokenLifetimeHours?: number
  /** Whether token is close to expiry (show warning) */
  isNearExpiry?: boolean
  /** Optional expiry timestamp for countdown */
  expiresAt?: string
  className?: string
}

/**
 * Displays token expiry information and warnings.
 */
export function TokenExpiryHint({
  tokenLifetimeHours = 24,
  isNearExpiry = false,
  className,
}: TokenExpiryHintProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4',
        isNearExpiry
          ? 'border-warning/50 bg-warning/10'
          : 'border-border bg-secondary/30',
        className
      )}
    >
      <Clock
        className="h-5 w-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          Verification links expire after {tokenLifetimeHours} hours. If you
          didn&apos;t request this, contact Support.
        </p>
      </div>
    </div>
  )
}
