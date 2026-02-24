import { Link, useOutletContext } from 'react-router-dom'
import {
  FileText,
  FolderKanban,
  Plus,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardData } from '@/hooks/use-dashboard'
import { cn } from '@/lib/utils'

interface DashboardOutletContext {
  workspaceId?: string | null
}

export function CreateDecisionPlaceholder() {
  const { workspaceId } = (useOutletContext() ?? {}) as DashboardOutletContext
  const { data, isLoading, error, refetch, isRefetching } = useDashboardData(
    workspaceId ?? undefined
  )

  const projects = data?.projects ?? []

  if (isLoading) {
    return <CreateDecisionLoadingState />
  }

  if (error) {
    return (
      <CreateDecisionErrorState
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    )
  }

  if (projects.length === 0) {
    return <CreateDecisionEmptyState />
  }

  return (
    <div className="space-y-6 animate-fade-in md:space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Create decision
        </h1>
        <p className="text-muted-foreground">
          Select a project to create a new decision with metadata, options, and
          side-by-side comparison.
        </p>
      </header>

      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText
              className="h-5 w-5 text-primary"
              aria-hidden
            />
            Choose a project
          </CardTitle>
          <CardDescription>
            Decisions are created within projects. Select a project below to
            add metadata, upload options, and build your side-by-side preview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/dashboard/projects/${project.id}/decisions/new`}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg border border-border bg-card p-4',
                    'transition-all duration-200 hover:border-primary/30 hover:shadow-card',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <FolderKanban
                      className="h-5 w-5 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground group-hover:text-primary">
                      {project.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {project.active_decisions_count} active decision
                      {project.active_decisions_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="rounded-pill"
            >
              <Link to="/dashboard/projects">
                <FolderKanban className="mr-2 h-4 w-4" aria-hidden />
                View all projects
              </Link>
            </Button>
            <Button
              asChild
              variant="default"
              className="rounded-pill"
            >
              <Link to="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                New project
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateDecisionLoadingState() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>

      <Card>
        <CardHeader className="space-y-2 pb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-20 w-full rounded-lg"
              />
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-10 w-36 rounded-pill" />
            <Skeleton className="h-10 w-32 rounded-pill" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateDecisionErrorState({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void
  isRetrying: boolean
}) {
  return (
    <div className="space-y-6 md:space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Create decision
        </h1>
      </header>

      <Card className="border-destructive/30">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertCircle
              className="h-5 w-5 shrink-0"
              aria-hidden
            />
            Unable to load projects
          </CardTitle>
          <CardDescription>
            We couldn&apos;t load your projects. Please check your connection
            and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={onRetry}
            disabled={isRetrying}
            className="rounded-pill"
          >
            {isRetrying ? (
              <RefreshCw
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden
              />
            ) : (
              <RefreshCw
                className="mr-2 h-4 w-4"
                aria-hidden
              />
            )}
            {isRetrying ? 'Retrying…' : 'Try again'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateDecisionEmptyState() {
  return (
    <div className="space-y-6 md:space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Create decision
        </h1>
        <p className="text-muted-foreground">
          Decisions are created within projects. Create a project first to get
          started.
        </p>
      </header>

      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <FolderKanban
              className="h-8 w-8 text-muted-foreground"
              aria-hidden
            />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            No projects yet
          </h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Create your first project to start adding decisions with metadata,
            options, and side-by-side comparisons.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="default"
              className="rounded-pill"
            >
              <Link to="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Create project
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-pill"
            >
              <Link to="/dashboard/projects">
                <FolderKanban className="mr-2 h-4 w-4" aria-hidden />
                Browse projects
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
