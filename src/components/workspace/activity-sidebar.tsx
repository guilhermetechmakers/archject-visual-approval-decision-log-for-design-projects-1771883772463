import {
  FileCheck,
  MessageSquare,
  Upload,
  Share2,
  FileText,
  UserPlus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ActivityLog, ActivityType } from '@/types/workspace'

export interface ActivitySidebarProps {
  activity: ActivityLog[]
  onFilterByType?: (type: ActivityType | null) => void
  className?: string
}

const typeIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  decision_created: FileText,
  approval: FileCheck,
  comment: MessageSquare,
  upload: Upload,
  status_change: FileText,
  link_shared: Share2,
  member_invited: UserPlus,
}

const typeLabels: Record<ActivityType, string> = {
  decision_created: 'Decision created',
  approval: 'Approval',
  comment: 'Comment',
  upload: 'File upload',
  status_change: 'Status change',
  link_shared: 'Link shared',
  member_invited: 'Member invited',
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

export function ActivitySidebar({
  activity,
  onFilterByType,
  className,
}: ActivitySidebarProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold">Activity & Audit</h3>
          <p className="text-sm text-muted-foreground">
            Recent changes and events
          </p>
        </div>
        <ScrollArea className="h-[400px]">
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">No activity yet</p>
              <p className="text-sm text-muted-foreground">
                Activity will appear here as you work.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activity.map((item) => {
                const Icon = typeIcons[item.type] ?? FileText
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onFilterByType?.(item.type)}
                    className="flex w-full gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {item.summary ?? typeLabels[item.type]}
                      </p>
                      {item.actor && (
                        <p className="text-xs text-muted-foreground">
                          {item.actor} · {formatRelativeTime(item.created_at)}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
