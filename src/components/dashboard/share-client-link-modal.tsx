/**
 * ShareClientLinkModal - Generate client-facing no-login link with expiration
 * Used from Dashboard and Project Workspace
 */

import { useState } from 'react'
import { Copy, Link2, Shield } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjects } from '@/hooks/use-projects'
import { useCreateClientLink } from '@/hooks/use-workspace'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface ShareClientLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
}

export function ShareClientLinkModal({
  open,
  onOpenChange,
  defaultProjectId,
}: ShareClientLinkModalProps) {
  const [projectId, setProjectId] = useState(defaultProjectId ?? '')
  const [expiresAt, setExpiresAt] = useState('')
  const [otpRequired, setOtpRequired] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

  const { data: projects = [] } = useProjects()
  const createLinkMutation = useCreateClientLink(projectId)

  const handleGenerate = async () => {
    if (!projectId) {
      toast.error('Select a project first')
      return
    }
    try {
      const result = await createLinkMutation.mutateAsync({
        expires_at: expiresAt || undefined,
        otp_required: otpRequired,
      })
      const baseUrl = window.location.origin
      setGeneratedUrl(result.url ?? `${baseUrl}/portal/${result.id ?? 'link'}`)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      toast.success('Link copied to clipboard')
    }
  }

  const handleClose = () => {
    setProjectId(defaultProjectId ?? '')
    setExpiresAt('')
    setOtpRequired(false)
    setGeneratedUrl(null)
    onOpenChange(false)
  }

  const activeProjects = projects.filter((p) => p.status === 'active')

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share client link
          </DialogTitle>
          <DialogDescription>
            Generate a secure no-login link for clients to review and approve decisions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={projectId}
              onValueChange={(v) => {
                setProjectId(v)
                setGeneratedUrl(null)
              }}
            >
              <SelectTrigger className="rounded-lg bg-input">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {activeProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
                {activeProjects.length === 0 && (
                  <SelectItem value="__none__" disabled>
                    No projects
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires-at">Expires at (optional)</Label>
            <Input
              id="expires-at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-lg bg-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="otp-required"
              checked={otpRequired}
              onChange={(e) => setOtpRequired(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="otp-required" className="flex items-center gap-1.5 font-normal">
              <Shield className="h-4 w-4" />
              Require OTP verification
            </Label>
          </div>

          {generatedUrl && (
            <div
              className={cn(
                'rounded-lg border border-border bg-secondary/50 p-4',
                'animate-fade-in'
              )}
            >
              <p className="mb-2 text-sm font-medium text-muted-foreground">Generated link</p>
              <code className="block truncate rounded bg-background px-2 py-1.5 text-xs">
                {generatedUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleCopy}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {generatedUrl ? 'Done' : 'Cancel'}
          </Button>
          {!generatedUrl && (
            <Button
              onClick={handleGenerate}
              disabled={!projectId || createLinkMutation.isPending}
            >
              {createLinkMutation.isPending ? 'Generating…' : 'Generate link'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
