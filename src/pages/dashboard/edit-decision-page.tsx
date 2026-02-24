import { useState, useCallback, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  EditDecisionHeader,
  MetadataEditor,
  DecisionObjectsEditor,
  VersionComparePanel,
  HistoryPanel,
  ReissueSharePanel,
  QuickPreviewPanel,
} from '@/components/edit-decision'
import { useProjectWorkspace } from '@/hooks/use-workspace'
import {
  useVersionedDecision,
  useDecisionVersions,
  useAuditLog,
  useDecisionDiffs,
  useCreateVersionMutation,
  useReissueShareMutation,
  useUpdateDecisionStatusMutation,
} from '@/hooks/use-edit-decision'
import type {
  VersionedDecision,
  DecisionObject,
  DecisionMetadata,
  DecisionVersion,
  AuditAction,
} from '@/types/edit-decision'

function EditDecisionContent() {
  const { projectId, decisionId } = useParams<{ projectId: string; decisionId: string }>()
  const navigate = useNavigate()
  const { project } = useProjectWorkspace(projectId ?? '')

  const { data: decision, isLoading } = useVersionedDecision(decisionId ?? '')
  const { data: versions = [] } = useDecisionVersions(decisionId ?? '')
  const { data: auditEntries = [], isLoading: auditLoading } = useAuditLog(
    decisionId ?? '',
    { limit: 50 }
  )

  const [fromVersionId, setFromVersionId] = useState<string | null>(null)
  const [toVersionId, setToVersionId] = useState<string | null>(null)
  const { data: diff, isLoading: diffLoading } = useDecisionDiffs(
    decisionId ?? '',
    fromVersionId ?? undefined,
    toVersionId ?? undefined
  )

  const saveMutation = useCreateVersionMutation(decisionId ?? '')
  const reissueMutation = useReissueShareMutation(decisionId ?? '')
  const updateStatusMutation = useUpdateDecisionStatusMutation(
    decisionId ?? '',
    projectId ?? ''
  )

  const [draft, setDraft] = useState<{
    metadata?: Partial<DecisionMetadata>
    decision_objects: DecisionObject[]
  } | null>(null)
  const [shareLink, setShareLink] = useState<{ url: string; expires_at?: string } | null>(null)
  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all')
  const [hasConflict, setHasConflict] = useState(false)

  const displayDecision = draft
    ? {
        ...decision!,
        ...(draft.metadata && {
          title: draft.metadata.title ?? decision!.title,
          description: draft.metadata.description ?? decision!.description,
          metadata: { ...decision!.metadata, ...draft.metadata },
        }),
        decision_objects: draft.decision_objects,
      }
    : decision

  const hasUnsavedChanges = !!draft

  const initializeDraft = useCallback((d: VersionedDecision) => {
    setDraft({
      metadata: d.metadata ? { ...d.metadata } : undefined,
      decision_objects: d.decision_objects ? [...d.decision_objects] : [],
    })
  }, [])

  useEffect(() => {
    if (decision && !draft) {
      queueMicrotask(() => initializeDraft(decision))
    }
  }, [decision, draft, initializeDraft])

  const handleMetadataChange = useCallback((data: Partial<DecisionMetadata>) => {
    setDraft((prev) =>
      prev
        ? { ...prev, metadata: { ...prev.metadata, ...data } }
        : { metadata: data, decision_objects: [] }
    )
  }, [])

  const handleObjectsChange = useCallback((objects: DecisionObject[]) => {
    setDraft((prev) =>
      prev ? { ...prev, decision_objects: objects } : { decision_objects: objects }
    )
  }, [])

  const handleSave = useCallback(async () => {
    if (!draft || !decision) return
    setHasConflict(false)
    try {
      await saveMutation.mutateAsync({
        snapshot: {
          title: draft.metadata?.title ?? decision.title,
          description: draft.metadata?.description ?? decision.description ?? null,
          category: draft.metadata?.category ?? decision.category ?? null,
          owner_id: draft.metadata?.owner_id ?? decision.owner_id ?? null,
          due_date: draft.metadata?.due_date ?? decision.due_date ?? null,
          tags: draft.metadata?.tags ?? decision.tags ?? [],
          decision_objects: draft.decision_objects,
        },
        note: 'Edited via Edit / Manage Decision',
      })
      setDraft(null)
      navigate(`/dashboard/projects/${projectId}/decisions/${decisionId}/internal`)
    } catch (err) {
      const status = (err as { status?: number })?.status
      if (status === 409) setHasConflict(true)
    }
  }, [draft, decision, saveMutation, projectId, decisionId, navigate])

  const handleCancel = useCallback(() => {
    setDraft(null)
    navigate(`/dashboard/projects/${projectId}/decisions/${decisionId}/internal`)
  }, [projectId, decisionId, navigate])

  const handleRevert = useCallback(() => {
    if (decision) {
      initializeDraft(decision)
      setHasConflict(false)
      toast.success('Reverted to last saved state')
    }
  }, [decision, initializeDraft])

  const handlePublish = useCallback(async () => {
    try {
      await handleSave()
      await updateStatusMutation.mutateAsync('pending')
      toast.success('Decision published')
    } catch {
      // handled
    }
  }, [handleSave, updateStatusMutation])

  const handleVersionCompare = useCallback(
    (from: string, to: string) => {
      setFromVersionId(from)
      setToVersionId(to)
    },
    []
  )

  const handleReissueShare = useCallback(
    async (options: {
      expires_at?: string
      access_scope?: 'read' | 'read_write'
      read_only?: boolean
    }) => {
      const result = await reissueMutation.mutateAsync({
        expires_at: options.expires_at,
        access_scope: options.access_scope ?? (options.read_only ? 'read' : 'read_write'),
      })
      setShareLink({ url: result.url, expires_at: result.expires_at ?? undefined })
    },
    [reissueMutation]
  )

  const filteredAudit = filterAction === 'all'
    ? auditEntries
    : auditEntries.filter((e) => e.action === filterAction)

  if (!projectId || !decisionId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project or decision not found</p>
        <Link
          to="/dashboard/projects"
          className="mt-4 text-primary hover:underline"
        >
          Back to projects
        </Link>
      </div>
    )
  }

  if (isLoading || !decision) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-secondary" />
        <div className="h-32 rounded-xl bg-secondary" />
        <div className="h-64 rounded-xl bg-secondary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <EditDecisionHeader
        decision={displayDecision ?? decision}
        projectId={projectId}
        projectName={project?.name}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onCancel={handleCancel}
        onRevert={handleRevert}
        onPublish={handlePublish}
        isSaving={saveMutation.isPending}
        hasConflict={hasConflict}
        version={(decision as { version?: number })?.version ?? decision.current_version_number}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MetadataEditor
            metadata={displayDecision?.metadata ?? decision.metadata}
            onChange={handleMetadataChange}
          />

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <DecisionObjectsEditor
              decisionId={decisionId}
              objects={draft?.decision_objects ?? decision.decision_objects ?? []}
              onChange={handleObjectsChange}
            />
          </div>

          <VersionComparePanel
            versions={versions as DecisionVersion[]}
            currentVersionId={decision.current_version_id}
            diff={diff ?? null}
            isLoading={diffLoading}
            onCompare={handleVersionCompare}
            fromVersionId={fromVersionId}
            toVersionId={toVersionId}
            onFromChange={setFromVersionId}
            onToChange={setToVersionId}
          />

          <HistoryPanel
            entries={filteredAudit}
            isLoading={auditLoading}
            filterAction={filterAction}
            onFilterActionChange={setFilterAction}
          />
        </div>

        <div className="space-y-6">
          <QuickPreviewPanel
            decision={displayDecision ?? decision}
            projectId={projectId}
          />

          <ReissueSharePanel
            shareLink={
              shareLink
                ? {
                    id: 'generated',
                    decision_id: decisionId,
                    url: shareLink.url,
                    expires_at: shareLink.expires_at ?? null,
                    access_scope: 'read',
                    created_by: null,
                    is_active: true,
                    created_at: new Date().toISOString(),
                  }
                : null
            }
            generatedUrl={shareLink?.url}
            isGenerating={reissueMutation.isPending}
            onGenerate={handleReissueShare}
            onCopy={() => toast.success('Link copied')}
          />
        </div>
      </div>
    </div>
  )
}

export function EditDecisionPage() {
  return (
    <div className="space-y-6">
      <EditDecisionContent />
    </div>
  )
}
