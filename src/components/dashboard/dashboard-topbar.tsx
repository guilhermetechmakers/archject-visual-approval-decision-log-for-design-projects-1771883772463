import * as React from 'react'
import { Search, Bell, ChevronDown, Settings, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useDashboardData, useWorkspaces } from '@/hooks/use-dashboard'
import { useNotifications, useMarkNotificationRead } from '@/hooks/use-notifications'
import type { DashboardWorkspace, DashboardUser } from '@/types/dashboard'

interface DashboardTopbarProps {
  workspaceId?: string | null
  onWorkspaceChange?: (workspaceId: string) => void
  className?: string
}

const MOCK_NOTIFICATIONS: {
  id: string
  title: string
  time: string
  read: boolean
  payload?: Record<string, unknown>
  decisionId?: string
}[] = [
  { id: 'n1', title: 'Client approved Kitchen finish options', time: '2h ago', read: false },
  { id: 'n2', title: 'Bathroom tile selection is overdue', time: '1d ago', read: true },
  { id: 'n3', title: 'New comment on Exterior color palette', time: '2d ago', read: true },
]

function formatNotificationTitle(type: string): string {
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

export function DashboardTopbar({
  workspaceId,
  onWorkspaceChange,
  className,
}: DashboardTopbarProps) {
  const { logout } = useAuth()
  const { data } = useDashboardData(workspaceId ?? undefined)
  const { data: workspaces = [] } = useWorkspaces()
  const [searchValue, setSearchValue] = React.useState('')
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)

  const userId = data?.user?.id
  const { data: notifications = [] } = useNotifications(userId)
  const markRead = useMarkNotificationRead()

  const user = data?.user
  const workspace = data?.workspace
  const currentWorkspaceId = workspaceId ?? workspace?.id

  const displayNotifications: {
    id: string
    title: string
    time: string
    read: boolean
    payload?: Record<string, unknown>
    decisionId?: string
  }[] =
    notifications.length > 0
      ? notifications.map((n) => ({
          id: n.id,
          title: formatNotificationTitle(n.type),
          time: new Date(n.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          read: !!n.readAt,
          payload: n.payload,
          decisionId: n.decisionId,
        }))
      : MOCK_NOTIFICATIONS

  const unreadCount = displayNotifications.filter((n) => !n.read).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      window.location.href = `/dashboard/decisions?q=${encodeURIComponent(searchValue.trim())}`
    }
  }

  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6',
        className
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:block">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search projects, decisions, files..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
            aria-label="Global search"
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <WorkspaceSelector
          workspaces={workspaces}
          currentWorkspace={workspace}
          currentWorkspaceId={currentWorkspaceId}
          onWorkspaceChange={onWorkspaceChange}
        />

        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
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
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[240px]">
              <div className="space-y-1 p-1">
                {displayNotifications.map((n) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer hover:bg-muted/50',
                      !n.read && 'bg-primary/5'
                    )}
                    onClick={() => {
                      if (!n.read && notifications.some((x) => x.id === n.id)) {
                        markRead.mutate(n.id)
                      }
                      if ('decisionId' in n && n.decisionId) {
                        setNotificationsOpen(false)
                        window.location.href = `/internal/decisions/${n.decisionId}`
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (!n.read && notifications.some((x) => x.id === n.id)) {
                          markRead.mutate(n.id)
                        }
                        if ('decisionId' in n && n.decisionId) {
                          setNotificationsOpen(false)
                          window.location.href = `/internal/decisions/${n.decisionId}`
                        }
                      }
                    }}
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {(n.payload as { message?: string })?.message ?? n.time}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings?tab=notifications" className="cursor-pointer">
                Notification settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu user={user} onLogout={logout} />
      </div>
    </header>
  )
}

function WorkspaceSelector({
  workspaces,
  currentWorkspace,
  currentWorkspaceId,
  onWorkspaceChange,
}: {
  workspaces: { id: string; name: string }[]
  currentWorkspace?: DashboardWorkspace | null
  currentWorkspaceId?: string | null
  onWorkspaceChange?: (id: string) => void
}) {
  const value = currentWorkspaceId ?? workspaces[0]?.id ?? ''
  const displayName = currentWorkspace?.name ?? workspaces.find((w) => w.id === value)?.name ?? 'Select workspace'

  if (workspaces.length <= 1) {
    return (
      <div className="hidden items-center gap-2 rounded-lg border border-border bg-input px-3 py-2 text-sm font-medium md:flex">
        {displayName}
      </div>
    )
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => onWorkspaceChange?.(v)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>{displayName}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((w) => (
          <SelectItem key={w.id} value={w.id}>
            {w.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function UserMenu({
  user,
  onLogout,
}: {
  user?: DashboardUser | null
  onLogout: () => void
}) {
  const name = user?.name ?? 'User'
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-full pl-1 pr-2"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar ?? undefined} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">{name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              Account
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
