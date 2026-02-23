import { useState } from 'react'
import { Link2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface ShareLinkManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  decisionId?: string
  decisionTitle?: string
  existingUrl?: string | null
  linkStatus?: 'active' | 'expired' | null
  onGenerate?: (options?: { expiresAt?: string }) => Promise<string>
  onCopy?: (url: string) => void
  className?: string
}

export function ShareLinkManager({
  open,
  onOpenChange,
  decisionId,
  decisionTitle,
  existingUrl,
  linkStatus,
  onGenerate,
  onCopy,
  className,
}: ShareLinkManagerProps) {
  const [url, setUrl] = useState(existingUrl ?? '')
  const [expiresAt, setExpiresAt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const displayUrl = url || existingUrl

  const handleGenerate = async () => {
    if (!onGenerate) {
      const mockUrl = `https://app.archject.com/portal/${decisionId ?? 'mock'}-${Date.now()}`
      setUrl(mockUrl)
      toast.success('Share link created')
      return
    }
    setIsGenerating(true)
    try {
      const newUrl = await onGenerate({ expiresAt: expiresAt || undefined })
      setUrl(newUrl)
      toast.success('Share link created')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    const toCopy = displayUrl || url
    if (!toCopy) return
    navigator.clipboard.writeText(toCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.(toCopy)
    toast.success('Link copied to clipboard')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Client share link
          </DialogTitle>
          <DialogDescription>
            {decisionTitle
              ? `Generate a shareable link for "${decisionTitle}"`
              : 'Generate a shareable link for this decision.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {displayUrl ? (
            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={displayUrl}
                  className="font-mono text-sm"
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
              {linkStatus === 'expired' && (
                <p className="text-sm text-warning">
                  This link has expired. Generate a new one to share.
                </p>
              )}
            </div>
          ) : null}
          {(!displayUrl || linkStatus === 'expired') && (
            <div className="space-y-2">
              <Label htmlFor="expires">Expires (optional)</Label>
              <Input
                id="expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {(!displayUrl || linkStatus === 'expired') ? (
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate link'}
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
