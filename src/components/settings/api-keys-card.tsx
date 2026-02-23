import { useState } from 'react'
import { Key, Plus, Trash2, Copy, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSettingsApiKeys, useCreateApiKey, useRevokeApiKey } from '@/hooks/use-settings'
import { toast } from 'sonner'

export function ApiKeysCard() {
  const { data: keys, isLoading } = useSettingsApiKeys()
  const createMutation = useCreateApiKey()
  const revokeMutation = useRevokeApiKey()
  const [createOpen, setCreateOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyScopes, setNewKeyScopes] = useState('read,write')
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [revokeId, setRevokeId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error('Enter a name')
      return
    }
    try {
      const res = await createMutation.mutateAsync({
        name: newKeyName.trim(),
        scopes: newKeyScopes.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setRevealedKey((res as { key?: string })?.key ?? null)
      setNewKeyName('')
      setNewKeyScopes('read,write')
      toast.success('API key created')

      if ((res as { key?: string })?.key) {
        setCreateOpen(false)
      }
    } catch {
      toast.error('Failed to create key')
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await revokeMutation.mutateAsync(id)
      setRevokeId(null)
      toast.success('Key revoked')
    } catch {
      toast.error('Failed to revoke')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (isLoading) return null

  const items = keys ?? []

  return (
    <>
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>API Keys & Webhooks</CardTitle>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Generate key
            </Button>
          </div>
          <CardDescription>
            Create and manage API keys. Keys are shown once at creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
                <Key className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="font-medium">No API keys yet</p>
                <p className="text-sm">Generate a key to integrate with external tools</p>
                <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate key
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.scopes.join(', ')} • Created {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    {item.keyPreview && (
                      <code className="mt-1 block text-xs text-muted-foreground">
                        {item.keyPreview}
                      </code>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setRevokeId(item.id)}
                    aria-label="Revoke key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API key</DialogTitle>
            <DialogDescription>
              Name your key and choose scopes. The full key is shown only once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="Production API"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-scopes">Scopes (comma-separated)</Label>
              <Input
                id="key-scopes"
                placeholder="read, write"
                value={newKeyScopes}
                onChange={(e) => setNewKeyScopes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!revealedKey} onOpenChange={() => setRevealedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>
              Copy this key now. It won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-3">
            <code className="flex-1 truncate text-sm">{revealedKey}</code>
            <Button variant="outline" size="icon" onClick={() => revealedKey && copyToClipboard(revealedKey)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API key</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Any integrations using this key will stop working.
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
              {revokeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
