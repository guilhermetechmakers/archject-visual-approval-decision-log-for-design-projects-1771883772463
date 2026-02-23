import { Link } from 'react-router-dom'
import { FolderKanban, FileCheck, FileStack, HardDrive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { UsageSnapshot } from '@/types/dashboard'

export interface UsageSnapshotCardProps {
  usage: UsageSnapshot
  className?: string
}

function formatStorage(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${Math.round(mb)} MB`
}

export function UsageSnapshotCard({ usage, className }: UsageSnapshotCardProps) {
  const storagePercent = usage.storage_quota > 0
    ? Math.min(100, (usage.storage_used / usage.storage_quota) * 100)
    : 0
  const isNearLimit = storagePercent >= 80

  const metrics = [
    {
      label: 'Projects',
      value: usage.projects_count,
      icon: FolderKanban,
    },
    {
      label: 'Decisions',
      value: usage.decisions_count,
      icon: FileCheck,
    },
    {
      label: 'Files',
      value: usage.files_count,
      icon: FileStack,
    },
    {
      label: 'Storage',
      value: `${formatStorage(usage.storage_used)} / ${formatStorage(usage.storage_quota)}`,
      icon: HardDrive,
    },
  ]

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Usage snapshot</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current workspace usage
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.label}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Storage usage</span>
            <span className={cn(isNearLimit && 'font-medium text-destructive')}>
              {formatStorage(usage.storage_used)} / {formatStorage(usage.storage_quota)}
            </span>
          </div>
          <Progress
            value={storagePercent}
            className={cn(
              'mt-2 h-2',
              isNearLimit && '[&>div]:bg-destructive'
            )}
          />
        </div>

        {isNearLimit && (
          <Link to="/dashboard/billing">
            <Button variant="outline" className="w-full">
              Upgrade storage
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
