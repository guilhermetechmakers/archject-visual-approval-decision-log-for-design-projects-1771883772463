/**
 * Admin Privacy Controls - data masking, export scope, governance notes.
 * Design: card-based, design tokens, empty/loading/error states, accessible controls.
 */

import * as React from 'react'
import { Shield, AlertCircle, RefreshCw, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePrivacyControls } from '@/hooks/use-governance'
import { useAdminWorkspaces } from '@/hooks/use-admin'
import { PrivacyControlsEditor } from '@/components/admin/privacy-controls-editor'
import { cn } from '@/lib/utils'

function WorkspacesEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-12 text-center"
      role="status"
      aria-label="No workspaces available"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
        <Building2 className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">No workspaces found</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Workspaces will appear here once they are created. Create a workspace to configure privacy
        controls for data masking, export scope, and governance notes.
      </p>
    </div>
  )
}

function WorkspacesLoadingSkeleton() {
  return (
    <div className="space-y-2 p-4" role="status" aria-label="Loading workspaces">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  )
}

function WorkspacesErrorState({
  error,
  onRetry,
}: {
  error: Error | null
  onRetry: () => void
}) {
  const message =
    error?.message ?? 'Failed to load workspaces. Please check your connection and try again.'
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-8 text-center"
      role="alert"
      aria-label="Failed to load workspaces"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">Failed to load workspaces</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{message}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={onRetry}
        aria-label="Retry loading workspaces"
      >
        Retry
      </Button>
    </div>
  )
}

function PrivacyControlsErrorState({
  error,
  onRetry,
  isRetrying,
}: {
  error: Error | null
  onRetry: () => void
  isRetrying: boolean
}) {
  const message =
    error?.message ?? 'Failed to load privacy controls. Please check your connection and try again.'

  return (
    <div className="space-y-4 animate-fade-in" role="alert" aria-live="assertive">
      <Alert
        variant="destructive"
        className="border-destructive/50 bg-destructive/10 shadow-card"
      >
        <AlertCircle className="h-5 w-5" aria-hidden />
        <AlertTitle className="text-base font-semibold text-destructive">
          Unable to load privacy controls
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm text-foreground/90">
          {message}
        </AlertDescription>
      </Alert>
      <Card className="rounded-xl border border-border shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            We could not load privacy settings for this workspace
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Check your connection and try again. If the problem persists, contact support.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
            onClick={onRetry}
            disabled={isRetrying}
            aria-label={isRetrying ? 'Retrying to load privacy controls' : 'Retry loading privacy controls'}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isRetrying && 'animate-spin')}
              aria-hidden
            />
            {isRetrying ? 'Retrying…' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminPrivacyControlsPage() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null)
  const {
    data: workspaces = [],
    isLoading: workspacesLoading,
    error: workspacesError,
    refetch: refetchWorkspaces,
  } = useAdminWorkspaces()
  const {
    data: privacyControl,
    isLoading: privacyLoading,
    error: privacyError,
    refetch: refetchPrivacy,
    isFetching: isPrivacyRefetching,
  } = usePrivacyControls(selectedWorkspaceId ?? undefined)

  const isPageLoading = workspacesLoading
  const hasWorkspaces = workspaces.length > 0
  const isEmptyWorkspaces = !workspacesLoading && !workspacesError && !hasWorkspaces

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Privacy controls</h1>
        <p className="mt-1 text-muted-foreground">
          Data masking, export scope selectors, and governance notes per workspace
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover lg:col-span-1">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" aria-hidden />
              Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {workspacesLoading ? (
              <WorkspacesLoadingSkeleton />
            ) : workspacesError ? (
              <WorkspacesErrorState error={workspacesError} onRetry={() => refetchWorkspaces()} />
            ) : isEmptyWorkspaces ? (
              <WorkspacesEmptyState />
            ) : (
              <div className="divide-y divide-border">
                {workspaces.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWorkspaceId(w.id)}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      selectedWorkspaceId === w.id && 'bg-primary/10 text-primary font-medium'
                    )}
                    aria-label={`Select workspace ${w.name}`}
                    aria-pressed={selectedWorkspaceId === w.id}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {isPageLoading ? (
            <div className="space-y-4" role="status" aria-label="Loading privacy controls page">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : !selectedWorkspaceId ? (
            <Card className="rounded-xl border border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Shield className="h-6 w-6 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">
                  {isEmptyWorkspaces
                    ? 'No workspaces to configure'
                    : 'Select a workspace to view and edit privacy controls'}
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {isEmptyWorkspaces
                    ? 'Create a workspace first to configure data masking, export scope, and governance notes.'
                    : 'Choose a workspace from the list to configure data masking, export scope, and governance notes.'}
                </p>
              </CardContent>
            </Card>
          ) : privacyError ? (
            <PrivacyControlsErrorState
              error={privacyError}
              onRetry={() => refetchPrivacy()}
              isRetrying={isPrivacyRefetching}
            />
          ) : privacyLoading ? (
            <div className="space-y-4" role="status" aria-label="Loading privacy controls">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : (
            <PrivacyControlsEditor
              workspaceId={selectedWorkspaceId}
              initialData={privacyControl ?? undefined}
              onSaved={() => refetchPrivacy()}
            />
          )}
        </div>
      </div>
    </div>
  )
}
