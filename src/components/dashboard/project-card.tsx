import { Link } from 'react-router-dom'
import { FolderKanban, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { DashboardProject } from '@/types/dashboard'

export interface ProjectCardProps {
  project: DashboardProject
  className?: string
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString()
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const lastActivity = formatRelativeTime(project.last_activity)

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              {project.branding?.thumbnail ? (
                <img
                  src={project.branding.thumbnail}
                  alt=""
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <FolderKanban className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                to={`/dashboard/projects/${project.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {project.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {project.active_decisions_count} active decision
                {project.active_decisions_count !== 1 ? 's' : ''}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last activity {lastActivity}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-70 group-hover:opacity-100"
                aria-label="Project actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/projects/${project.id}`}>
                  Open workspace
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/projects/${project.id}`}>
                  Project settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="mt-2 h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
