/**
 * Recovery codes - regenerate (one-time display; no view endpoint)
 */

import * as React from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
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
import { useTwoFARegenerateRecoveryCodes } from '@/hooks/use-two-fa'
import { toast } from 'sonner'

export function TwoFARecoveryCodes() {
  const regenerateMutation = useTwoFARegenerateRecoveryCodes()
  const [codes, setCodes] = React.useState<string[] | null>(null)
  const [showCodesDialog, setShowCodesDialog] = React.useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = React.useState(false)
  const [password, setPassword] = React.useState('')
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

  const handleRegenerate = async () => {
    if (!password.trim()) return
    try {
      const res = await regenerateMutation.mutateAsync(password) as { codes: string[] }
      setCodes(res.codes ?? [])
      setShowRegenerateDialog(false)
      setShowCodesDialog(true)
      setPassword('')
      toast.success('Recovery codes regenerated. Save them securely.')
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Failed to regenerate')
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success('Copied')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Recovery codes</p>
      <p className="text-xs text-muted-foreground">
        Each code can be used once to recover access. Save them in a secure place.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowRegenerateDialog(true)}
          disabled={regenerateMutation.isPending}
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate codes
        </Button>
      </div>

      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerate recovery codes</DialogTitle>
            <DialogDescription>
              Enter your password to generate new codes. Old codes will no longer work.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="regen-pwd" className="text-sm font-medium">Password</label>
              <Input
                id="regen-pwd"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={regenerateMutation.isPending || !password.trim()}
            >
              {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCodesDialog} onOpenChange={setShowCodesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recovery codes</DialogTitle>
            <DialogDescription>
              Save these in a secure place. Each can be used once to recover access.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {codes?.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 font-mono text-sm">
                <span>{c}</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => copyToClipboard(c, i)}>
                  {copiedIndex === i ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => codes && copyToClipboard(codes.join('\n'), -1)}>
              Copy all
            </Button>
            <Button onClick={() => setShowCodesDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
