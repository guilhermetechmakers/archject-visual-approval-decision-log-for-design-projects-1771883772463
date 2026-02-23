import { Copy, Link2, Shield, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { ClientLink } from '@/types/workspace'

export interface ClientPortalManagerProps {
  links: ClientLink[]
  projectId?: string
  onCreateLink?: (options: {
    decisionId?: string
    expiresAt?: string
    otpRequired?: boolean
  }) => void
  onRevokeLink?: (linkId: string) => void
  className?: string
}

function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return 'No expiry'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ClientPortalManager({
  links,
  projectId: _projectId,
  onCreateLink,
  onRevokeLink,
  className,
}: ClientPortalManagerProps) {
  const [newLinkDecisionId, setNewLinkDecisionId] = useState('')
  const [newLinkExpiresAt, setNewLinkExpiresAt] = useState('')
  const [newLinkOtpRequired, setNewLinkOtpRequired] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCreate = () => {
    onCreateLink?.({
      decisionId: newLinkDecisionId || undefined,
      expiresAt: newLinkExpiresAt || undefined,
      otpRequired: newLinkOtpRequired,
    })
    setNewLinkDecisionId('')
    setNewLinkExpiresAt('')
    setNewLinkOtpRequired(false)
    setOpen(false)
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Client Portal Links</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Link2 className="mr-2 h-4 w-4" />
              Generate link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create client portal link</DialogTitle>
              <DialogDescription>
                Generate a secure no-login link for clients. Optionally set
                expiry and OTP verification.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="decision-id">Decision (optional)</Label>
                <Input
                  id="decision-id"
                  placeholder="Leave empty for project-wide link"
                  value={newLinkDecisionId}
                  onChange={(e) => setNewLinkDecisionId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires-at">Expires at (optional)</Label>
                <Input
                  id="expires-at"
                  type="date"
                  value={newLinkExpiresAt}
                  onChange={(e) => setNewLinkExpiresAt(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="otp-required"
                  checked={newLinkOtpRequired}
                  onChange={(e) => setNewLinkOtpRequired(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="otp-required">Require OTP verification</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Generate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {links.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Link2 className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No client links yet</p>
            <p className="text-sm text-muted-foreground">
              Generate a secure link to share with clients for no-login access.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
              Generate link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <Card key={link.id} className="transition-all hover:shadow-card-hover">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="truncate rounded bg-secondary px-2 py-1 text-xs">
                        {link.url}
                      </code>
                      {link.otp_required && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          OTP
                        </Badge>
                      )}
                      {link.expires_at && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {formatExpiry(link.expires_at)}
                        </Badge>
                      )}
                      {!link.is_active && (
                        <Badge variant="destructive">Revoked</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.url)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    {link.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => onRevokeLink?.(link.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
