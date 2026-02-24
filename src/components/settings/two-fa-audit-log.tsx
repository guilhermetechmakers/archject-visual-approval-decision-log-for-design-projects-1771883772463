/**
 * 2FA audit log - recent 2FA events
 */

import { useTwoFAAuditLogs } from '@/hooks/use-two-fa'
import { Skeleton } from '@/components/ui/skeleton'

const ACTION_LABELS: Record<string, string> = {
  '2fa_enrolled': 'Enrolled',
  '2fa_disabled': 'Disabled',
  '2fa_recovery_codes_regenerated': 'Recovery codes regenerated',
}

export function TwoFAAuditLog() {
  const { data, isLoading } = useTwoFAAuditLogs()
  const logs = data?.logs ?? []

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Recent 2FA activity</p>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {logs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="font-medium">{ACTION_LABELS[log.action] ?? log.action}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-sm text-muted-foreground">No 2FA activity yet</p>
          )}
        </div>
      )}
    </div>
  )
}
