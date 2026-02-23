import { Image } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/workspace'

export interface OverviewCardProps {
  project: Project
  decisionsCount?: number
  filesCount?: number
  templatesUsed?: number
  className?: string
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

export function OverviewCard({
  project,
  decisionsCount = 0,
  filesCount = 0,
  templatesUsed = 0,
  className,
}: OverviewCardProps) {
  const storagePercent =
    project.storage_quota_bytes > 0
      ? Math.round((project.current_storage_bytes / project.storage_quota_bytes) * 100)
      : 0

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div
        className="h-1.5"
        style={{ backgroundColor: project.branding_color ?? 'rgb(25, 92, 74)' }}
        aria-hidden
      />
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Project overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 bg-secondary/50"
            style={{ borderColor: project.branding_color ?? 'rgb(25, 92, 74)' }}
          >
            {project.branding_logo_url ? (
              <img
                src={project.branding_logo_url}
                alt={`${project.name} logo`}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <Image className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {project.branding_color ? (
                <span
                  className="inline-block h-4 w-4 rounded-full border border-border"
                  style={{ backgroundColor: project.branding_color }}
                  title="Accent color"
                />
              ) : (
                'Default branding'
              )}{' '}
              Accent color
            </p>
            <p className="text-xs text-muted-foreground">
              {project.domain_prefix
                ? `Client prefix: ${project.domain_prefix}`
                : 'No custom domain'}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Storage</span>
            <span className="font-medium">
              {formatBytes(project.current_storage_bytes)} /{' '}
              {formatBytes(project.storage_quota_bytes)}
            </span>
          </div>
          <Progress value={storagePercent} className="mt-2 h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Decisions</p>
            <p className="font-semibold">{decisionsCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Files</p>
            <p className="font-semibold">{filesCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Templates used</p>
            <p className="font-semibold">{templatesUsed}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Deadline</p>
            <p className="font-semibold">
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>

        {project.client_name && (
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <p className="text-xs text-muted-foreground">Client</p>
            <p className="font-medium">{project.client_name}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
