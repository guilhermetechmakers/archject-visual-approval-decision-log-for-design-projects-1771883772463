import { Link } from 'react-router-dom'
import {
  Share2,
  FileDown,
  MoreHorizontal,
  FolderKanban,
  FileText,
  HardDrive,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/workspace'

export interface ProjectHeaderProps {
  project: Project
  onShareClientPortal?: () => void
  onExportDecisionLog?: () => void
  onEditBranding?: () => void
  className?: string
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

export function ProjectHeader({
  project,
  onShareClientPortal,
  onExportDecisionLog,
  onEditBranding,
  className,
}: ProjectHeaderProps) {
  const storagePercent =
    project.storage_quota_bytes > 0
      ? Math.round((project.current_storage_bytes / project.storage_quota_bytes) * 100)
      : 0

  return (
    <header
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-200',
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2"
            style={{
              borderColor: project.branding_color ?? 'rgb(25, 92, 74)',
              backgroundColor: `${project.branding_color ?? '#195C4A'}15`,
            }}
          >
            {project.branding_logo_url ? (
              <img
                src={project.branding_logo_url}
                alt=""
                className="h-8 w-8 object-contain"
              />
            ) : (
              <FolderKanban
                className="h-7 w-7"
                style={{ color: project.branding_color ?? 'rgb(25, 92, 74)' }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {project.name}
              </h1>
              <Badge
                variant={
                  project.status === 'active'
                    ? 'success'
                    : project.status === 'archived'
                      ? 'secondary'
                      : 'warning'
                }
              >
                {project.status}
              </Badge>
            </div>
            {project.client_name && (
              <p className="mt-1 text-sm text-muted-foreground">
                Client: {project.client_name}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Decisions
              </span>
              <span className="flex items-center gap-1.5">
                <HardDrive className="h-4 w-4" />
                {formatBytes(project.current_storage_bytes)} /{' '}
                {formatBytes(project.storage_quota_bytes)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={onShareClientPortal}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share client portal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportDecisionLog}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Decision Log
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditBranding}>
                Edit branding
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/projects/${project.id}/settings`}>
                  Project settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {storagePercent >= 80 && (
        <div className="mt-4 rounded-lg bg-warning/20 px-4 py-2 text-sm text-foreground">
          Storage at {storagePercent}% — consider upgrading your plan.
        </div>
      )}
    </header>
  )
}
