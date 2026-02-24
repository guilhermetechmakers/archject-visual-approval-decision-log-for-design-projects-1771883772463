/**
 * Internal Decision Redirect Page
 * Route: /internal/decisions/:decisionId
 * Fetches decision to get projectId, then redirects to dashboard internal view.
 */

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useDecisionDetail } from '@/hooks/use-decision-detail'

export function InternalDecisionRedirectPage() {
  const { decisionId } = useParams<{ decisionId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useDecisionDetail(decisionId ?? undefined)

  useEffect(() => {
    if (!decisionId) return
    if (error) {
      navigate('/404', { replace: true })
      return
    }
    if (data?.decision?.projectId) {
      navigate(
        `/dashboard/projects/${data.decision.projectId}/decisions/${decisionId}/internal`,
        { replace: true }
      )
    }
  }, [decisionId, data, error, navigate])

  if (!decisionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Invalid decision ID</p>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading decision...</p>
      </div>
    )
  }

  return null
}
