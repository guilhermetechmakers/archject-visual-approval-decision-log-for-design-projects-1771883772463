import { Mail, UserPlus, Clock, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Invite, ActivityLog } from '@/types/team'

export interface ActivitySummaryCardProps {
  invites: Invite[]
  activity: ActivityLog[]
  invitesSent?: number
  pendingInvites?: number
  recentlyAdded?: number
  className?: string
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function getActionLabel(action: string): string {
  const map: Record<string, string> = {
    invite_sent: 'Invite sent',
    role_assigned: 'Role assigned',
    member_added: 'Member added',
    login: 'Login',
    role_updated: 'Role updated',
  }
  return map[action] ?? action.replace(/_/g, ' ')
}

export function ActivitySummaryCard({
  invites,
  activity,
  invitesSent = invites.filter((i) => i.status === 'accepted' || i.sentAt).length,
  pendingInvites = invites.filter((i) => i.status === 'pending').length,
  recentlyAdded = 0,
  className,
}: ActivitySummaryCardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Invites sent
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitesSent}</div>
            <p className="text-xs text-muted-foreground">Total invites</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending invites
            </CardTitle>
            <Mail className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvites}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recently added
            </CardTitle>
            <UserPlus className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentlyAdded}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent activity
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activity.length}</div>
            <p className="text-xs text-muted-foreground">Actions logged</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest invites, role changes, and member additions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activity.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/50"
              >
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {getActionLabel(log.action)}
                    {log.details && typeof log.details === 'object' && 'email' in log.details && (
                      <span className="text-muted-foreground">
                        {' '}
                        to {(log.details as { email?: string }).email}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {log.action}
                </Badge>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
