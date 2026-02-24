/**
 * LinkManagementPanel - Create, view, extend, revoke, and reissue shareable links
 * with expiry timestamps and usage counters.
 * Design: Cards with white background, soft shadows, pill-shaped actions.
 */

import { useState } from 'react'
import {
  Copy,
  Link2,
  Shield,
  Clock,
  RefreshCw,
  CalendarPlus,
  Trash2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ClientLink } from '@/types/workspace'

function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return 'No expiry'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}


export interface LinkManagementPanelProps {
  links: ClientLink[]
  projectId?: string
  decisionId?: string
  onCreateLink?: (options: {
    decisionId?: string
    expiresAt?: string
    otpRequired?: boolean
    maxUsage?: number | null
  }) => void
  onRevokeLink?: (linkId: string) => void
  onReissueLink?: (linkId: string) => void | Promise<unknown>
  onExtendLink?: (linkId: string, expiresAt: string) => void | Promise<unknown>
  onLinksChange?: () => void
  isRevoking?: boolean
  isReissuing?: boolean
  isExtending?: boolean
  className?: string
}

export function LinkManagementPanel({
  links,
  projectId: _projectId,
  decisionId,
  onCreateLink,
  onRevokeLink,
  onReissueLink,
  onExtendLink,
  onLinksChange,
  className,
}: LinkManagementPanelProps) {
  const [newLinkExpiresAt, setNewLinkExpiresAt] = useState('')
  const [newLinkOtpRequired, setNewLinkOtpRequired] = useState(false)
  const [newLinkMaxUsage, setNewLinkMaxUsage] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [extendOpen, setExtendOpen] = useState<string | null>(null)
  const [extendExpiresAt, setExtendExpiresAt] = useState('')
  const [reissuingId, setReissuingId] = useState<string | null>(null)
  const [extendingId, setExtendingId] = useState<string | null>(null)

  const handleCreate = () => {
    onCreateLink?.({
      decisionId: decisionId ?? undefined,
      expiresAt: newLinkExpiresAt || undefined,
      otpRequired: newLinkOtpRequired,
      maxUsage: newLinkMaxUsage ? parseInt(newLinkMaxUsage, 10) : null,
    })
    setNewLinkExpiresAt('')
    setNewLinkOtpRequired(false)
    setNewLinkMaxUsage('')
    setOpen(false)
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const handleReissue = async (link: ClientLink) => {
    if (!onReissueLink) return
    setReissuingId(link.id)
    try {
      await onReissueLink(link.id)
      onLinksChange?.()
    } catch {
      toast.error('Failed to reissue link')
    } finally {
      setReissuingId(null)
    }
  }

  const handleExtend = async (link: ClientLink) => {
    if (!onExtendLink || !extendExpiresAt) return
    setExtendingId(link.id)
    try {
      await onExtendLink(link.id, extendExpiresAt)
      setExtendOpen(null)
      setExtendExpiresAt('')
      onLinksChange?.()
    } catch {
      toast.error('Failed to extend link')
    } finally {
      setExtendingId(null)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Shareable links</h2>
          <p className="text-sm text-muted-foreground">
            Create, manage, and revoke no-login client portal links
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Generate link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create client portal link</DialogTitle>
              <DialogDescription>
                Generate a secure no-login link. Set expiry, OTP, and usage
                limits.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expires-at">Expires at (optional)</Label>
                <Input
                  id="expires-at"
                  type="date"
                  value={newLinkExpiresAt}
                  onChange={(e) => setNewLinkExpiresAt(e.target.value)}
                  className="rounded-lg bg-[rgb(var(--input))]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-usage">Max uses (optional)</Label>
                <Input
                  id="max-usage"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={newLinkMaxUsage}
                  onChange={(e) => setNewLinkMaxUsage(e.target.value)}
                  className="rounded-lg bg-[rgb(var(--input))]"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="otp-required">Require OTP verification</Label>
                    <p className="text-xs text-muted-foreground">
                      Client must enter a code to access
                    </p>
                  </div>
                </div>
                <Switch
                  id="otp-required"
                  checked={newLinkOtpRequired}
                  onCheckedChange={setNewLinkOtpRequired}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="rounded-full"
                style={{ backgroundColor: 'rgb(var(--primary))' }}
              >
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {links.length === 0 ? (
        <Card className="rounded-xl border border-dashed border-border shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(var(--primary), 0.1)' }}
            >
              <Link2 className="h-7 w-7" style={{ color: 'rgb(var(--primary))' }} />
            </div>
            <p className="mt-4 font-medium">No shareable links yet</p>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Generate a secure link to share with clients for no-login access.
            </p>
            <Button
              size="sm"
              className="mt-4 rounded-full"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
              onClick={() => setOpen(true)}
            >
              Generate link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card
              key={link.id}
              className="rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <code className="block truncate rounded-lg bg-secondary px-3 py-2 text-xs font-mono">
                      {link.url}
                    </code>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {link.otp_required && (
                        <Badge
                          variant="default"
                          className="gap-1 rounded-full"
                          style={{ backgroundColor: 'rgb(var(--primary))' }}
                        >
                          <Shield className="h-3 w-3" />
                          OTP
                        </Badge>
                      )}
                      {link.expires_at && (
                        <Badge
                          variant="secondary"
                          className="gap-1 rounded-full"
                        >
                          <Clock className="h-3 w-3" />
                          {formatExpiry(link.expires_at)}
                        </Badge>
                      )}
                      {(link.usage_count ?? 0) > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Used {link.usage_count}
                          {link.max_usage != null
                            ? ` / ${link.max_usage}`
                            : ''}
                        </span>
                      )}
                      {!link.is_active && (
                        <Badge variant="destructive" className="rounded-full">
                          Revoked
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => copyToClipboard(link.url)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    {link.is_active && (
                      <>
                        {onReissueLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={reissuingId === link.id}
                            onClick={() => handleReissue(link)}
                          >
                            {reissuingId === link.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Reissue
                          </Button>
                        )}
                        {onExtendLink && (
                          <Dialog
                            open={extendOpen === link.id}
                            onOpenChange={(o) =>
                              setExtendOpen(o ? link.id : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                              >
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                Extend
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Extend link expiry</DialogTitle>
                                <DialogDescription>
                                  Set a new expiry date for this link.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>New expiry date</Label>
                                  <Input
                                    type="date"
                                    value={extendExpiresAt}
                                    onChange={(e) =>
                                      setExtendExpiresAt(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setExtendOpen(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleExtend(link)}
                                  disabled={
                                    !extendExpiresAt ||
                                    extendingId === link.id
                                  }
                                >
                                  {extendingId === link.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  Extend
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {onRevokeLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => onRevokeLink(link.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Revoke
                          </Button>
                        )}
                      </>
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
