import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, FileText, Users, Search, BarChart3, Plus, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  QuickActionsBar,
  ActiveProjectsCard,
  DecisionsAwaitingClientCard,
  RecentActivityCard,
  UsageSnapshotCard,
  AnalyticsWidget,
  DashboardSkeleton,
  QuickCreatePanel,
  ShareLinkModal,
} from '@/components/dashboard'
import { useDashboardData } from '@/hooks/use-dashboard'
import { useCreateClientLink } from '@/hooks/use-workspace'

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

  const [searchQuery, setSearchQuery] = useState('')
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [shareLinkOpen, setShareLinkOpen] = useState(false)
  const filteredProjects = searchQuery.trim()
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects
  const filteredApprovals = searchQuery.trim()
    ? awaiting_approvals.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
    : awaiting_approvals

  const selectedProjectId = filteredProjects[0]?.id ?? ''
  const createLinkMutation = useCreateClientLink(selectedProjectId)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setQuickCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Quick create
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setShareLinkOpen(true)}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Share client link
          </Button>
          <QuickActionsBar />
        </div>
      </div>

      <QuickCreatePanel
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        projects={filteredProjects}
      />

      <ShareLinkModal
        open={shareLinkOpen}
        onOpenChange={setShareLinkOpen}
        projectId={filteredProjects[0]?.id}
        projectName={filteredProjects[0]?.name}
        onGenerate={async (opts) => {
          if (selectedProjectId) {
            const result = await createLinkMutation.mutateAsync({
              expires_at: opts.expiresAt,
              otp_required: opts.otpRequired,
            })
            return {
              url: result.url,
              expiresAt: opts.expiresAt ?? result.expires_at ?? null,
            }
          }
          const base = `${window.location.origin}/portal`
          const token = `mock-${Date.now().toString(36)}`
          return {
            url: `${base}/${token}`,
            expiresAt: opts.expiresAt ?? null,
          }
        }}
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          placeholder="Search projects, decisions…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-lg bg-input"
          aria-label="Search projects and decisions"
        />
      </div>

      <ActiveProjectsCard projects={filteredProjects} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DecisionsAwaitingClientCard approvals={filteredApprovals} />
        <RecentActivityCard activities={recent_activity} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/projects">
            <Button variant="secondary" size="sm" className="transition-all hover:scale-[1.02]">
              <FolderKanban className="mr-2 h-4 w-4" />
              All projects
            </Button>
          </Link>
          <Link to="/dashboard/decisions">
            <Button variant="secondary" size="sm" className="transition-all hover:scale-[1.02]">
              <FileText className="mr-2 h-4 w-4" />
              All decisions
            </Button>
          </Link>
          <Link to="/dashboard/team">
            <Button variant="secondary" size="sm" className="transition-all hover:scale-[1.02]">
              <Users className="mr-2 h-4 w-4" />
              Team
            </Button>
          </Link>
          <Link to="/dashboard/analytics">
            <Button variant="secondary" size="sm" className="transition-all hover:scale-[1.02]">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics & Reports
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
