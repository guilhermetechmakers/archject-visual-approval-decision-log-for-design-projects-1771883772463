import { Link } from 'react-router-dom'
import {
  CheckCircle,
  MessageSquare,
  Upload,
  RefreshCw,
  FilePlus,
  Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecentActivity, ActivityType } from '@/types/dashboard'

export interface ActivityItemProps {
  activity: RecentActivity
  className?: string
}

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  approval: CheckCircle,
  comment: MessageSquare,
  upload: Upload,
  status_change: RefreshCw,
  decision_created: FilePlus,
  link_shared: Link2,
}

const activityColors: Record<ActivityType, string> = {
  approval: 'text-success',
  comment: 'text-primary',
  upload: 'text-primary',
  status_change: 'text-warning-muted',
  decision_created: 'text-primary',
  link_shared: 'text-primary',
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString()
}

export function ActivityItem({ activity, className }: ActivityItemProps) {
  const Icon = activityIcons[activity.type] ?? activityIcons.comment
  const colorClass = activityColors[activity.type] ?? 'text-primary'

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/50',
        className
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10',
          colorClass
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">{activity.summary}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {activity.actor && <span>{activity.actor}</span>}
          <span>•</span>
          <span>{formatTimestamp(activity.timestamp)}</span>
        </div>
      </div>
    </div>
  )

  if (activity.decision_id) {
    return (
      <Link to={`/dashboard/decisions/${activity.decision_id}`}>
        {content}
      </Link>
    )
  }

  if (activity.project_id) {
    return (
      <Link to={`/dashboard/projects?project=${activity.project_id}`}>
        {content}
      </Link>
    )
  }

  return content
}
