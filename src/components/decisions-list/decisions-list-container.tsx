import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterBar } from './filter-bar'
import { DecisionsTable } from './decisions-table'
import { PreviewPane } from './preview-pane'
import { BulkActionsBar } from './bulk-actions-bar'
import { CreateDecisionPanel } from './create-decision-panel'
import { ShareLinkManager } from './share-link-manager'
import {
  useDecisionsList,
  useDecisionPreview,
  useCreateDecision,
  useDeleteDecision,
  useCloneDecision,
  useBulkExport,
  useBulkShare,
  useBulkChangeStatus,
  useProjectTeamForFilters,
  useTemplates,
} from '@/hooks/use-decisions-list'
import type {
  DecisionsListFilters,
  DecisionsSortField,
  DecisionsSortOrder,
} from '@/types/decisions-list'
import type { CreateDecisionFormData } from '@/components/workspace'

export interface DecisionsListContainerProps {
  projectId: string
  projectName?: string
  className?: string
}

export function DecisionsListContainer({
  projectId,
  projectName,
  className,
}: DecisionsListContainerProps) {
  const [filters, setFilters] = useState<DecisionsListFilters>({})
  const [sort, setSort] = useState<DecisionsSortField>('updated_at')
  const [order, setOrder] = useState<DecisionsSortOrder>('desc')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareDecisionId, setShareDecisionId] = useState<string | null>(null)

  const pageSize = 25

  const { data, isLoading, error } = useDecisionsList(
    projectId,
    filters,
    sort,
    order,
    page,
    pageSize
  )
  const { data: preview, isLoading: previewLoading } = useDecisionPreview(
    projectId,
    previewId
  )
  const { data: teamData } = useProjectTeamForFilters(projectId)
  const { data: templatesData } = useTemplates()
  const team = teamData ?? []
  const templates = templatesData ?? []

  const createMutation = useCreateDecision(projectId)
  const deleteMutation = useDeleteDecision(projectId)
  const cloneMutation = useCloneDecision(projectId)
  const bulkExportMutation = useBulkExport(projectId)
  const bulkShareMutation = useBulkShare(projectId)
  const bulkStatusMutation = useBulkChangeStatus(projectId)

  const decisions = data?.decisions ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / pageSize)

  const handleCreateSubmit = useCallback(
    async (formData: CreateDecisionFormData & { templateId?: string }) => {
      const { templateId, ...rest } = formData
      await createMutation.mutateAsync({
        title: rest.title,
        status: rest.status,
        due_date: rest.due_date || undefined,
        assignee_id: rest.assignee_id || undefined,
        summary: rest.description,
        ...(templateId && { template_id: templateId }),
      })
    },
    [createMutation]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      if (previewId === id) setPreviewId(null)
    },
    [deleteMutation, previewId]
  )

  const handleBulkDelete = useCallback(() => {
    selectedIds.forEach((id) => deleteMutation.mutate(id))
    setSelectedIds(new Set())
    setPreviewId(null)
  }, [selectedIds, deleteMutation])

  const handleShare = useCallback((id: string) => {
    setShareDecisionId(id)
    setShareModalOpen(true)
  }, [])

  const handleBulkShare = useCallback(() => {
    bulkShareMutation.mutate({ decisionIds: Array.from(selectedIds) })
    setSelectedIds(new Set())
  }, [selectedIds, bulkShareMutation])

  const handleBulkExport = useCallback(
    (format: 'pdf' | 'csv' | 'json') => {
      bulkExportMutation.mutate({
        decisionIds: Array.from(selectedIds),
        format,
      })
    },
    [selectedIds, bulkExportMutation]
  )

  const handleBulkChangeStatus = useCallback(
    (newStatus: import('@/types/workspace').DecisionStatus) => {
      bulkStatusMutation.mutate({
        decisionIds: Array.from(selectedIds),
        newStatus,
      })
      setSelectedIds(new Set())
    },
    [selectedIds, bulkStatusMutation]
  )

  const shareDecision = decisions.find((d) => d.id === shareDecisionId)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Failed to load decisions</p>
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
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Projects
          </Link>
        </Button>
        {projectName && (
          <Button asChild variant="ghost" size="sm">
            <Link to={`/dashboard/projects/${projectId}`}>
              {projectName}
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-6">
        <h1 className="text-2xl font-bold">Decisions</h1>
        <Button
          className="rounded-full shrink-0"
          onClick={() => setCreateOpen(true)}
          aria-label="Create decision"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create decision
        </Button>
      </div>

      <FilterBar
        filters={filters}
        sort={sort}
        order={order}
        onFiltersChange={setFilters}
        onSortChange={(s, o) => {
          setSort(s)
          setOrder(o)
          setPage(1)
        }}
        team={team}
      />

      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onExport={handleBulkExport}
          onShare={handleBulkShare}
          onChangeStatus={handleBulkChangeStatus}
          onDelete={handleBulkDelete}
          isExporting={bulkExportMutation.isPending}
          isSharing={bulkShareMutation.isPending}
          isChangingStatus={bulkStatusMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <DecisionsTable
              decisions={decisions}
              projectId={projectId}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onSelectAll={(checked) => {
                if (checked) {
                  setSelectedIds(new Set(decisions.map((d) => d.id)))
                } else {
                  setSelectedIds(new Set())
                }
              }}
              isAllSelected={
                decisions.length > 0 &&
                decisions.every((d) => selectedIds.has(d.id))
              }
              onDuplicate={(id) => cloneMutation.mutate(id)}
              onDelete={handleDelete}
              onShare={handleShare}
              onPreview={setPreviewId}
            />
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <aside className="hidden lg:block shrink-0">
            <PreviewPane
              decision={preview ?? null}
              projectId={projectId}
              isLoading={previewLoading}
            />
        </aside>
      </div>

      {/* Mobile: Preview as sheet/drawer - could use Sheet component */}
      {previewId && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 animate-fade-in" onClick={() => setPreviewId(null)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <PreviewPane
              decision={preview ?? null}
              projectId={projectId}
              isLoading={previewLoading}
              onClose={() => setPreviewId(null)}
            />
          </div>
        </div>
      )}

      <CreateDecisionPanel
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        templates={templates}
        assignees={team
          .filter((m) => m.role !== 'client')
          .map((m) => ({ id: m.user_id, name: m.name }))}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />

      <ShareLinkManager
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        decisionId={shareDecisionId ?? undefined}
        decisionTitle={shareDecision?.title}
        existingUrl={null}
        linkStatus={shareDecision?.share_link_status ?? null}
      />
    </div>
  )
}
