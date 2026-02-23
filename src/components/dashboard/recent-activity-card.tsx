/**
 * RecentActivityCard - Last 24-72 hours activity feed
 */

import { ActivityItem } from './activity-item'
import type { RecentActivity } from '@/types/dashboard'

interface RecentActivityCardProps {
  activities: RecentActivity[]
  className?: string
}

export function RecentActivityCard({
  activities,
  className,
}: RecentActivityCardProps) {
  return (
    <section className={className}>
      <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
      <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-card-hover">
        {activities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
