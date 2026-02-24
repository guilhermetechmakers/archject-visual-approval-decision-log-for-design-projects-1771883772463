/**
 * Projects Page - Project & Workspace Management
 * Lists active projects with status chips, storage usage, and quick actions
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderKanban, Search } from 'lucide-react'
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

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: projects = [], isLoading } = useProjects()
  const { data: workspaces = [] } = useWorkspaces()

  const filteredProjects = searchQuery.trim()
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects

  if (isLoading) {
    return <ProjectsPageSkeleton />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <Link to="/dashboard/projects/new">
          <Button
            className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
            size="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            New project
          </Button>
        </Link>
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
          className="pl-9 rounded-lg bg-input border-border"
          aria-label="Search projects"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="rounded-2xl border border-border shadow-card overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {searchQuery.trim() ? 'No projects match your search' : 'No projects yet'}
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'Create your first project to start managing design decisions and approvals'}
            </p>
            {!searchQuery.trim() && (
              <Link to="/dashboard/projects/new" className="mt-6">
                <Button
                  className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                  size="default"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                className="block transition-transform hover:scale-[1.01]"
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
                        <FolderKanban className="h-6 w-6 text-primary" />
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
