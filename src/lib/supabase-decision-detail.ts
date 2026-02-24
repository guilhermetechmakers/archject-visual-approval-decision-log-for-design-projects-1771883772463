/**
 * Supabase Decision Detail - Full decision with options, comments, approvals, files
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { supabaseFetchComments } from '@/lib/supabase-comments'
import type {
  DecisionDetailFull,
  DecisionDetail,
  DecisionOption,
  DecisionApproval,
  DecisionFile,
} from '@/types/decision-detail'
import type { DecisionStatus } from '@/types/workspace'

const DB_TO_UI_STATUS: Record<string, DecisionStatus> = {
  draft: 'draft',
  pending: 'pending',
  accepted: 'approved',
  rejected: 'rejected',
}

export async function supabaseFetchDecisionDetail(
  decisionId: string
): Promise<DecisionDetailFull | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data: d, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', decisionId)
    .is('deleted_at', null)
    .single()

  if (error || !d) return null

  const dRow = d as Record<string, unknown>
  const decision: DecisionDetail = {
    id: dRow.id as string,
    projectId: dRow.project_id as string,
    title: dRow.title as string,
    description: (dRow.description as string) ?? null,
    status: DB_TO_UI_STATUS[(dRow.status as string) ?? 'draft'] ?? 'pending',
    createdAt: dRow.created_at as string,
    updatedAt: dRow.updated_at as string,
    dueDate: (dRow.due_date as string) ?? null,
    assignees: [],
    ownerId: (dRow.created_by as string) ?? null,
    lastActionTime: (dRow.updated_at as string) ?? null,
  }

  let options: DecisionOption[] = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: opts } = await (supabase as any)
      .from('decision_options')
      .select('*')
      .eq('decision_id', decisionId)
      .order('position', { ascending: true })
    options = ((opts ?? []) as Record<string, unknown>[]).map((o) => {
      const imgUrl = (o.image_url as string) ?? null
      const attachments = imgUrl
        ? [{ id: `img-${o.id}`, type: 'image' as const, url: imgUrl, version: 1, uploadedAt: o.created_at as string, uploadedBy: null }]
        : []
      return {
        id: o.id as string,
        decisionId: o.decision_id as string,
        title: o.title as string,
        description: (o.description as string) ?? null,
        cost: null,
        leadTime: null,
        dependencies: [],
        isRecommended: (o.is_recommended as boolean) ?? false,
        order: (o.position as number) ?? 0,
        attachments,
        mediaPreviewIds: imgUrl ? [`img-${o.id}`] : [],
      }
    })
  } catch {
    // decision_options may not exist
  }

  const comments = await supabaseFetchComments(decisionId)

  let approvals: DecisionApproval[] = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: appr } = await (supabase as any)
      .from('decision_approvals')
      .select('*')
      .eq('decision_id', decisionId)
      .order('timestamp', { ascending: false })
    approvals = ((appr ?? []) as Record<string, unknown>[]).map((a) => ({
      id: a.id as string,
      decisionId: a.decision_id as string,
      actorId: a.user_id as string,
      actorName: undefined,
      role: (a.role as string) ?? 'approver',
      action: ((a.status as string) === 'approved' ? 'approved' : (a.status as string) === 'rejected' ? 'rejected' : 'updated') as 'approved' | 'rejected' | 'updated',
      timestamp: a.timestamp as string,
      ipAddress: null,
    }))
  } catch {
    // decision_approvals may not exist
  }

  let files: DecisionFile[] = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: att } = await (supabase as any)
      .from('decision_attachments')
      .select('*')
      .eq('decision_id', decisionId)
    files = ((att ?? []) as Record<string, unknown>[]).map((f) => ({
      id: f.id as string,
      decisionId: f.decision_id as string,
      fileName: f.filename as string,
      url: f.url as string,
      version: (f.version as number) ?? 1,
      fileType: (f.mime_type as string) ?? 'file',
      uploadedAt: f.uploaded_at as string,
      uploadedBy: (f.uploaded_by as string) ?? null,
    }))
  } catch {
    // decision_attachments may not exist
  }

  return {
    decision,
    options,
    comments,
    annotations: [],
    approvals,
    files,
  }
}
