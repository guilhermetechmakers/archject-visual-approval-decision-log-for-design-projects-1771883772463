/**
 * React Query hooks for Decisions List / Content Browser
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as decisionsApi from '@/api/decisions'
import type {
  DecisionsListParams,
  DecisionsListFilters,
  DecisionsSortField,
  DecisionsSortOrder,
  BulkExportPayload,
  BulkSharePayload,
  BulkChangeStatusPayload,
} from '@/types/decisions-list'
import type { DecisionStatus } from '@/types/workspace'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  mockDecisions,
  mockClientLinks,
  mockTeam,
  mockTemplates,
} from '@/lib/workspace-mock'
import {
  supabaseFetchDecisionsList,
  supabaseFetchDecisionPreview,
  supabaseCreateDecision,
  supabaseDeleteDecision,
  supabaseCloneDecision,
  supabaseBulkChangeStatus,
} from '@/lib/supabase-decisions'
import type { DecisionListItem, DecisionsListResponse } from '@/types/decisions-list'

const USE_MOCK = !isSupabaseConfigured

function toListItem(
  d: { id: string; project_id: string; title: string; status: DecisionStatus; due_date?: string | null; assignee_id?: string | null; assignee_name?: string | null; created_at: string; updated_at: string; description?: string | null; template_id?: string | null; options_count?: number },
  projectId: string,
  clientLinks: { decision_id?: string | null; expires_at?: string | null; is_active: boolean }[]
): DecisionListItem {
  const link = clientLinks.find((l) => l.decision_id === d.id)
  const isExpired = link?.expires_at ? new Date(link.expires_at) < new Date() : false
  return {
    ...d,
    project_id: projectId,
    files_count: Math.floor(Math.random() * 5) + (d.id === 'dec-1' ? 2 : 0),
    has_share_link: !!link,
    share_link_status: link ? (isExpired ? 'expired' : 'active') : null,
    template_type: d.template_id ? ('finishes' as const) : null,
    summary: d.description ?? undefined,
    last_activity: d.updated_at,
  }
}

async function mockFetchDecisions(params: DecisionsListParams): Promise<DecisionsListResponse> {
  const { projectId, filters, sort = 'updated_at', order = 'desc', page = 1, pageSize = 25 } = params
  const decisions = mockDecisions.map((d) => toListItem({ ...d, project_id: projectId }, projectId, mockClientLinks))
  let filtered = [...decisions]

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.summary?.toLowerCase().includes(q) ?? false)
    )
  }
  if (filters?.status?.length) {
    filtered = filtered.filter((d) => filters.status!.includes(d.status))
  }
  if (filters?.assigneeId) {
    filtered = filtered.filter((d) => d.assignee_id === filters.assigneeId)
  }
  if (filters?.templateType) {
    filtered = filtered.filter((d) => d.template_type === filters.templateType)
  }
  if (filters?.dueDateFrom) {
    filtered = filtered.filter(
      (d) => d.due_date && d.due_date >= filters.dueDateFrom!
    )
  }
  if (filters?.dueDateTo) {
    filtered = filtered.filter(
      (d) => d.due_date && d.due_date <= filters.dueDateTo!
    )
  }
  if (filters?.quickFilter === 'overdue') {
    const today = new Date().toISOString().slice(0, 10)
    filtered = filtered.filter(
      (d) => d.due_date && d.due_date < today && d.status === 'pending'
    )
  }
  if (filters?.quickFilter === 'awaiting_client') {
    filtered = filtered.filter(
      (d) => d.status === 'pending' && d.has_share_link
    )
  }
  if (filters?.tags?.length) {
    filtered = filtered.filter((d) => {
      const itemTags = d.tags ?? (d.metadata as { tags?: string[] })?.tags ?? []
      return filters!.tags!.some((t) => itemTags.includes(t))
    })
  }
  if (filters?.metadataKey && filters?.metadataValue) {
    filtered = filtered.filter((d) => {
      const meta = (d.metadata as Record<string, unknown>) ?? {}
      return meta[filters!.metadataKey!] === filters!.metadataValue
    })
  }

  filtered.sort((a, b) => {
    let cmp = 0
    if (sort === 'title') cmp = a.title.localeCompare(b.title)
    else if (sort === 'due_date') {
      const da = a.due_date ?? ''
      const db = b.due_date ?? ''
      cmp = da.localeCompare(db)
    } else if (sort === 'updated_at') {
      cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    } else if (sort === 'status') {
      cmp = a.status.localeCompare(b.status)
    }
    return order === 'desc' ? -cmp : cmp
  })

  const total = filtered.length
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  return { decisions: paginated, total, page, pageSize }
}

export function useDecisionsList(
  projectId: string,
  filters?: DecisionsListFilters,
  sort?: DecisionsSortField,
  order?: DecisionsSortOrder,
  page?: number,
  pageSize?: number
) {
  return useQuery({
    queryKey: [
      'decisions-list',
      projectId,
      filters,
      sort,
      order,
      page,
      pageSize,
    ],
    queryFn: async () => {
      const params = { projectId, filters, sort, order, page, pageSize }
      const supabaseResult = await supabaseFetchDecisionsList(params)
      if (supabaseResult) return supabaseResult
      if (USE_MOCK) return mockFetchDecisions(params)
      return decisionsApi.fetchDecisionsList(params)
    },
    enabled: !!projectId,
  })
}

export function useDecisionPreview(projectId: string, decisionId: string | null) {
  return useQuery({
    queryKey: ['decision-preview', projectId, decisionId],
    queryFn: async () => {
      const supabaseResult = await supabaseFetchDecisionPreview(projectId, decisionId!)
      if (supabaseResult) return supabaseResult
      if (USE_MOCK) {
        const decisions = mockDecisions.map((d) =>
          toListItem({ ...d, project_id: projectId }, projectId, mockClientLinks)
        )
        const decision = decisions.find((d) => d.id === decisionId)
        if (!decision) throw new Error('Decision not found')
        return {
          ...decision,
          options: [
            { key: 'Option A', value: 'Selected' },
            { key: 'Option B', value: 'Not selected' },
          ],
          metadata: {},
          recent_activity: [
            { action: 'Updated', actor: decision.assignee_name ?? 'Unknown', changed_at: decision.updated_at },
          ],
        }
      }
      return decisionsApi.fetchDecisionPreview(projectId, decisionId!)
    },
    enabled: !!projectId && !!decisionId,
  })
}

export function useCreateDecision(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Parameters<typeof decisionsApi.createDecision>[1]) => {
      const supabaseResult = await supabaseCreateDecision(projectId, {
        title: data.title,
        status: data.status,
        due_date: data.due_date,
        assignee_id: data.assignee_id,
        description: data.summary,
        metadata: data.metadata,
      })
      if (supabaseResult) return supabaseResult
      if (USE_MOCK) {
        const newDecision = {
          id: `dec-${Date.now()}`,
          project_id: projectId,
          title: data.title,
          status: (data.status as DecisionStatus) ?? 'draft',
          due_date: data.due_date ?? null,
          assignee_id: data.assignee_id ?? null,
          assignee_name: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          description: data.summary ?? null,
          template_id: data.template_id ?? null,
        }
        return newDecision as import('@/types/workspace').Decision
      }
      return decisionsApi.createDecision(projectId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions-list', projectId] })
      queryClient.invalidateQueries({ queryKey: ['workspace', 'decisions', projectId] })
      toast.success('Decision created')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create decision')
    },
  })
}

export function useDeleteDecision(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (decisionId: string) => {
      const deleted = await supabaseDeleteDecision(projectId, decisionId)
      if (deleted) return
      if (USE_MOCK) return
      return decisionsApi.deleteDecision(projectId, decisionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions-list', projectId] })
      queryClient.invalidateQueries({ queryKey: ['workspace', 'decisions', projectId] })
      toast.success('Decision deleted')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete decision')
    },
  })
}

export function useCloneDecision(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (decisionId: string) => {
      const supabaseResult = await supabaseCloneDecision(projectId, decisionId)
      if (supabaseResult) return supabaseResult
      if (USE_MOCK) {
        const d = mockDecisions.find((x) => x.id === decisionId)
        if (!d) throw new Error('Decision not found')
        return {
          ...d,
          id: `dec-${Date.now()}`,
          title: `${d.title} (copy)`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as import('@/types/workspace').Decision
      }
      return decisionsApi.cloneDecision(projectId, decisionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions-list', projectId] })
      queryClient.invalidateQueries({ queryKey: ['workspace', 'decisions', projectId] })
      toast.success('Decision duplicated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate decision')
    },
  })
}

export function useBulkExport(projectId: string) {
  return useMutation({
    mutationFn: async (payload: BulkExportPayload) => {
      if (USE_MOCK) {
        return { job_id: `job-${Date.now()}`, status: 'processing' }
      }
      return decisionsApi.bulkExport(projectId, payload)
    },
    onSuccess: () => {
      toast.success('Export started')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to export')
    },
  })
}

export function useBulkShare(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: BulkSharePayload) => {
      if (USE_MOCK) {
        return {
          links: payload.decisionIds.map((id) => ({
            decision_id: id,
            url: `https://app.archject.com/portal/${id}-${Date.now()}`,
          })),
        }
      }
      return decisionsApi.bulkShare(projectId, payload)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['decisions-list', projectId] })
      queryClient.invalidateQueries({ queryKey: ['workspace', 'client-links', projectId] })
      const count = data.links?.length ?? 0
      toast.success(`${count} share link(s) created`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create share links')
    },
  })
}

export function useBulkChangeStatus(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: BulkChangeStatusPayload) => {
      if (USE_MOCK) return
      const done = await supabaseBulkChangeStatus(
        projectId,
        payload.decisionIds,
        payload.newStatus
      )
      if (done) return
      return decisionsApi.bulkChangeStatus(projectId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions-list', projectId] })
      queryClient.invalidateQueries({ queryKey: ['workspace', 'decisions', projectId] })
      toast.success('Status updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    },
  })
}

export function useTemplates() {
  return useQuery({
    queryKey: ['workspace', 'templates'],
    queryFn: async () => {
      if (USE_MOCK) return mockTemplates
      const workspaceApi = await import('@/api/workspace')
      return workspaceApi.fetchTemplates()
    },
  })
}

export function useProjectTeamForFilters(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'team', projectId],
    queryFn: async () => {
      if (USE_MOCK) {
        return mockTeam.filter(
          (t) => t.project_id === projectId || t.project_id === 'proj-1'
        )
      }
      const workspaceApi = await import('@/api/workspace')
      return workspaceApi.fetchProjectTeam(projectId)
    },
    enabled: !!projectId,
  })
}
