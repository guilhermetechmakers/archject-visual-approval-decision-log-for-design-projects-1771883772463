/**
 * SecurityEventsPanel - Token/revocation audit trail and security events.
 * Shows recent token revocations, force logouts, and related security actions.
 */

import * as React from 'react'
import { Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminAuditLogs } from '@/hooks/use-admin'
import type { AdminAuditLog } from '@/types/admin'
import { cn } from '@/lib/utils'

const SECURITY_ACTIONS = ['token_revoke', 'force_logout', 'user_suspend', 'user_activate', 'session_revoke']

const ACTION_LABELS: Record<string, string> = {
  token_revoke: 'Token revoked',
  force_logout: 'Force sign-out',
  user_suspend: 'User suspended',
  user_activate: 'User activated',
  session_revoke: 'Session revoked',
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}

interface SecurityEventsPanelProps {
  className?: string
  defaultExpanded?: boolean
  maxItems?: number
}

export function SecurityEventsPanel({
  className,
  defaultExpanded = false,
  maxItems = 10,
}: SecurityEventsPanelProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const { data: logs, isLoading } = useAdminAuditLogs({ limit: 50 })

  const securityLogs = React.useMemo(() => {
    if (!logs) return []
    return logs
      .filter((l) => SECURITY_ACTIONS.includes(l.action) || SECURITY_ACTIONS.includes(l.action_type ?? ''))
      .slice(0, maxItems)
  }, [logs, maxItems])

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader
        className="cursor-pointer select-none py-4 transition-colors hover:bg-muted/50"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-primary" />
            Security Events
          </CardTitle>
          <Button variant="ghost" size="icon-sm" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 border-t border-border pt-4">
          <ScrollArea className="h-[200px] rounded-lg border border-border">
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
              </div>
            ) : securityLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No security events</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {securityLogs.map((log: AdminAuditLog) => (
                  <SecurityEventItem key={log.id} log={log} />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}

function SecurityEventItem({ log }: { log: AdminAuditLog }) {
  const actionKey = log.action_type ?? log.action
  const label = ACTION_LABELS[actionKey] ?? log.action
  const isRevoke = actionKey.includes('revoke') || actionKey.includes('logout') || actionKey.includes('suspend')

  return (
    <div className="flex flex-col gap-1 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className={cn('font-medium', isRevoke && 'text-destructive')}>{label}</span>
        <span className="text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
      </div>
      <div className="text-muted-foreground">
        {log.target_type} · {log.target_id}
        {log.payload?.sessions_revoked != null && (
          <span> · {String(log.payload.sessions_revoked)} session(s) revoked</span>
        )}
      </div>
    </div>
  )
}
