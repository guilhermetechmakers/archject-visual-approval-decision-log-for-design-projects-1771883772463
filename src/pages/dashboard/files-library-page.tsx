import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FilesLibraryView } from '@/components/files-library'
import { useProjectWorkspace } from '@/hooks/use-workspace'

export function FilesLibraryPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { project, isLoading, error, refetch } = useProjectWorkspace(
    projectId ?? ''
  )

  const storagePercent = project
    ? Math.round(
        (project.current_storage_bytes / project.storage_quota_bytes) * 100
      )
    : 0

  if (!projectId) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16"
        role="alert"
        aria-label="Project not found"
      >
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link
            to="/dashboard/projects"
            aria-label="Back to projects list"
          >
            <ChevronLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to projects
          </Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-9 w-40" aria-hidden />
        <div className="space-y-6">
          <Skeleton className="h-[180px] w-full rounded-xl" aria-hidden />
          <Skeleton className="h-10 w-full max-w-md" aria-hidden />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-32 w-full" aria-hidden />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" aria-hidden />
                    <Skeleton className="h-3 w-1/2" aria-hidden />
                    <Skeleton className="h-3 w-1/3" aria-hidden />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to load project'
    return (
      <div className="space-y-6 animate-fade-in">
        <Button asChild variant="ghost" size="sm">
          <Link
            to={`/dashboard/projects/${projectId}`}
            aria-label="Back to project workspace"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Project Workspace
          </Link>
        </Button>
        <Card
          className="border-destructive/30 bg-destructive/5"
          role="alert"
          aria-label="Failed to load files library"
        >
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle
                className="h-7 w-7 text-destructive"
                aria-hidden
              />
            </div>
            <h2 className="mt-6 text-lg font-semibold text-foreground">
              Unable to load files library
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {errorMessage}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Please check your connection and try again.
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-lg"
              onClick={() => refetch()}
              aria-label="Retry loading files library"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link
            to={`/dashboard/projects/${projectId}`}
            aria-label="Back to project workspace"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Project Workspace
          </Link>
        </Button>
      </div>

      <FilesLibraryView
        storageUsedPercent={storagePercent}
        showFullLibraryLink={false}
      />
    </div>
  )
}
