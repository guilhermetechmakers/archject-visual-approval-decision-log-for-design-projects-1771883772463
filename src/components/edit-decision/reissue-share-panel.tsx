import { useState } from 'react'
import { Link2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CollapsibleSection } from './collapsible-section'
import { cn } from '@/lib/utils'
import type { ShareLink } from '@/types/edit-decision'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface ReissueSharePanelProps {
  shareLink: ShareLink | null
  generatedUrl?: string | null
  isGenerating?: boolean
  onGenerate: (options: {
    expires_at?: string
    access_scope?: 'read' | 'read_write'
    read_only?: boolean
  }) => Promise<void>
  onCopy?: (url: string) => void
  className?: string
}

export function ReissueSharePanel({
  shareLink,
  generatedUrl,
  isGenerating = false,
  onGenerate,
  onCopy,
  className,
}: ReissueSharePanelProps) {
  const [expiresAt, setExpiresAt] = useState('')
  const [readOnly, setReadOnly] = useState(true)
  const [copied, setCopied] = useState(false)

  const displayUrl = generatedUrl ?? shareLink?.url

  const handleGenerate = async () => {
    await onGenerate({
      expires_at: expiresAt || undefined,
      access_scope: readOnly ? 'read' : 'read_write',
      read_only: readOnly,
    })
  }

  const handleCopy = () => {
    if (!displayUrl) return
    navigator.clipboard.writeText(displayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.(displayUrl)
  }

  const isExpired = shareLink?.expires_at
    ? new Date(shareLink.expires_at) < new Date()
    : false

  return (
    <CollapsibleSection
      title="Reissue Share Link"
      defaultOpen={false}
      className={className}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expires">Expiry date</Label>
            <Input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              aria-describedby="expires-desc"
            />
            <p id="expires-desc" className="text-xs text-muted-foreground">
              Leave empty for no expiry.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="read-only">Read-only access</Label>
              <p className="text-xs text-muted-foreground">
                Client can view but not approve or comment.
              </p>
            </div>
            <Switch
              id="read-only"
              checked={readOnly}
              onCheckedChange={setReadOnly}
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
        >
          <Link2 className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate new link'}
        </Button>

        {displayUrl && (
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
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {shareLink?.expires_at && (
              <p
                className={cn(
                  'text-sm',
                  isExpired ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                Expires: {formatDate(shareLink.expires_at)}
                {isExpired && ' (expired)'}
              </p>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}
