/**
 * ShareLinkModal - Generate client-facing link with expiration controls
 * Design: pill-shaped inputs, soft backgrounds, expiration date picker
 */

import { useState } from 'react'
import { Copy, Link2, Shield, Clock } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface ShareLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string | null
  decisionId?: string | null
  projectName?: string
  decisionTitle?: string
  onGenerate?: (options: {
    decisionId?: string
    expiresAt?: string
    otpRequired?: boolean
  }) => Promise<{ url: string; expiresAt?: string | null }>
  className?: string
}

export function ShareLinkModal({
  open,
  onOpenChange,
  projectId: _projectId,
  decisionId,
  projectName,
  decisionTitle,
  onGenerate,
  className,
}: ShareLinkModalProps) {
  const [expiresAt, setExpiresAt] = useState('')
  const [otpRequired, setOtpRequired] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!onGenerate) {
      toast.info('Share link generation will connect to API')
      return
    }
    setIsGenerating(true)
    try {
      const result = await onGenerate({
        decisionId: decisionId ?? undefined,
        expiresAt: expiresAt || undefined,
        otpRequired,
      })
      setGeneratedUrl(result.url)
      toast.success('Link generated')
    } catch {
      toast.error('Failed to generate link')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      toast.success('Link copied to clipboard')
    }
  }

  const handleClose = () => {
    setGeneratedUrl(null)
    setExpiresAt('')
    setOtpRequired(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'max-w-md rounded-2xl border border-border bg-card p-0 shadow-card',
          className
        )}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Link2 className="h-5 w-5 text-primary" />
            Share client link
          </DialogTitle>
          <DialogDescription>
            Generate a no-login link for clients to review and approve decisions.
            {projectName && (
              <span className="block mt-1 text-foreground font-medium">
                {projectName}
                {decisionTitle && ` — ${decisionTitle}`}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {!generatedUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="expires-at" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Expiration (optional)
                </Label>
                <Input
                  id="expires-at"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="rounded-lg bg-[#F5F6FA] border-border"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-[#F5F6FA] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <Label htmlFor="otp" className="font-medium">
                    Require OTP verification
                  </Label>
                </div>
                <Switch
                  id="otp"
                  checked={otpRequired}
                  onCheckedChange={setOtpRequired}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isGenerating ? 'Generating…' : 'Generate link'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-[#F5F6FA] p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Client portal URL
                </p>
                <code className="block truncate rounded-lg bg-card px-3 py-2 text-sm">
                  {generatedUrl}
                </code>
              </div>
              <Button
                className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleCopy}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </Button>
              <Button variant="outline" className="w-full" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
