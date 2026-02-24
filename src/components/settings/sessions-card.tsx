/**
 * SessionsCard - Active sessions and devices management.
 * Lists sessions with device details, revoke individual or all except current,
 * sign out from all devices. Follows Archject design system.
 */

import { useState } from 'react'
import {
  Monitor,
  MapPin,
  Trash2,
  Loader2,
  LogOut,
  ChevronDown,
  ChevronUp,
  Smartphone,
  AlertCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useSettingsSessionsStrict,
  useRevokeSession,
  useRevokeAllSessionsExceptCurrent,
} from '@/hooks/use-settings'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Session } from '@/types/settings'

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

function SessionSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading sessions">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="flex items-center justify-between rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
        </Card>
      ))}
    </div>
  )
}

function EmptySessionsState({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center border border-dashed border-border',
        'bg-secondary/30 py-12 px-6 text-center',
        'transition-all duration-200'
      )}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full bg-muted"
        aria-hidden
      >
        <Monitor className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="mt-4 font-medium text-foreground">No active sessions</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        When you sign in from a device, it will appear here. You can revoke
        access from any device at any time.
      </p>
      {onSignOut && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      )}
    </Card>
  )
}

function SessionRow({
  session,
  onRevoke,
  isRevoking,
}: {
  session: Session
  onRevoke: () => void
  isRevoking: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const deviceLabel = session.deviceName || session.device
  const hasDetails = session.os || session.browser || session.ipAddress

  return (
    <Card
      className={cn(
        'rounded-xl border border-border p-4 transition-all duration-200',
        'hover:border-border/80 hover:shadow-sm'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            {session.device?.toLowerCase().includes('iphone') ||
            session.device?.toLowerCase().includes('mobile') ? (
              <Smartphone className="h-5 w-5 text-muted-foreground" aria-hidden />
            ) : (
              <Monitor className="h-5 w-5 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{deviceLabel}</p>
              {session.current && (
                <Badge variant="success" className="rounded-full text-success">
                  Current
                </Badge>
              )}
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {session.location}
            </p>
            <p className="text-xs text-muted-foreground">
              Last used {formatRelativeTime(session.lastUsed)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Details
            </Button>
          )}
          {!session.current && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={onRevoke}
              disabled={isRevoking}
              aria-label={`Revoke session on ${deviceLabel}`}
            >
              {isRevoking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Revoke
            </Button>
          )}
        </div>
      </div>
      {expanded && hasDetails && (
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          {session.os && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">OS:</span> {session.os}
            </p>
          )}
          {session.browser && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Browser:</span> {session.browser}
            </p>
          )}
          {session.ipAddress && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">IP:</span> {session.ipAddress}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

function ErrorSessionsState({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void
  isRetrying: boolean
}) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center border border-destructive/30',
        'bg-destructive/5 py-12 px-6 text-center',
        'transition-all duration-200'
      )}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10"
        aria-hidden
      >
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <p className="mt-4 font-medium text-foreground">Failed to load sessions</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load your active sessions. Please try again.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Retry
      </Button>
    </Card>
  )
}

export function SessionsCard() {
  const { logout } = useAuth()
  const {
    data: sessions,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useSettingsSessionsStrict()
  const revokeMutation = useRevokeSession()
  const revokeAllMutation = useRevokeAllSessionsExceptCurrent()
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [revokeAllOpen, setRevokeAllOpen] = useState(false)
  const [signOutAllOpen, setSignOutAllOpen] = useState(false)

  const items = sessions ?? []
  const otherSessionsCount = items.filter((s) => !s.current).length
  const currentSessionId = items.find((s) => s.current)?.id

  const handleRevoke = async (id: string) => {
    try {
      await revokeMutation.mutateAsync(id)
      setRevokeId(null)
      toast.success('Session revoked')
    } catch {
      toast.error('Failed to revoke session')
    }
  }

  const handleRevokeAllExceptCurrent = async () => {
    try {
      await revokeAllMutation.mutateAsync(currentSessionId)
      setRevokeAllOpen(false)
      toast.success('All other sessions revoked')
    } catch {
      toast.error('Failed to revoke sessions')
    }
  }

  const handleSignOutAll = () => {
    setSignOutAllOpen(false)
    logout()
  }

  return (
    <>
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <CardTitle>Session management</CardTitle>
            </div>
            {items.length > 0 && otherSessionsCount > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevokeAllOpen(true)}
                  disabled={revokeAllMutation.isPending}
                >
                  {revokeAllMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Sign out other devices
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setSignOutAllOpen(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out everywhere
                </Button>
              </div>
            )}
          </div>
          <CardDescription>
            View active sessions and revoke access from suspicious devices. Sign out from all devices to secure your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SessionSkeleton />
          ) : isError ? (
            <ErrorSessionsState
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          ) : items.length === 0 ? (
            <EmptySessionsState onSignOut={logout} />
          ) : (
            <div className="space-y-4">
              {items.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  onRevoke={() => setRevokeId(s.id)}
                  isRevoking={revokeMutation.isPending && revokeId === s.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke session</DialogTitle>
            <DialogDescription>
              This will sign out the selected device. The user will need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeId && handleRevoke(revokeId)}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Revoke'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out other devices</DialogTitle>
            <DialogDescription>
              This will revoke all sessions except this one. You will stay signed in on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeAllOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRevokeAllExceptCurrent}
              disabled={revokeAllMutation.isPending}
            >
              {revokeAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Revoke other sessions'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={signOutAllOpen} onOpenChange={setSignOutAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out everywhere</DialogTitle>
            <DialogDescription>
              This will sign you out from all devices including this one. You will need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignOutAllOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSignOutAll}>
              Sign out everywhere
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
