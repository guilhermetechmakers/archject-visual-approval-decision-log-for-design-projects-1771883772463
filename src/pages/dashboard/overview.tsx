import { Link } from 'react-router-dom'
import { Plus, FileCheck, FolderKanban, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ActionQuickBar,
  ProjectCard,
  ApprovalItem,
  ActivityItem,
  UsageSnapshotCard,
  AnalyticsWidget,
  DashboardSkeleton,
} from '@/components/dashboard'
import { useDashboardData } from '@/hooks/use-dashboard'

export function DashboardOverview() {
  const { data, isLoading, error } = useDashboardData()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Failed to load dashboard</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  const {
    projects,
    awaiting_approvals,
    recent_activity,
    usage,
  } = data

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <ActionQuickBar />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Projects overview</h2>
        {projects.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No active projects yet</p>
            <Link to="/dashboard/projects" className="mt-4 inline-block">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${i * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Awaiting approvals</h2>
            <Link to="/dashboard/decisions">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            {awaiting_approvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileCheck className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-medium">All caught up</p>
                <p className="text-sm text-muted-foreground">
                  No decisions awaiting client response
                </p>
                <Link to="/dashboard/decisions/new" className="mt-4">
                  <Button size="sm">Create decision</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {awaiting_approvals.map((approval) => (
                  <ApprovalItem key={approval.decision_id} approval={approval} />
                ))}
                <Link to="/dashboard/decisions" className="mt-4 block">
                  <Button variant="ghost" className="w-full">
                    View all decisions
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
          <div className="rounded-xl border border-border bg-card p-6">
            {recent_activity.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recent_activity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/projects">
            <Button variant="secondary" size="sm">
              <FolderKanban className="mr-2 h-4 w-4" />
              All projects
            </Button>
          </Link>
          <Link to="/dashboard/decisions">
            <Button variant="secondary" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              All decisions
            </Button>
          </Link>
          <Link to="/dashboard/team">
            <Button variant="secondary" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Team
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <UsageSnapshotCard usage={usage} />
      </section>

      <section>
        <AnalyticsWidget />
      </section>
    </div>
  )
}
