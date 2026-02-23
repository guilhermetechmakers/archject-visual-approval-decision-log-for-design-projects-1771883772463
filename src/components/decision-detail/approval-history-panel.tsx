import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { DecisionApproval } from '@/types/decision-detail'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const actionConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string; className: string }
> = {
  approved: {
    icon: CheckCircle2,
    label: 'Approved',
    className: 'text-success',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    className: 'text-destructive',
  },
  updated: {
    icon: RefreshCw,
    label: 'Updated',
    className: 'text-muted-foreground',
  },
}

export interface ApprovalHistoryPanelProps {
  approvals: DecisionApproval[]
  className?: string
}

export function ApprovalHistoryPanel({
  approvals,
  className,
}: ApprovalHistoryPanelProps) {
  const sorted = [...approvals].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <h3 className="text-lg font-semibold">Approval history</h3>
        <p className="text-sm text-muted-foreground">
          Time-stamped actions with actor and role
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
              <RefreshCw className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No approval actions yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((approval) => {
                const config =
                  actionConfig[approval.action] ?? actionConfig.updated
                const Icon = config.icon
                return (
                  <div
                    key={approval.id}
                    className="flex gap-3 rounded-lg border border-border bg-secondary/20 p-3"
                  >
                    <Icon
                      className={cn('h-5 w-5 shrink-0', config.className)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">
                          {approval.actorName ?? approval.actorId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {approval.role}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            config.className
                          )}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(approval.timestamp)}
                      </p>
                      {approval.ipAddress && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          IP: {approval.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
