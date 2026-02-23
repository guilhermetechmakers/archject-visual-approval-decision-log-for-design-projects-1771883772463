import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  DecisionHeader,
  SideBySideViewer,
  OptionCard,
  CommentsThread,
  ApprovalHistoryPanel,
  AdminActionsBar,
  FileManagementPanel,
  ClientLinkModal,
} from '@/components/decision-detail'
import { useDecisionDetail } from '@/hooks/use-decision-detail'
import {
  useCreateShareLink,
  useRevokeApproval,
  useCreateComment,
  useUpdateOptionRecommended,
} from '@/hooks/use-decision-detail'
import { useProjectWorkspace } from '@/hooks/use-workspace'
import {
  exportDecisionAsJSON,
  exportDecisionAsCSV,
  exportDecisionAsPDF,
  downloadBlob,
} from '@/lib/export-decision'
import type { DecisionOption } from '@/types/decision-detail'

export function DecisionDetailInternalPage() {
  const { projectId, decisionId } = useParams<{ projectId: string; decisionId: string }>()
  const { data: detail, isLoading } = useDecisionDetail(decisionId)
  const { project } = useProjectWorkspace(projectId ?? '')

  const createShareLink = useCreateShareLink(decisionId ?? '')
  const revokeApproval = useRevokeApproval(decisionId ?? '')
  const createComment = useCreateComment(decisionId ?? '')
  const updateOptionRecommended = useUpdateOptionRecommended(decisionId ?? '')

  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const decision = detail?.decision
  const options = detail?.options ?? []
  const comments = detail?.comments ?? []
  const approvals = detail?.approvals ?? []
  const files = detail?.files ?? []

  const handleShareClick = useCallback(() => {
    setShareModalOpen(true)
  }, [])

  const handleCreateShareLink = useCallback(
    async (opts: { expiresAt?: string; otpRequired?: boolean }) => {
      return createShareLink.mutateAsync(opts).then((res) => res)
    },
    [createShareLink]
  )

  const handleExport = useCallback(
    async (format: 'pdf' | 'csv' | 'json') => {
      if (!decision) return
      setIsExporting(true)
      try {
        const payload = {
          decision: {
            id: decision.id,
            title: decision.title,
            status: decision.status,
            description: decision.description,
            due_date: (decision as { dueDate?: string }).dueDate ?? null,
            created_at: decision.createdAt,
            updated_at: decision.updatedAt,
          },
          options,
          comments,
          approvals,
          files,
        }
        if (format === 'pdf') {
          exportDecisionAsPDF(payload)
        } else if (format === 'csv') {
          const csv = exportDecisionAsCSV(payload)
          const blob = new Blob([csv], { type: 'text/csv' })
          downloadBlob(blob, `decision-${decision.id}.csv`)
        } else {
          const json = exportDecisionAsJSON(payload)
          const blob = new Blob([json], { type: 'application/json' })
          downloadBlob(blob, `decision-${decision.id}.json`)
        }
        toast.success(`Exported as ${format.toUpperCase()}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Export failed')
      } finally {
        setIsExporting(false)
      }
    },
    [decision, options, comments, approvals, files]
  )

  const handleRevokeApproval = useCallback(() => {
    revokeApproval.mutate(undefined)
  }, [revokeApproval])

  const handleAddComment = useCallback(
    (content: string, parentId?: string | null) => {
      createComment.mutate({ content, parentCommentId: parentId ?? null })
    },
    [createComment]
  )

  if (!projectId || !decisionId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project or decision not found</p>
      </div>
    )
  }

  if (isLoading || !decision) {
    return <DecisionDetailSkeleton />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <DecisionHeader
        decision={decision}
        projectId={projectId}
        projectName={project?.name}
        onShareClick={handleShareClick}
      />

      <AdminActionsBar
        projectId={projectId}
        decisionId={decisionId}
        status={decision.status}
        onRevokeApproval={
          decision.status === 'approved' || decision.status === 'rejected'
            ? handleRevokeApproval
            : undefined
        }
        onExport={handleExport}
        isRevoking={revokeApproval.isPending}
        isExporting={isExporting}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SideBySideViewer options={options} />

          <CommentsThread
            comments={comments}
            onAddComment={handleAddComment}
            isLoading={createComment.isPending}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-base font-semibold">Options</h3>
            <div className="space-y-3">
              {options.map((opt) => (
                <OptionCardWithMutation
                  key={opt.id}
                  option={opt}
                  updateRecommended={updateOptionRecommended}
                />
              ))}
              {options.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No options defined
                </div>
              )}
            </div>
          </div>

          <ApprovalHistoryPanel approvals={approvals} />

          <FileManagementPanel files={files} projectId={projectId} />
        </div>
      </div>

      <ClientLinkModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        decisionId={decisionId}
        decisionTitle={decision.title}
        onCreateLink={handleCreateShareLink}
      />
    </div>
  )
}

function OptionCardWithMutation({
  option,
  updateRecommended,
}: {
  option: DecisionOption
  updateRecommended: ReturnType<typeof useUpdateOptionRecommended>
}) {
  const handleToggle = useCallback(() => {
    updateRecommended.mutate(
      { optionId: option.id, isRecommended: !option.isRecommended },
      {
        onSuccess: () =>
          toast.success(
            option.isRecommended ? 'Unmarked recommended' : 'Marked as recommended'
          ),
      }
    )
  }, [option.id, option.isRecommended, updateRecommended])

  return (
    <OptionCard
      option={option}
      isRecommended={option.isRecommended}
      onToggleRecommended={handleToggle}
      onViewAttachments={() =>
        toast.info(`View attachments for ${option.title}`)
      }
      onCompare={() => toast.info('Compare in side-by-side viewer')}
    />
  )
}

function DecisionDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-secondary" />
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-lg bg-secondary" />
        <div className="h-9 w-24 rounded-lg bg-secondary" />
        <div className="h-9 w-24 rounded-lg bg-secondary" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 rounded-xl bg-secondary" />
          <div className="h-64 rounded-xl bg-secondary" />
        </div>
        <div className="space-y-6">
          <div className="h-32 rounded-xl bg-secondary" />
          <div className="h-40 rounded-xl bg-secondary" />
          <div className="h-48 rounded-xl bg-secondary" />
        </div>
      </div>
    </div>
  )
}
