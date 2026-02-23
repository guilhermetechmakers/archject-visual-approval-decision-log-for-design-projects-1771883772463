/**
 * React Query hooks for Decision CRUD
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as decisionsApi from '@/api/workspace'
import type { Decision } from '@/types/workspace'
import type { DecisionEditorState } from '@/types/decision-editor'

interface DecisionCreatePayload {
  title: string
  description?: string
  template_id?: string | null
  due_date?: string | null
  status?: string
  assignee_id?: string | null
  options?: unknown[]
  approval_rules?: unknown[]
  reminders?: unknown[]
  triggers?: unknown[]
}

function buildCreatePayload(
  state: DecisionEditorState,
  overrides: { status?: 'draft' | 'pending' }
): DecisionCreatePayload {
  const status = overrides.status ?? state.status
  return {
    title: state.title,
    description: state.description || undefined,
    template_id: state.templateId,
    due_date: state.dueDate,
    status: status === 'approved' || status === 'rejected' ? 'draft' : status,
    assignee_id: state.assigneeId,
    options: state.options.map((o, i) => ({
      title: o.title,
      description: o.description,
      order: i,
      caption: o.caption,
      cost: o.cost,
      media_files: o.mediaFiles.map((m) => ({
        file_name: m.fileName,
        url: m.url,
        type: m.type,
        version: m.version,
        is_primary: m.isPrimary,
      })),
    })),
    approval_rules: state.approvalRules.map((r) => ({
      approver_id: r.approverId,
      required: r.required,
      deadline: r.deadline,
      allow_comments: r.allowComments,
    })),
    reminders: state.reminders.map((r) => ({
      schedule_type: r.scheduleType,
      schedule_value: r.scheduleValue,
      message: r.message,
      channel: r.channel,
      enabled: r.enabled,
    })),
    triggers: state.triggers.map((t) => ({
      type: t.type,
      target_url: t.targetUrl,
      payload_template: t.payloadTemplate,
      active: t.active,
      outcome: t.outcome,
    })),
  }
}

const USE_MOCK = true

export function useCreateDecisionMutation(
  projectId: string,
  getState: () => DecisionEditorState
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (overrides: { status?: 'draft' | 'pending' }) => {
      const state = getState()
      const payload = buildCreatePayload(state, overrides)
      if (USE_MOCK) {
        const mock: Decision = {
          id: `dec-${Date.now()}`,
          project_id: projectId,
          title: payload.title ?? 'Untitled',
          status: (overrides.status ?? 'draft') as Decision['status'],
          due_date: payload.due_date ?? null,
          assignee_id: payload.assignee_id ?? null,
          assignee_name: null,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          description: payload.description ?? null,
          template_id: payload.template_id ?? null,
          approved_at: null,
          options_count: payload.options?.length ?? 0,
        }
        return mock
      }
      return decisionsApi.createDecision(projectId, {
        title: payload.title,
        description: payload.description,
        template_id: payload.template_id,
        due_date: payload.due_date,
        status: payload.status as Decision['status'],
        assignee_id: payload.assignee_id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'decisions', projectId] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create decision')
    },
  })
}

export function useDecision(decisionId: string | undefined) {
  return useQuery({
    queryKey: ['decision', decisionId],
    queryFn: async () => {
      if (USE_MOCK) {
        return {
          id: decisionId!,
          project_id: '',
          title: 'Kitchen Finishes - Countertops',
          status: 'draft' as const,
          due_date: '2025-03-01',
          assignee_id: null,
          assignee_name: null,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          description: 'Select countertop material and finish.',
          template_id: null,
          approved_at: null,
          options_count: 2,
        }
      }
      return decisionsApi.fetchDecision(decisionId!)
    },
    enabled: !!decisionId,
  })
}

export function useUpdateDecisionMutation(
  decisionId: string,
  projectId: string,
  getState: () => DecisionEditorState
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (overrides: { status?: 'draft' | 'pending' }) => {
      const state = getState()
      const payload = buildCreatePayload(state, overrides)
      if (USE_MOCK) {
        return {
          id: decisionId,
          project_id: projectId,
          title: payload.title,
          status: overrides.status ?? state.status,
          due_date: payload.due_date ?? null,
          assignee_id: payload.assignee_id ?? null,
          assignee_name: null,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          description: payload.description ?? null,
          template_id: payload.template_id ?? null,
          approved_at: null,
          options_count: payload.options?.length ?? 0,
        }
      }
      return decisionsApi.updateDecision(decisionId, {
        title: payload.title,
        description: payload.description,
        template_id: payload.template_id,
        due_date: payload.due_date,
        status: payload.status as Decision['status'],
        assignee_id: payload.assignee_id,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['workspace', 'decisions', data.project_id],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update decision')
    },
  })
}

export function useUpdateDecision(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Decision>) =>
      decisionsApi.updateDecision(decisionId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['workspace', 'decisions', data.project_id],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update decision')
    },
  })
}
