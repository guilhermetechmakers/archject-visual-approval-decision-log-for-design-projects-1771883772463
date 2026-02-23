import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ProjectHeader,
  WorkspaceNav,
  OverviewCard,
  DecisionsList,
  TeamPanel,
  TemplatesLibrary,
  ActivitySidebar,
  ClientPortalManager,
  SearchFilterPanel,
  SettingsCompliancePanel,
  CreateDecisionModal,
  DecisionLogExporter,
  WebhookTaskingCenter,
  IntegrationsHub,
  type WorkspaceTab,
  type CreateDecisionFormData,
} from '@/components/workspace'
import { FilesLibraryView } from '@/components/files-library'
import { useProjectWorkspace, useCreateClientLink, useCreateExport } from '@/hooks/use-workspace'
import { toast } from 'sonner'

export function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview')
  const [createDecisionOpen, setCreateDecisionOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const {
    project,
    decisions,
    files,
    team,
    templates,
    activity,
    clientLinks,
    isLoading,
    error,
  } = useProjectWorkspace(projectId ?? '')

  const createLinkMutation = useCreateClientLink(projectId ?? '')
  const createExportMutation = useCreateExport(projectId ?? '')

  const handleShareClientPortal = () => {
    setActiveTab('overview')
    // Could open a modal or navigate to client links section
    toast.info('Open Client Portal Links section to generate a link')
  }

  const handleExportDecisionLog = () => {
    setExportModalOpen(true)
  }

  const handleExport = (type: 'pdf' | 'csv' | 'json') => {
    createExportMutation.mutate(type)
  }

  const handleCreateClientLink = (options?: {
    decisionId?: string
    expiresAt?: string
    otpRequired?: boolean
  }) => {
    createLinkMutation.mutate({
      decision_id: options?.decisionId,
      expires_at: options?.expiresAt,
      otp_required: options?.otpRequired,
    })
  }

  const handleCreateDecision = async (_data: CreateDecisionFormData) => {
    toast.success('Decision created')
    setCreateDecisionOpen(false)
  }

  const handleNavigateToCreateDecision = () => {
    if (projectId) {
      navigate(`/dashboard/projects/${projectId}/decisions/new`)
    } else {
      setCreateDecisionOpen(true)
    }
  }

  const storagePercent = project
    ? Math.round(
        (project.current_storage_bytes / project.storage_quota_bytes) * 100
      )
    : 0

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !project) {
    return <ProjectWorkspaceSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Failed to load project</p>
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Projects
          </Link>
        </Button>
      </div>

      <ProjectHeader
        project={project}
        onShareClientPortal={handleShareClientPortal}
        onExportDecisionLog={handleExportDecisionLog}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <WorkspaceNav activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        <main className="min-w-0 flex-1">
          {activeTab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <OverviewCard
                  project={project}
                  decisionsCount={decisions.length}
                  filesCount={files.length}
                  templatesUsed={0}
                />
                <div className="mt-6">
                  <SearchFilterPanel
                    onSearch={(q) => toast.info(`Search: ${q}`)}
                  />
                </div>
                <div className="mt-6">
                  <ClientPortalManager
                    links={clientLinks}
                    projectId={projectId}
                    onCreateLink={handleCreateClientLink}
                  />
                </div>
                <div className="mt-6">
                  <WebhookTaskingCenter projectId={projectId} />
                </div>
                <div className="mt-6">
                  <IntegrationsHub projectId={projectId} />
                </div>
              </div>
              <div>
                <ActivitySidebar activity={activity} />
              </div>
            </div>
          )}

          {activeTab === 'decisions' && (
            <DecisionsList
              decisions={decisions}
              projectId={projectId}
              onCreateDecision={handleNavigateToCreateDecision}
              onApplyTemplate={() => toast.info('Select a template')}
              onExportLog={() => setExportModalOpen(true)}
            />
          )}

          {activeTab === 'files' && (
            <FilesLibraryView
              storageUsedPercent={storagePercent}
              showFullLibraryLink
            />
          )}

          {activeTab === 'team' && (
            <TeamPanel
              members={team}
              projectId={projectId}
              onInvite={() => toast.info('Invite modal will open')}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesLibrary
              templates={templates}
              projectId={projectId}
              onApplyTemplate={(id) => {
                toast.info(`Applying template ${id}`)
                handleNavigateToCreateDecision()
              }}
              onCreateDecision={handleNavigateToCreateDecision}
            />
          )}

          {activeTab === 'activity' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SearchFilterPanel />
                <div className="mt-6">
                  <ActivitySidebar activity={activity} />
                </div>
              </div>
              <div>
                <OverviewCard
                  project={project}
                  decisionsCount={decisions.length}
                  filesCount={files.length}
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsCompliancePanel
              projectId={projectId}
              onExportAuditLogs={() => toast.info('Exporting audit logs...')}
              onViewRetentionPolicies={() =>
                toast.info('Opening retention policies')
              }
            />
          )}
        </main>
      </div>

      <CreateDecisionModal
        open={createDecisionOpen}
        onOpenChange={setCreateDecisionOpen}
        projectId={projectId}
        assignees={team
          .filter((m) => m.role !== 'client')
          .map((m) => ({ id: m.user_id, name: m.name }))}
        onSubmit={handleCreateDecision}
      />

      <DecisionLogExporter
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        projectId={projectId}
        onExport={handleExport}
        isExporting={createExportMutation.isPending}
      />
    </div>
  )
}

function ProjectWorkspaceSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex gap-6">
        <div className="w-56 space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-full" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
