/**
 * React Query hooks for Project Workspace data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as workspaceApi from '@/api/workspace'
import {
  mockProject,
  mockDecisions,
  mockFiles,
  mockTeam,
  mockTemplates,
  mockActivity,
  mockClientLinks,
} from '@/lib/workspace-mock'

const projectNames: Record<string, string> = {
  'p-1': 'Riverside Villa',
  'p-2': 'Urban Loft',
  'p-3': 'Garden House',
  '1': 'Riverside Villa',
  '2': 'Urban Loft',
  '3': 'Garden House',
}

const USE_MOCK = true // Toggle when API is ready

function useMockProject(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'project', projectId],
    queryFn: async () => {
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

function useMockDecisions(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'decisions', projectId],
    queryFn: async () => {
      if (USE_MOCK)
        return mockDecisions.map((d) => ({ ...d, project_id: projectId }))
      return workspaceApi.fetchProjectDecisions(projectId)
    },
    enabled: !!projectId,
  })
}

function useMockFiles(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'files', projectId],
    queryFn: async () => {
      if (USE_MOCK)
        return mockFiles.map((f) => ({ ...f, project_id: projectId }))
      return workspaceApi.fetchProjectFiles(projectId)
    },
    enabled: !!projectId,
  })
}

function useMockTeam(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'team', projectId],
    queryFn: async () => {
      if (USE_MOCK)
        return mockTeam.map((t) => ({ ...t, project_id: projectId }))
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

function useMockActivity(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'activity', projectId],
    queryFn: async () => {
      if (USE_MOCK)
        return mockActivity.map((a) => ({ ...a, project_id: projectId }))
      return workspaceApi.fetchProjectActivity(projectId)
    },
    enabled: !!projectId,
  })
}

function useMockClientLinks(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'client-links', projectId],
    queryFn: async () => {
      if (USE_MOCK)
        return mockClientLinks.map((l) => ({ ...l, project_id: projectId }))
      return workspaceApi.fetchProjectClientLinks(projectId)
    },
    enabled: !!projectId,
  })
}

export function useProjectWorkspace(projectId: string) {
  const project = useMockProject(projectId)
  const decisions = useMockDecisions(projectId)
  const files = useMockFiles(projectId)
  const team = useMockTeam(projectId)
  const templates = useMockTemplates()
  const activity = useMockActivity(projectId)
  const clientLinks = useMockClientLinks(projectId)

  const isLoading =
    project.isLoading ||
    decisions.isLoading ||
    files.isLoading ||
    team.isLoading ||
    templates.isLoading ||
    activity.isLoading ||
    clientLinks.isLoading

  const error = project.error || decisions.error || files.error || team.error

  return {
    project: project.data,
    decisions: decisions.data ?? [],
    files: files.data ?? [],
    team: team.data ?? [],
    templates: templates.data ?? [],
    activity: activity.data ?? [],
    clientLinks: clientLinks.data ?? [],
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
      return workspaceApi.createExport(projectId, type)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'exports', projectId] })
      toast.success(`Export started: ${data.type.toUpperCase()}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to start export')
    },
  })
}
