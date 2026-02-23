import { Image } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Project, Branding } from '@/types/team'

export interface BrandingPreviewCardProps {
  project: Project
  branding?: Branding | null
  className?: string
}

export function BrandingPreviewCard({
  project,
  branding,
  className,
}: BrandingPreviewCardProps) {
  const accentColor = branding?.colorScheme ?? 'rgb(25, 92, 74)'

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div
        className="h-2"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/50"
            style={{ borderColor: accentColor }}
          >
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={`${project.name} logo`}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <Image className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Project branding</p>
            <p className="text-xs text-muted-foreground">
              {project.currentStorageUsed} / {project.storageQuota} MB used
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
