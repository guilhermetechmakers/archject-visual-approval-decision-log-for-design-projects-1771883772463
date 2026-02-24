/**
 * Supabase Decisions CRUD Service
 * Provides direct Supabase operations when configured.
 * Maps DB schema (accepted) to UI types (approved).
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { SupabaseClient } from '@/lib/supabase'
import type { DecisionStatus } from '@/types/workspace'
import type {
  DecisionListItem,
  DecisionPreview,
  DecisionsListFilters,
  DecisionsListResponse,
} from '@/types/decisions-list'
import type { Decision } from '@/types/workspace'

/** Map Supabase status (accepted) to UI status (approved) */
const DB_TO_UI_STATUS: Record<string, DecisionStatus> = {
  draft: 'draft',
  pending: 'pending',
  accepted: 'approved',
  rejected: 'rejected',
}

/** Map UI status to DB status */
const UI_TO_DB_STATUS: Record<DecisionStatus, string> = {
  draft: 'draft',
  pending: 'pending',
  approved: 'accepted',
  rejected: 'rejected',
}

function mapDbDecisionToListItem(row: Record<string, unknown>): DecisionListItem {
  const metadata = (row.metadata as Record<string, unknown>) ?? {}
  const tags = Array.isArray(metadata.tags) ? (metadata.tags as string[]) : []
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    title: row.title as string,
    status: DB_TO_UI_STATUS[(row.status as string) ?? 'draft'] ?? 'draft',
    due_date: (row.due_date as string) ?? null,
    assignee_id: (row.assignee_id as string) ?? null,
    assignee_name: null,
    template_id: (row.template_id as string) ?? null,
    summary: (row.description as string) ?? null,
    description: (row.description as string) ?? null,
    options_count: 0,
    files_count: 0,
    has_share_link: !!(row.share_link_id as string),
    share_link_status: null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    last_activity: row.updated_at as string,
    metadata: Object.keys(metadata).length ? metadata : undefined,
    tags: tags.length ? tags : undefined,
  }
}

function mapDbDecisionToDecision(row: Record<string, unknown>): Decision {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    title: row.title as string,
    status: DB_TO_UI_STATUS[(row.status as string) ?? 'draft'] ?? 'draft',
    due_date: (row.due_date as string) ?? null,
    assignee_id: (row.assignee_id as string) ?? null,
    assignee_name: null,
    created_by: (row.created_by as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    description: (row.description as string) ?? null,
    template_id: (row.template_id as string) ?? null,
    approved_at: (row.approved_at as string) ?? null,
    options_count: 0,
  }
}

export async function supabaseFetchDecisionsList(
  params: {
    projectId: string
    filters?: DecisionsListFilters
    sort?: string
    order?: 'asc' | 'desc'
    page?: number
    pageSize?: number
  }
): Promise<DecisionsListResponse | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { projectId, filters, sort = 'updated_at', order = 'desc', page = 1, pageSize = 25 } = params

  let query = supabase
    .from('decisions')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .is('deleted_at', null)

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters?.status?.length) {
    const dbStatuses = filters.status.map((s) => UI_TO_DB_STATUS[s])
    query = query.in('status', dbStatuses)
  }
  if (filters?.assigneeId) {
    query = query.eq('assignee_id', filters.assigneeId)
  }
  if (filters?.dueDateFrom) {
    query = query.gte('due_date', filters.dueDateFrom)
  }
  if (filters?.dueDateTo) {
    query = query.lte('due_date', filters.dueDateTo)
  }
  if (filters?.metadataKey && filters?.metadataValue) {
    query = query.contains('metadata', { [filters.metadataKey]: filters.metadataValue })
  }
  if (filters?.quickFilter === 'my_decisions') {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) query = query.eq('assignee_id', user.id)
  }
  if (filters?.quickFilter === 'overdue') {
    const today = new Date().toISOString().slice(0, 10)
    query = query.eq('status', 'pending').lt('due_date', today)
  }
  if (filters?.quickFilter === 'awaiting_client') {
    query = query.eq('status', 'pending').eq('shared', true)
  }

  const sortColumn = sort === 'due_date' ? 'due_date' : sort === 'title' ? 'title' : sort === 'status' ? 'status' : 'updated_at'
  query = query.order(sortColumn, { ascending: order === 'asc' })

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, count, error } = await query

  if (error) throw error

  let decisions = (data ?? []).map(mapDbDecisionToListItem)

  const decisionIds = decisions.map((d) => d.id)
  if (decisionIds.length > 0) {
    try {
      const { data: opts } = await supabase
        .from('decision_options')
        .select('decision_id')
        .in('decision_id', decisionIds)
      const counts: Record<string, number> = {}
      for (const r of opts ?? []) {
        const id = (r as { decision_id: string }).decision_id
        counts[id] = (counts[id] ?? 0) + 1
      }
      decisions = decisions.map((d) => ({ ...d, options_count: counts[d.id] ?? 0 }))
    } catch {
      // decision_options may not exist
    }
  }

  if (filters?.tags?.length) {
    decisions = decisions.filter((d) => {
      const itemTags = (d.tags ?? (d.metadata as { tags?: string[] })?.tags) ?? []
      return filters!.tags!.some((t) => itemTags.includes(t))
    })
  }

  return {
    decisions,
    total: count ?? decisions.length,
    page,
    pageSize,
  }
}

export async function supabaseCreateDecision(
  projectId: string,
  data: {
    title: string
    status?: string
    due_date?: string
    assignee_id?: string
    description?: string
    metadata?: Record<string, unknown>
  }
): Promise<Decision | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id

  const dbStatus = data.status ? UI_TO_DB_STATUS[data.status as DecisionStatus] ?? data.status : 'draft'

  const metadata = data.metadata ?? {}
  const optionsFromMeta = (metadata.options as Array<{ title?: string; description?: string; order?: number }>) ?? []
  const insertPayload = {
    project_id: projectId,
    title: data.title,
    status: dbStatus,
    due_date: data.due_date ?? null,
    assignee_id: data.assignee_id ?? null,
    description: data.description ?? null,
    metadata: data.metadata ?? {},
    created_by: userId,
    version: 1,
  }
  const { data: row, error } = await supabase
    .from('decisions')
    .insert(insertPayload as never)
    .select()
    .single()

  if (error) throw error
  if (!row) return null

  const options = optionsFromMeta
  const rowData = row as Record<string, unknown>
  if (options.length > 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('decision_options').insert(
        options.map((o, i) => ({
          decision_id: rowData.id,
          title: (o.title as string) ?? `Option ${i + 1}`,
          description: (o.description as string) ?? null,
          position: (o.order as number) ?? i,
        }))
      )
    } catch {
      // decision_options may not exist
    }
  }

  return mapDbDecisionToDecision(rowData)
}

export async function supabaseUpdateDecision(
  projectId: string,
  decisionId: string,
  data: Partial<{
    title: string
    status: string
    due_date: string
    assignee_id: string
    description: string
    metadata: Record<string, unknown>
    version: number
  }>
): Promise<Decision | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id

  const updatePayload: Record<string, unknown> = {
    ...data,
    updated_at: new Date().toISOString(),
    last_edited_by: userId,
  }
  if (data.status) {
    updatePayload.status = UI_TO_DB_STATUS[data.status as DecisionStatus] ?? data.status
  }
  delete (updatePayload as { version?: number }).version

  let query = supabase
    .from('decisions')
    .update(updatePayload as never)
    .eq('id', decisionId)
  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  const { data: row, error } = await query.select().single()

  if (error) throw error
  return row ? mapDbDecisionToDecision(row as Record<string, unknown>) : null
}

export async function supabaseDeleteDecision(
  projectId: string,
  decisionId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  const { error } = await supabase
    .from('decisions')
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq('id', decisionId)
    .eq('project_id', projectId)

  if (error) throw error
  return true
}

export async function supabaseCloneDecision(
  projectId: string,
  decisionId: string
): Promise<Decision | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data: existingData } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', decisionId)
    .eq('project_id', projectId)
    .single()

  const existing = existingData as Record<string, unknown> | null
  if (!existing) return null

  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id

  const insertPayload = {
    project_id: projectId,
    title: `${(existing.title as string) ?? 'Untitled'} (copy)`,
    status: 'draft',
    description: existing.description ?? null,
    due_date: existing.due_date ?? null,
    assignee_id: null,
    metadata: existing.metadata ?? {},
    options: existing.options ?? [],
    created_by: userId ?? undefined,
  }
  const { data: row, error } = await supabase
    .from('decisions')
    .insert(insertPayload as never)
    .select()
    .single()

  if (error) throw error
  return row ? mapDbDecisionToDecision(row as Record<string, unknown>) : null
}

export async function supabaseFetchDecisionPreview(
  projectId: string,
  decisionId: string
): Promise<DecisionPreview | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data: d, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', decisionId)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .single()

  if (error || !d) return null

  const dData = d as Record<string, unknown>
  let options: Array<{ title?: string; description?: string }> = []
  try {
    const { data: opts } = await (
      supabase as SupabaseClient
    )
      .from('decision_options')
      .select('title, description, position')
      .eq('decision_id', decisionId)
      .order('position')
      .limit(10)
    options = (opts ?? []) as Array<{ title?: string; description?: string }>
  } catch {
    // decision_options may not exist
  }

  const base = mapDbDecisionToListItem(dData)
  let hasShareLink = !!(dData.share_link_id as string)
  let shareLinkStatus: 'active' | 'expired' | null = null
  try {
    const { data: shareLinks } = await (supabase as SupabaseClient)
      .from('decision_share_links')
      .select('expires_at, revocation_flag')
      .eq('decision_id', decisionId)
    const activeLink = (shareLinks ?? []).find((r: { revocation_flag?: boolean }) => !r.revocation_flag)
    if (activeLink) {
      hasShareLink = true
      const isExpired = (activeLink as { expires_at?: string }).expires_at
        ? new Date((activeLink as { expires_at: string }).expires_at) < new Date()
        : false
      shareLinkStatus = isExpired ? 'expired' : 'active'
    }
  } catch {
    // table may not exist
  }

  return {
    ...base,
    has_share_link: hasShareLink,
    share_link_status: shareLinkStatus,
    options: options.map((o, i) => ({
      key: o.title ?? `Option ${i + 1}`,
      value: o.description ?? '',
    })),
    metadata: (dData.metadata as Record<string, unknown>) ?? {},
    recent_activity: [
      {
        action: 'Updated',
        actor: undefined,
        changed_at: (dData.updated_at as string) ?? '',
      },
    ],
  }
}

export async function supabaseBulkChangeStatus(
  projectId: string,
  decisionIds: string[],
  newStatus: DecisionStatus
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  if (decisionIds.length === 0) return true

  const dbStatus = UI_TO_DB_STATUS[newStatus]
  const { error } = await supabase
    .from('decisions')
    .update({ status: dbStatus } as never)
    .eq('project_id', projectId)
    .in('id', decisionIds)
    .is('deleted_at', null)

  if (error) throw error
  return true
}
