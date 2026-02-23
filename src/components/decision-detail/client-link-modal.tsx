import { useState } from 'react'
import { Copy, Check, Shield, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface ClientLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  decisionId: string
  decisionTitle?: string
  onCreateLink?: (options: {
    expiresAt?: string
    otpRequired?: boolean
  }) => Promise<{ url: string } | void>
  className?: string
}

export function ClientLinkModal({
  open,
  onOpenChange,
  decisionId,
  decisionTitle,
  onCreateLink,
  className,
}: ClientLinkModalProps) {
  const [expiresAt, setExpiresAt] = useState('')
  const [otpRequired, setOtpRequired] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!onCreateLink) return
    setIsLoading(true)
    setGeneratedUrl(null)
    try {
      const result = await onCreateLink({
        expiresAt: expiresAt || undefined,
        otpRequired,
      })
      if (result?.url) {
        setGeneratedUrl(result.url)
      } else {
        setGeneratedUrl(
          `${window.location.origin}/portal/${decisionId}-${Date.now()}`
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setExpiresAt('')
    setOtpRequired(false)
    setGeneratedUrl(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn('max-w-md', className)}
        aria-describedby="client-link-description"
      >
        <DialogHeader>
          <DialogTitle>Generate client portal link</DialogTitle>
          <DialogDescription id="client-link-description">
            Create a secure no-login link for clients to view and approve this
            decision. {decisionTitle && `(${decisionTitle})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expires-at">Expires at (optional)</Label>
            <Input
              id="expires-at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
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
              checked={otpRequired}
              onCheckedChange={setOtpRequired}
            />
          </div>

          {generatedUrl && (
            <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label>Generated link</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generatedUrl}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
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
            {generatedUrl ? 'Close' : 'Cancel'}
          </Button>
          {!generatedUrl ? (
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate link'}
            </Button>
          ) : (
            <Button onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
