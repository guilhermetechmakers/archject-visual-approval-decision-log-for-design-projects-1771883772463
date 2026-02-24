/**
 * Internal Decision Redirect Page
 * Route: /internal/decisions/:decisionId
 * Fetches decision to get projectId, then redirects to dashboard internal view.
 * Includes inline error feedback, skeleton loading, and accessibility improvements.
 */

import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useDecisionDetail } from '@/hooks/use-decision-detail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ApiError } from '@/lib/api'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  const apiErr = error as ApiError | undefined
  if (apiErr?.message) return apiErr.message
  return 'Something went wrong. Please try again.'
}

function InvalidDecisionState() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-muted/30 p-4"
      role="alert"
      aria-live="polite"
      aria-label="Invalid decision"
    >
      <Card className="w-full max-w-md border-border shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10"
            aria-hidden
          >
            <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-foreground">
            Invalid decision
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The decision link is invalid or missing. Please check the URL or return to the dashboard.
          </p>
          <Button
            asChild
            variant="default"
            size="lg"
            className="mt-6 rounded-pill"
            aria-label="Return to dashboard"
          >
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Return to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div
      className="flex min-h-screen flex-col bg-muted/30 p-4 sm:p-6 md:p-8"
      role="status"
      aria-busy="true"
      aria-label="Loading decision"
    >
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-3/4 max-w-xs" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-muted/30 p-4"
      role="alert"
      aria-live="assertive"
      aria-label="Failed to load decision"
    >
      <Card
        className="w-full max-w-md border-destructive/30 bg-destructive/5 shadow-card"
        role="alert"
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10"
            aria-hidden
          >
            <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-foreground">
            Failed to load decision
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="lg"
              className="rounded-pill transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={onRetry}
              aria-label="Retry loading decision"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
              Retry
            </Button>
            <Button
              asChild
              variant="default"
              size="lg"
              className="rounded-pill"
              aria-label="Return to dashboard"
            >
              <Link to="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function InternalDecisionRedirectPage() {
  const { decisionId } = useParams<{ decisionId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useDecisionDetail(decisionId ?? undefined)

  useEffect(() => {
    if (!decisionId) return
    if (error) return
    if (data?.decision?.projectId) {
      navigate(
        `/dashboard/projects/${data.decision.projectId}/decisions/${decisionId}/internal`,
        { replace: true }
      )
    }
  }, [decisionId, data, error, navigate])

  if (!decisionId) {
    return <InvalidDecisionState />
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
      />
    )
  }

  if (isLoading || !data) {
    return <LoadingSkeleton />
  }

  return null
}
