/**
 * React Query hooks for Project Workspace data
 * Uses Supabase when configured, falls back to REST API or mock
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as workspaceApi from '@/api/workspace'
import { fetchProject } from '@/api/projects'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Decision, ProjectFile, TeamMember, ActivityLog, ClientLink, Task, Webhook } from '@/types/workspace'
import {
  mockProject,
  mockDecisions,
  mockFiles,
  mockTeam,
  mockTemplates,
  mockActivity,
  mockClientLinks,
  mockTasks,
  mockWebhooks,
} from '@/lib/workspace-mock'

const projectNames: Record<string, string> = {
  'p-1': 'Riverside Villa',
  'p-2': 'Urban Loft',
  'p-3': 'Garden House',
  '1': 'Riverside Villa',
  '2': 'Urban Loft',
  '3': 'Garden House',
}

const USE_MOCK = !isSupabaseConfigured && !import.meta.env.VITE_API_URL

function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'project', projectId],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        const p = await fetchProject(projectId)
        if (p) return p
      }
      if (USE_MOCK)
        return {
          ...mockProject,
          id: projectId,
          name: projectNames[projectId] ?? mockProject.name,
        }
      return workspaceApi.fetchProject(projectId)
    },
    enabled: !!projectId,
  })
}

function useDecisionsQuery(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'decisions', projectId],
    queryFn: async (): Promise<Decision[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await (supabase as any)
          .from('decisions')
          .select('id, project_id, title, status, due_date, created_at, updated_at, approved_at')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
        if (!error && data) {
          type D = { id: string; project_id: string; title: string; status: string; due_date: string | null; created_at: string; updated_at: string; approved_at: string | null }
          return (data as D[]).map((d) => ({
            id: d.id,
            project_id: d.project_id,
            title: d.title,
            status: d.status as Decision['status'],
            due_date: d.due_date,
            created_at: d.created_at,
            updated_at: d.updated_at,
            approved_at: d.approved_at,
          }))
        }
      }
      if (USE_MOCK) return mockDecisions.map((d) => ({ ...d, project_id: projectId }))
      return workspaceApi.fetchProjectDecisions(projectId)
    },
    enabled: !!projectId,
  })
}

function useFilesQuery(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'files', projectId],
    queryFn: async (): Promise<ProjectFile[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await (supabase as any)
          .from('project_files')
          .select('id, project_id, filename, size, mime_type, storage_path, version, uploaded_at')
          .eq('project_id', projectId)
          .order('uploaded_at', { ascending: false })
        if (!error && data) {
          type F = { id: string; project_id: string; filename: string; storage_path: string; version: number; uploaded_at: string }
          return (data as F[]).map((f) => ({
            id: f.id,
            project_id: f.project_id,
            file_name: f.filename,
            file_type: 'image' as const,
            file_url: f.storage_path,
            version: f.version,
            uploaded_at: f.uploaded_at,
          }))
        }
      }
      if (USE_MOCK) return mockFiles.map((f) => ({ ...f, project_id: projectId }))
      return workspaceApi.fetchProjectFiles(projectId)
    },
    enabled: !!projectId,
  })
}

function useTeamQuery(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'team', projectId],
    queryFn: async (): Promise<TeamMember[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await (supabase as any)
          .from('project_rbac')
          .select('id, project_id, user_id, role')
          .eq('project_id', projectId)
        if (data && data.length > 0) {
          type R = { id: string; project_id: string; user_id: string; role: string }
          type P = { id: string; full_name?: string }
          const rows = data as R[]
          const userIds = [...new Set(rows.map((r) => r.user_id))]
          const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds)
          const profileMap = new Map(((profiles ?? []) as P[]).map((p) => [p.id, p]))
          return rows.map((r) => {
            const p = profileMap.get(r.user_id)
            return {
              id: r.id,
              project_id: r.project_id,
              user_id: r.user_id,
              name: (p?.full_name as string) ?? 'Unknown',
              role: r.role as TeamMember['role'],
            }
          })
        }
      }
      if (USE_MOCK) return mockTeam.map((t) => ({ ...t, project_id: projectId }))
      return workspaceApi.fetchProjectTeam(projectId)
    },
    enabled: !!projectId,
  })
}

function useMockTemplates() {
  return useQuery({
    queryKey: ['workspace', 'templates'],
    queryFn: async () => {
      if (USE_MOCK) return mockTemplates
      return workspaceApi.fetchTemplates()
    },
  })
}

function useActivityQuery(projectId: string) {
  type AuditRow = { id: string; target_id: string; timestamp: string; details?: { project_id?: string; summary?: string }; action: string }
  return useQuery({
    queryKey: ['workspace', 'activity', projectId],
    queryFn: async (): Promise<ActivityLog[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data: decisions } = await (supabase as any)
          .from('decisions')
          .select('id')
          .eq('project_id', projectId)
        const decisionIds = ((decisions ?? []) as { id: string }[]).map((d) => d.id)
        if (decisionIds.length > 0) {
          const { data } = await (supabase as any)
            .from('audit_logs')
            .select('id, user_id, action, target_id, timestamp, details')
            .in('target_id', decisionIds)
            .order('timestamp', { ascending: false })
            .limit(20)
          if (data) {
          return (data as AuditRow[]).map((a) => ({
            id: a.id,
            project_id: projectId,
            type: 'decision_created' as const,
            reference_id: a.target_id,
            created_at: a.timestamp,
            summary: a.details?.summary ?? a.action,
              actor: null,
            }))
          }
        }
        const { data } = await (supabase as any)
          .from('audit_logs')
          .select('id, user_id, action, target_id, timestamp, details')
          .order('timestamp', { ascending: false })
          .limit(20)
        if (data) {
          const filtered = (data as AuditRow[]).filter(
            (a) => a.details?.project_id === projectId
          )
          return filtered.map((a) => ({
            id: a.id,
            project_id: projectId,
            type: 'decision_created' as const,
            reference_id: a.target_id,
            created_at: a.timestamp,
            summary: a.details?.summary ?? a.action,
            actor: null,
          }))
        }
      }
      if (USE_MOCK) return mockActivity.map((a) => ({ ...a, project_id: projectId }))
      return workspaceApi.fetchProjectActivity(projectId)
    },
    enabled: !!projectId,
  })
}

function useTasksQuery(projectId: string, decisionId?: string) {
  return useQuery({
    queryKey: ['workspace', 'tasks', projectId, decisionId],
    queryFn: async (): Promise<Task[]> => {
      if (USE_MOCK) {
        const tasks = mockTasks.map((t) => ({ ...t, project_id: projectId }))
        return decisionId ? tasks.filter((t) => t.decision_id === decisionId || t.related_decision_id === decisionId) : tasks
      }
      return workspaceApi.fetchProjectTasks(projectId, decisionId ? { decisionId } : undefined)
    },
    enabled: !!projectId,
  })
}

function useWebhooksQuery(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'webhooks', projectId],
    queryFn: async (): Promise<Webhook[]> => {
      if (USE_MOCK) return mockWebhooks.map((w) => ({ ...w, project_id: projectId }))
      return workspaceApi.fetchProjectWebhooks(projectId)
    },
    enabled: !!projectId,
  })
}

function useClientLinksQuery(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'client-links', projectId],
    queryFn: async (): Promise<ClientLink[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await (supabase as any)
          .from('client_links')
          .select('id, project_id, decision_id, token, expires_at, otp_required, created_at, used_at, is_active')
          .eq('project_id', projectId)
          .eq('is_active', true)
        if (data) {
          type L = { id: string; project_id: string; decision_id: string | null; token: string; expires_at: string | null; otp_required: boolean; created_at: string; used_at: string | null; is_active: boolean }
          const base = typeof window !== 'undefined' ? window.location?.origin ?? '' : ''
          return (data as L[]).map((l) => ({
            id: l.id,
            project_id: l.project_id,
            decision_id: l.decision_id,
            url: `${base}/portal/${l.token}`,
            expires_at: l.expires_at,
            otp_required: l.otp_required ?? false,
            created_at: l.created_at,
            used_at: l.used_at,
            is_active: l.is_active ?? true,
          }))
        }
      }
      if (USE_MOCK) return mockClientLinks.map((l) => ({ ...l, project_id: projectId }))
      return workspaceApi.fetchProjectClientLinks(projectId)
    },
    enabled: !!projectId,
  })
}

export function useProjectWorkspace(projectId: string) {
  const project = useProjectQuery(projectId)
  const decisions = useDecisionsQuery(projectId)
  const files = useFilesQuery(projectId)
  const team = useTeamQuery(projectId)
  const templates = useMockTemplates()
  const activity = useActivityQuery(projectId)
  const clientLinks = useClientLinksQuery(projectId)
  const tasks = useTasksQuery(projectId)
  const webhooks = useWebhooksQuery(projectId)

  const isLoading =
    project.isLoading ||
    decisions.isLoading ||
    files.isLoading ||
    team.isLoading ||
    templates.isLoading ||
    activity.isLoading ||
    clientLinks.isLoading ||
    tasks.isLoading ||
    webhooks.isLoading

  const error = project.error || decisions.error || files.error || team.error

  return {
    project: project.data,
    decisions: decisions.data ?? [],
    files: files.data ?? [],
    team: team.data ?? [],
    templates: templates.data ?? [],
    activity: activity.data ?? [],
    clientLinks: clientLinks.data ?? [],
    tasks: tasks.data ?? [],
    webhooks: webhooks.data ?? [],
    isLoading,
    error,
    refetch: () => {
      project.refetch()
      decisions.refetch()
      files.refetch()
      team.refetch()
      templates.refetch()
      activity.refetch()
      clientLinks.refetch()
      tasks.refetch()
      webhooks.refetch()
    },
  }
}

export function useCreateClientLink(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      decision_id?: string
      expires_at?: string
      otp_required?: boolean
      max_usage?: number | null
    }) => {
      if (USE_MOCK) {
        return {
          id: `link-${Date.now()}`,
          project_id: projectId,
          decision_id: data.decision_id ?? null,
          url: `https://app.archject.com/portal/mock-${Date.now()}`,
          expires_at: data.expires_at ?? null,
          otp_required: data.otp_required ?? false,
          created_at: new Date().toISOString(),
          used_at: null,
          is_active: true,
        }
      }
      return workspaceApi.createClientLink({
        project_id: projectId,
        ...data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'client-links', projectId] })
      toast.success('Client link created')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create link')
    },
  })
}

export function useRevokeClientLink(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (linkId: string) => {
      if (USE_MOCK) return
      return workspaceApi.revokeClientLink(linkId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'client-links', projectId] })
      toast.success('Link revoked')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke link')
    },
  })
}

export function useReissueClientLink(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (linkId: string) => {
      if (USE_MOCK) {
        const base = typeof window !== 'undefined' ? window.location?.origin ?? '' : ''
        return { id: linkId, url: `${base}/portal/reissued-${Date.now()}`, project_id: projectId } as ClientLink
      }
      return workspaceApi.reissueClientLink(linkId)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'client-links', projectId] })
      if (data?.url) {
        navigator.clipboard.writeText(data.url)
        toast.success('New link generated and copied to clipboard')
      } else {
        toast.success('Link reissued')
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to reissue link')
    },
  })
}

export function useExtendClientLink(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ linkId, expiresAt }: { linkId: string; expiresAt: string }) => {
      if (USE_MOCK) return { id: linkId, expires_at: expiresAt } as ClientLink
      return workspaceApi.extendClientLink(linkId, expiresAt)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'client-links', projectId] })
      toast.success('Link expiry extended')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to extend link')
    },
  })
}

export function useProjectTasks(projectId: string, decisionId?: string) {
  return useTasksQuery(projectId, decisionId)
}

export function useProjectWebhooks(projectId: string) {
  return useWebhooksQuery(projectId)
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      decision_id?: string
      description: string
      assignee_id?: string
      due_date?: string
      priority?: 'low' | 'med' | 'high'
      notes?: string
    }) => {
      if (USE_MOCK) {
        return {
          id: `task-${Date.now()}`,
          project_id: projectId,
          decision_id: data.decision_id ?? null,
          related_decision_id: data.decision_id ?? null,
          description: data.description,
          status: 'pending' as const,
          priority: (data.priority ?? 'med') as Task['priority'],
          notes: data.notes ?? null,
          due_at: data.due_date ?? null,
          assigned_to: data.assignee_id ?? null,
          assignee_id: data.assignee_id ?? null,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Task
      }
      return workspaceApi.createTask(projectId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] })
      toast.success('Task created')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create task')
    },
  })
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { taskId: string; status?: Task['status']; assignee_id?: string; due_date?: string; priority?: Task['priority']; notes?: string }) => {
      const { taskId, ...rest } = data
      if (USE_MOCK) return mockTasks[0] as Task
      return workspaceApi.updateTask(projectId, taskId, rest)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] })
      toast.success('Task updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    },
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      if (USE_MOCK) return
      return workspaceApi.deleteTask(projectId, taskId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] })
      toast.success('Task removed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove task')
    },
  })
}

export function useCreateWebhook(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { url: string; events?: string[]; signing_secret?: string }) => {
      if (USE_MOCK) {
        return {
          id: `wh-${Date.now()}`,
          project_id: projectId,
          target_url: data.url,
          url: data.url,
          events: data.events ?? ['approval.completed', 'decision.created'],
          enabled: true,
          status: 'active' as const,
          last_trigger_at: null,
          attempts: 0,
        }
      }
      return workspaceApi.createWebhook(projectId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'webhooks', projectId] })
      toast.success('Webhook added')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add webhook')
    },
  })
}

export function useUpdateWebhook(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { webhookId: string; url?: string; events?: string[]; enabled?: boolean }) => {
      if (USE_MOCK) return mockWebhooks[0] as Webhook
      return workspaceApi.updateWebhook(projectId, data.webhookId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'webhooks', projectId] })
      toast.success('Webhook updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update webhook')
    },
  })
}

export function useDeleteWebhook(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (webhookId: string) => {
      if (USE_MOCK) return
      return workspaceApi.deleteWebhook(projectId, webhookId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'webhooks', projectId] })
      toast.success('Webhook removed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove webhook')
    },
  })
}

export function useTestWebhook(projectId: string) {
  return useMutation({
    mutationFn: async (webhookId: string) => {
      if (USE_MOCK) return { success: true }
      return workspaceApi.testWebhook(projectId, webhookId)
    },
    onSuccess: (data) => {
      if (data?.success) toast.success('Test payload sent')
      else toast.error(data?.message ?? 'Test failed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Test failed')
    },
  })
}

export function useCreateExport(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (type: 'pdf' | 'csv' | 'json') => {
      if (USE_MOCK) {
        return {
          id: `exp-${Date.now()}`,
          project_id: projectId,
          type,
          status: 'processing' as const,
          created_at: new Date().toISOString(),
          user_id: null,
        }
      }
      const { createExport } = await import('@/api/exports')
      const format = type.toUpperCase() as 'PDF' | 'CSV' | 'JSON'
      const res = await createExport({
        projectId,
        format,
        scope: 'project',
      })
      return {
        id: res.exportId,
        project_id: projectId,
        type,
        status: res.status === 'completed' ? 'completed' : 'processing',
        created_at: new Date().toISOString(),
        user_id: null,
        artifact_url: res.artifactUrl,
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'exports', projectId] })
      queryClient.invalidateQueries({ queryKey: ['exports', projectId] })
      toast.success(`Export started: ${data.type.toUpperCase()}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to start export')
    },
  })
}
