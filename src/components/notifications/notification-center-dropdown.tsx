/**
 * Notification Center Dropdown - Per-notification actions (mark read, snooze, mute)
 * Used in dashboard topbar
 */

import { Bell, Clock, VolumeX, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useNotifications, useMarkNotificationRead, useSnoozeNotification, useMuteNotification } from '@/hooks/use-notifications'
import type { DecisionNotification } from '@/types/notifications'

function formatNotificationTitle(type: DecisionNotification['type']): string {
  switch (type) {
    case 'mention':
      return 'You were mentioned'
    case 'comment':
      return 'New comment'
    case 'approval':
      return 'Approval received'
    case 'changes_requested':
      return 'Changes requested'
    case 'reminder':
      return 'Reminder'
    default:
      return 'Notification'
  }
}

function addHours(date: Date, hours: number): string {
  const d = new Date(date)
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export interface NotificationCenterDropdownProps {
  userId: string | undefined
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function NotificationCenterDropdown({
  userId,
  onOpenChange,
  className,
}: NotificationCenterDropdownProps) {
  const { data: notifications = [], isLoading } = useNotifications(userId)
  const markRead = useMarkNotificationRead()
  const snooze = useSnoozeNotification()
  const mute = useMuteNotification()

  const unreadCount = notifications.filter((n) => !n.readAt).length
  const now = new Date()

  const handleNotificationClick = (n: DecisionNotification) => {
    if (!n.readAt) markRead.mutate(n.id)
    if (n.decisionId) {
      onOpenChange?.(false)
    }
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative transition-all duration-200 hover:scale-105', className)}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl border-border shadow-card">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Link
            to="/dashboard/settings/notifications"
            className="text-xs font-normal text-muted-foreground hover:text-primary"
            onClick={() => onOpenChange?.(false)}
          >
            Settings
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[280px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'group flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/50',
                    !n.readAt && 'bg-primary/5'
                  )}
                >
                  <Link
                    to={n.decisionId ? `/internal/decisions/${n.decisionId}` : '#'}
                    className="min-w-0 flex-1"
                    onClick={() => handleNotificationClick(n)}
                  >
                    <p className="font-medium text-sm">{formatNotificationTitle(n.type)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {(n.payload as { message?: string })?.message ?? 'New update'}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </Link>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      className="h-8 w-8 shrink-0 rounded-md opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                      onPointerDown={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="h-4 w-4" aria-label="Actions" />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                      {!n.readAt && (
                        <DropdownMenuItem onClick={() => markRead.mutate(n.id)}>
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Clock className="mr-2 h-4 w-4" />
                          Snooze
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={() =>
                              snooze.mutate({
                                notificationId: n.id,
                                until: addHours(now, 1),
                              })
                            }
                          >
                            1 hour
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              snooze.mutate({
                                notificationId: n.id,
                                until: addHours(now, 3),
                              })
                            }
                          >
                            3 hours
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              snooze.mutate({
                                notificationId: n.id,
                                until: addDays(now, 1),
                              })
                            }
                          >
                            1 day
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <VolumeX className="mr-2 h-4 w-4" />
                          Mute
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={() =>
                              mute.mutate({
                                notificationId: n.id,
                                until: addHours(now, 1),
                              })
                            }
                          >
                            1 hour
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              mute.mutate({
                                notificationId: n.id,
                                until: addDays(now, 1),
                              })
                            }
                          >
                            1 day
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              mute.mutate({
                                notificationId: n.id,
                                until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                              })
                            }
                          >
                            Indefinitely
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings/notifications" className="cursor-pointer">
            Notification settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
