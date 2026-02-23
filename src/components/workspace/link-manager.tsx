import { useState } from 'react'
import { Copy, Check, Link2, Shield, Clock, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { generateShareLink } from '@/api/client-portal'
import type { BrandingConfig } from '@/types/client-portal'

export interface GeneratedLink {
  id: string
  token: string
  url: string
  expiresAt?: string | null
  requiresOtp: boolean
  createdAt: string
}

export interface LinkManagerProps {
  decisionId: string
  decisionTitle?: string
  links?: GeneratedLink[]
  onRevoke?: (linkId: string) => void
  brandingOverride?: BrandingConfig | null
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

export function LinkManager({
  decisionId,
  decisionTitle,
  links = [],
  onRevoke,
  brandingOverride,
  className,
}: LinkManagerProps) {
  const [open, setOpen] = useState(false)
  const [expirySeconds, setExpirySeconds] = useState<number | ''>(7 * 24 * 3600)
  const [requireOtp, setRequireOtp] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setGeneratedLink(null)
    try {
      const res = await generateShareLink(decisionId, {
        decisionId,
        expirySeconds:
          typeof expirySeconds === 'number' ? expirySeconds : undefined,
        requireOtp,
        brandingOverride: brandingOverride ?? undefined,
      })
      setGeneratedLink({
        id: `link-${Date.now()}`,
        token: res.token,
        url: res.url,
        expiresAt: res.expiresAt ?? null,
        requiresOtp: res.requireOtp,
        createdAt: new Date().toISOString(),
      })
    } catch {
      setGeneratedLink({
        id: `link-${Date.now()}`,
        token: `demo-${Date.now()}`,
        url: `${window.location.origin}/portal/demo-${Date.now()}`,
        expiresAt: expirySeconds
          ? new Date(
              Date.now() + (typeof expirySeconds === 'number' ? expirySeconds : 0) * 1000
            ).toISOString()
          : null,
        requiresOtp: requireOtp,
        createdAt: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setGeneratedLink(null)
    setOpen(false)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Share links</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="transition-all duration-200 hover:scale-[1.02]"
            >
              <Link2 className="mr-2 h-4 w-4" />
              Generate link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create client portal link</DialogTitle>
              <DialogDescription>
                Generate a secure no-login link for clients.
                {decisionTitle && ` (${decisionTitle})`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry (seconds, optional)</Label>
                <Input
                  id="expiry"
                  type="number"
                  placeholder="604800 (7 days)"
                  value={expirySeconds}
                  onChange={(e) =>
                    setExpirySeconds(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="otp">Require OTP verification</Label>
                    <p className="text-xs text-muted-foreground">
                      Client must enter a code to access
                    </p>
                  </div>
                </div>
                <Switch
                  id="otp"
                  checked={requireOtp}
                  onCheckedChange={setRequireOtp}
                />
              </div>
              {generatedLink && (
                <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label>Generated link</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={generatedLink.url}
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(generatedLink.url)}
                      aria-label="Copy link"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {generatedLink ? 'Close' : 'Cancel'}
              </Button>
              {!generatedLink ? (
                <Button onClick={handleGenerate} disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate link'}
                </Button>
              ) : (
                <Button onClick={() => handleCopy(generatedLink.url)}>
                  {copied ? 'Copied!' : 'Copy link'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {links.length === 0 && !generatedLink ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Link2 className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No share links yet</p>
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
          {generatedLink && (
            <Card
              key={generatedLink.id}
              className="transition-all hover:shadow-card-hover"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <code className="block truncate rounded bg-secondary px-2 py-1 text-xs">
                      {generatedLink.url}
                    </code>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {generatedLink.requiresOtp && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          <Shield className="h-3 w-3" />
                          OTP
                        </span>
                      )}
                      {generatedLink.expiresAt && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatExpiry(generatedLink.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(generatedLink.url)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {links.map((link) => (
            <Card
              key={link.id}
              className="transition-all hover:shadow-card-hover"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <code className="block truncate rounded bg-secondary px-2 py-1 text-xs">
                      {link.url}
                    </code>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {link.requiresOtp && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          <Shield className="h-3 w-3" />
                          OTP
                        </span>
                      )}
                      {link.expiresAt && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatExpiry(link.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(link.url)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    {onRevoke && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => onRevoke(link.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
