/**
 * Impersonation Banner - visible when admin is in impersonation mode.
 * Shows target workspace, revoke button, and audit notice.
 */

import { UserCog, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImpersonationOptional } from '@/contexts/impersonation-context'
import { useImpersonationRevoke } from '@/hooks/use-admin'
import { cn } from '@/lib/utils'

export function ImpersonationBanner() {
  const impersonation = useImpersonationOptional()
  const revokeMutation = useImpersonationRevoke()

  if (!impersonation?.isImpersonating || !impersonation.session) return null

  const { session, clearSession } = impersonation

  const handleRevoke = () => {
    revokeMutation.mutate(undefined, {
      onSettled: () => clearSession(),
    })
  }

  return (
    <div
      role="banner"
      aria-live="polite"
      className={cn(
        'flex items-center justify-between gap-4 bg-warning/20 border-b border-warning/40 px-4 py-2 text-sm',
        'animate-fade-in'
      )}
    >
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4 text-warning" aria-hidden />
        <span className="font-medium text-foreground">
          Impersonating: <strong>{session.workspaceName}</strong>
        </span>
        <span className="text-muted-foreground">
          (ID: {session.workspaceId})
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRevoke}
        disabled={revokeMutation.isPending}
        className="rounded-full border-warning/60 hover:bg-warning/10"
        aria-label="End impersonation"
      >
        <X className="mr-1 h-4 w-4" />
        {revokeMutation.isPending ? 'Ending...' : 'End Impersonation'}
      </Button>
    </div>
  )
}
