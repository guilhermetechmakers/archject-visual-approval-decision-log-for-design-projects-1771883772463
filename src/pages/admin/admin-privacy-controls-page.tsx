/**
 * Admin Privacy Controls - data masking, export scope, governance notes.
 */

import * as React from 'react'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrivacyControls } from '@/hooks/use-governance'
import { useAdminWorkspaces } from '@/hooks/use-admin'
import { PrivacyControlsEditor } from '@/components/admin/privacy-controls-editor'
import { cn } from '@/lib/utils'

export function AdminPrivacyControlsPage() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null)
  const { data: workspaces = [] } = useAdminWorkspaces()
  const { data: privacyControl, isLoading, error, refetch } = usePrivacyControls(
    selectedWorkspaceId ?? undefined
  )

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
              <Shield className="h-5 w-5 text-primary" />
              Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {workspaces.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWorkspaceId(w.id)}
                  className={cn(
                    'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50',
                    selectedWorkspaceId === w.id && 'bg-primary/10 text-primary font-medium'
                  )}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {!selectedWorkspaceId ? (
            <Card className="rounded-xl border border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Select a workspace to view and edit privacy controls
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : error ? (
            <Card className="rounded-xl border border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Failed to load privacy controls</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <PrivacyControlsEditor
              workspaceId={selectedWorkspaceId}
              initialData={privacyControl ?? undefined}
              onSaved={() => refetch()}
            />
          )}
        </div>
      </div>
    </div>
  )
}
