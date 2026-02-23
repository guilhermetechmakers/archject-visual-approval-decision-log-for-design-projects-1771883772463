import { Monitor, MapPin, Trash2, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSettingsSessions, useRevokeSession } from '@/hooks/use-settings'
import { useState } from 'react'
import { toast } from 'sonner'

export function SessionsCard() {
  const { data: sessions, isLoading } = useSettingsSessions()
  const revokeMutation = useRevokeSession()
  const [revokeId, setRevokeId] = useState<string | null>(null)

  const handleRevoke = async (id: string) => {
    try {
      await revokeMutation.mutateAsync(id)
      setRevokeId(null)
      toast.success('Session revoked')
    } catch {
      toast.error('Failed to revoke session')
    }
  }

  if (isLoading) return null

  const items = sessions ?? []

  return (
    <>
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <CardTitle>Session management</CardTitle>
          </div>
          <CardDescription>
            View active sessions and revoke access from suspicious devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sessions found
              </p>
            ) : (
              items.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{s.device}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {s.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last used {new Date(s.lastUsed).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.current && (
                      <span className="rounded-md bg-success/20 px-2 py-1 text-xs font-medium text-success">
                        Current
                      </span>
                    )}
                    {!s.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setRevokeId(s.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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
    </>
  )
}
