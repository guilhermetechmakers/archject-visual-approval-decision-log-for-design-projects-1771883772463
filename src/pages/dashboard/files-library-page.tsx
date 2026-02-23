import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilesLibraryView } from '@/components/files-library'
import { useProjectWorkspace } from '@/hooks/use-workspace'

export function FilesLibraryPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { project } = useProjectWorkspace(projectId ?? '')

  const storagePercent = project
    ? Math.round(
        (project.current_storage_bytes / project.storage_quota_bytes) * 100
      )
    : 0

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
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
