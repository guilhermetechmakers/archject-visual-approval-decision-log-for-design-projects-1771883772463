import { Link } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ProjectWorkspaceLinkProps {
  projectId: string
  label?: string
  className?: string
}

export function ProjectWorkspaceLink({
  projectId,
  label = 'Project Workspace',
  className,
}: ProjectWorkspaceLinkProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn('text-muted-foreground', className)}
    >
      <Link to={`/dashboard/projects/${projectId}`}>
        <LayoutDashboard className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}
