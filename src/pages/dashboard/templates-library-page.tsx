import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TemplatesLibrary } from '@/components/workspace'
import { useProjectWorkspace } from '@/hooks/use-workspace'

export function TemplatesLibraryPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { project, templates, isLoading } = useProjectWorkspace(projectId ?? '')

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !project) {
    return <TemplatesLibrarySkeleton />
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Projects
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}`}>{project.name}</Link>
        </Button>
      </div>

      <TemplatesLibrary
        templates={templates}
        projectId={projectId}
        onApplyTemplate={(templateId) => {
          navigate(`/dashboard/projects/${projectId}/decisions/new`, {
            state: { templateId },
          })
        }}
      />
    </div>
  )
}

function TemplatesLibrarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-xs rounded-lg" />
        <Skeleton className="h-10 w-[140px] rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
