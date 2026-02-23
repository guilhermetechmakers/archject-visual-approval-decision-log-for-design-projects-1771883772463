import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DecisionsListContainer } from '@/components/decisions-list'
import { useProjectWorkspace } from '@/hooks/use-workspace'

export function DecisionsListPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { project } = useProjectWorkspace(projectId ?? '')

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

  return (
    <div className="animate-fade-in">
      <DecisionsListContainer
        projectId={projectId}
        projectName={project?.name}
      />
    </div>
  )
}
