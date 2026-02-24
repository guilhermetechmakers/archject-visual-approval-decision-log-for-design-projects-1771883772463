/**
 * Projects Page - Project & Workspace Management
 * Lists active projects with status chips, storage usage, and quick actions
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderKanban, Search, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjects, useWorkspaces } from '@/hooks/use-projects'
import { cn } from '@/lib/utils'

function formatStorage(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ProjectsEmptyState({
  hasSearchQuery,
  onClearSearch,
}: {
  hasSearchQuery: boolean
  onClearSearch: () => void
}) {
  return (
    <Card
      className="rounded-2xl border border-dashed border-border bg-card shadow-card overflow-hidden"
      role="status"
      aria-label={hasSearchQuery ? 'No projects match your search' : 'No projects yet'}
    >
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <FolderKanban className="h-8 w-8 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          {hasSearchQuery ? 'No projects match your search' : 'No projects yet'}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {hasSearchQuery
            ? 'Try a different search term or clear your search to see all projects.'
            : 'Create your first project to start managing design decisions and approvals.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          {!hasSearchQuery && (
            <Button asChild className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link to="/dashboard/projects/new" aria-label="Create your first project">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Create project
              </Link>
            </Button>
          )}
          {hasSearchQuery && (
            <Button
              variant="outline"
              onClick={onClearSearch}
              className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Clear search to show all projects"
            >
              Clear search
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card
      className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden"
      role="alert"
      aria-label="Failed to load projects"
    >
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Failed to load projects
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your projects. Please try again.
        </p>
        <Button
          variant="outline"
          onClick={onRetry}
          className="mt-6 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Retry loading projects"
        >
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: projects = [], isLoading, isError, refetch } = useProjects()
  const { data: workspaces = [] } = useWorkspaces()

  const filteredProjects = searchQuery.trim()
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects

  if (isLoading) {
    return <ProjectsPageSkeleton />
  }

  if (isError) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        </div>
        <ProjectsErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <Button asChild className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Link to="/dashboard/projects/new" aria-label="Create new project">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            New project
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search projects…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-lg border-border bg-input"
          aria-label="Search projects"
          aria-describedby="search-projects-description"
        />
        <span id="search-projects-description" className="sr-only">
          Filter projects by name
        </span>
      </div>

      {filteredProjects.length === 0 ? (
        <ProjectsEmptyState
          hasSearchQuery={!!searchQuery.trim()}
          onClearSearch={() => setSearchQuery('')}
        />
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Projects list"
        >
          {filteredProjects.map((project) => {
            const usageBytes = project.usage?.storage_bytes ?? 0
            const quotaBytes = project.quota?.storage_bytes ?? 1073741824
            const usagePercent = quotaBytes > 0 ? Math.round((usageBytes / quotaBytes) * 100) : 0
            const decisionsCount = project.usage?.decision_count ?? 0
            const workspaceName = workspaces.find((w) => w.id === project.workspace_id)?.name ?? ''

            return (
              <Link
                key={project.id}
                to={`/dashboard/projects/${project.id}`}
                className="block transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-2xl"
                aria-label={`View project ${project.name}`}
                role="listitem"
              >
                <Card
                  className={cn(
                    'h-full rounded-2xl border border-border shadow-card transition-all duration-200',
                    'hover:shadow-card-hover hover:bg-muted/30'
                  )}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <FolderKanban className="h-6 w-6 text-primary" aria-hidden />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={project.status === 'active' ? 'default' : 'secondary'}
                          className={cn(
                            'rounded-full',
                            project.status === 'active' && 'bg-primary text-primary-foreground'
                          )}
                        >
                          {project.status}
                        </Badge>
                        {usagePercent >= 80 && (
                          <Badge variant="warning" className="rounded-full text-xs">
                            {usagePercent}% storage
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{project.name}</h3>
                    {workspaceName && (
                      <p className="mt-1 text-xs text-muted-foreground">{workspaceName}</p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{decisionsCount} decisions</span>
                      <span>{formatStorage(usageBytes)} used</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ProjectsPageSkeleton() {
  return (
    <div
      className="space-y-8 animate-fade-in"
      role="status"
      aria-busy="true"
      aria-label="Loading projects"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
      <span className="sr-only">Loading projects, please wait…</span>
    </div>
  )
}
