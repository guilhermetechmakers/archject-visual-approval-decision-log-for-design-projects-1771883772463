import { Bell, CheckCircle, MessageSquare, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export interface NotificationTrayProps {
  notifications: NotificationItem[]
  onMarkRead?: (id: string) => void
  onSelect?: (notification: NotificationItem) => void
  accentColor?: string
  className?: string
}

export function NotificationTray({
  notifications,
  onMarkRead,
  onSelect,
  accentColor = 'rgb(var(--primary))',
  className,
}: NotificationTrayProps) {
  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="border-b border-border px-3 py-2">
          <p className="font-semibold">Notifications</p>
        </div>
        <ScrollArea className="h-[280px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => {
                    onMarkRead?.(n.id)
                    onSelect?.(n)
                  }}
                  className={cn(
                    'flex cursor-pointer gap-3 px-3 py-2',
                    !n.readAt && 'bg-primary/5'
                  )}
                >
                  <div
                    className="mt-0.5 shrink-0 rounded-full p-1.5"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
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
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
