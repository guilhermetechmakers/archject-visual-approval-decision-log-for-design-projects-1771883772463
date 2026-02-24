import { useState } from 'react'
import {
  Webhook,
  Plus,
  Zap,
  Trash2,
  Loader2,
  ExternalLink,
  TestTube,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useSettingsWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
} from '@/hooks/use-settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const WEBHOOK_EVENTS = [
  'decision.created',
  'decision.approved',
  'decision.rejected',
  'decision.revoked',
  'options.updated',
  'comment.added',
  'reminder.sent',
] as const

export function WebhooksCard() {
  const { data: webhooks, isLoading } = useSettingsWebhooks()
  const createMutation = useCreateWebhook()
  const updateMutation = useUpdateWebhook()
  const deleteMutation = useDeleteWebhook()
  const testMutation = useTestWebhook()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [newUrl, setNewUrl] = useState('')
  const [newEvents, setNewEvents] = useState<string[]>(['decision.approved', 'decision.rejected'])
  const [newSigningSecret, setNewSigningSecret] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [editEvents, setEditEvents] = useState<string[]>([])
  const [editEnabled, setEditEnabled] = useState(true)

  const items = webhooks ?? []

  const handleCreate = async () => {
    if (!newUrl.trim()) {
      toast.error('Enter a webhook URL')
      return
    }
    if (newEvents.length === 0) {
      toast.error('Select at least one event')
      return
    }
    try {
      await createMutation.mutateAsync({
        url: newUrl.trim(),
        events: newEvents,
        signingSecret: newSigningSecret.trim() || undefined,
      })
      setCreateOpen(false)
      setNewUrl('')
      setNewEvents(['decision.approved', 'decision.rejected'])
      setNewSigningSecret('')
    } catch {
      toast.error('Failed to create webhook')
    }
  }

  const handleEdit = (wh: { id: string; url: string; events: string[]; enabled?: boolean }) => {
    setEditId(wh.id)
    setEditUrl(wh.url)
    setEditEvents(wh.events ?? [])
    setEditEnabled(wh.enabled ?? true)
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editId) return
    try {
      await updateMutation.mutateAsync({
        id: editId,
        data: { url: editUrl.trim(), events: editEvents, enabled: editEnabled },
      })
      setEditOpen(false)
      setEditId(null)
    } catch {
      toast.error('Failed to update webhook')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete webhook')
    }
  }

  const handleTest = async (id: string) => {
    try {
      const res = await testMutation.mutateAsync(id)
      if (res?.success) {
        toast.success('Test payload delivered successfully')
      } else {
        toast.error(res?.message ?? 'Webhook test failed')
      }
    } catch {
      toast.error('Webhook test failed')
    }
  }

  const toggleEvent = (events: string[], setEvents: (e: string[]) => void, event: string) => {
    if (events.includes(event)) {
      setEvents(events.filter((e) => e !== event))
    } else {
      setEvents([...events, event])
    }
  }

  const handleZapierConnect = () => {
    toast.info('Opening Zapier — use the webhook URL from your Zap')
    window.open('https://zapier.com/apps/webhooks/integrations', '_blank', 'noopener')
  }

  if (isLoading) return null

  return (
    <>
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            <CardTitle>Light tasking & webhooks</CardTitle>
          </div>
          <CardDescription>
            Create tasks from approvals and trigger webhooks to Zapier or PM tools. Payloads are
            signed with HMAC-SHA256.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-4 transition-all duration-200 hover:bg-secondary/50">
            <Zap className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Zapier</p>
              <p className="text-sm text-muted-foreground">
                Connect via Zapier to automate workflows. Use &quot;Catch Hook&quot; and paste the
                webhook URL below.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleZapierConnect}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect Zapier
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Webhook endpoints</Label>
              <Button
                size="sm"
                className="rounded-full bg-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add endpoint
              </Button>
            </div>
            {items.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-muted-foreground">
                <Webhook className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="font-medium">No webhooks configured</p>
                <p className="text-sm">Add an endpoint to receive decision events</p>
                <Button
                  className="mt-4 rounded-full"
                  variant="outline"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add endpoint
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((wh) => (
                  <div
                    key={wh.id}
                    className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-card"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <code className="block truncate text-sm font-medium">
                          {wh.url}
                        </code>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Events: {(wh.events ?? []).join(', ')}
                        </p>
                        {wh.lastTest && (
                          <p className="text-xs text-muted-foreground">
                            Last test: {new Date(wh.lastTest).toLocaleString()}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Payloads include X-Archject-Signature header (HMAC-SHA256).
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge
                          variant={wh.enabled ? 'default' : 'secondary'}
                          className={cn(wh.enabled && 'bg-success/20 text-success')}
                        >
                          {wh.enabled ? 'Active' : 'Paused'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(wh.id)}
                          disabled={testMutation.isPending}
                          className="transition-all duration-200 hover:scale-[1.02]"
                        >
                          {testMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <TestTube className="mr-1 h-3 w-3" />
                              Test
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(wh)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(wh.id)}
                          aria-label="Delete webhook"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add webhook endpoint</DialogTitle>
            <DialogDescription>
              Enter the URL to receive events. Signing secret (min 32 chars) enables payload
              verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.example.com/webhooks/archject"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="rounded-lg bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map((ev) => (
                  <Badge
                    key={ev}
                    variant={newEvents.includes(ev) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-[1.02]"
                    onClick={() => toggleEvent(newEvents, setNewEvents, ev)}
                  >
                    {ev}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signing-secret">Signing secret (optional)</Label>
              <Input
                id="signing-secret"
                type="password"
                placeholder="Min 32 characters for HMAC-SHA256"
                value={newSigningSecret}
                onChange={(e) => setNewSigningSecret(e.target.value)}
                className="rounded-lg bg-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !newUrl.trim() || newEvents.length === 0}
              className="rounded-full bg-primary"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add endpoint'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit webhook</DialogTitle>
            <DialogDescription>Update URL, events, or pause the endpoint.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="rounded-lg bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map((ev) => (
                  <Badge
                    key={ev}
                    variant={editEvents.includes(ev) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleEvent(editEvents, setEditEvents, ev)}
                  >
                    {ev}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-enabled"
                checked={editEnabled}
                onChange={(e) => setEditEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="edit-enabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || !editUrl.trim() || editEvents.length === 0}
              className="rounded-full bg-primary"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete webhook</DialogTitle>
            <DialogDescription>
              This endpoint will stop receiving events. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
