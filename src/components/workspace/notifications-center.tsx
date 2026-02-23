import { Bell, CheckCircle, MessageSquare, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '@/types/client-portal'

function getIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'pending_approval':
      return <Clock className="h-4 w-4" />
    case 'comment_mention':
      return <MessageSquare className="h-4 w-4" />
    case 'reminder':
      return <Bell className="h-4 w-4" />
    case 'approval_received':
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

function formatNotificationTitle(type: NotificationItem['type']): string {
  switch (type) {
    case 'pending_approval':
      return 'Pending approval'
    case 'comment_mention':
      return 'You were mentioned'
    case 'reminder':
      return 'Reminder'
    case 'approval_received':
      return 'Approval received'
    default:
      return 'Notification'
  }
}

export interface NotificationsCenterProps {
  notifications: NotificationItem[]
  onMarkRead?: (id: string) => void
  onSelect?: (notification: NotificationItem) => void
  onMarkAllRead?: () => void
  className?: string
}

export function NotificationsCenter({
  notifications,
  onMarkRead,
  onSelect,
  onMarkAllRead,
  className,
}: NotificationsCenterProps) {
  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Notifications</CardTitle>
          </span>
          {unreadCount > 0 && onMarkAllRead && (
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Pending approvals, mentions, and reminders
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">No notifications</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You'll see updates here when clients approve or comment.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    onMarkRead?.(n.id)
                    onSelect?.(n)
                  }}
                  className={cn(
                    'flex w-full cursor-pointer gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-secondary/50',
                    !n.readAt && 'bg-primary/5'
                  )}
                >
                  <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-1.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">
                      {formatNotificationTitle(n.type)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {(n.payload as { message?: string })?.message ??
                        'New update'}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
