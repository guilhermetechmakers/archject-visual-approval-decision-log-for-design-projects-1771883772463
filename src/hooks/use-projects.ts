/**
 * React Query hooks for projects and workspaces
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as projectsApi from '@/api/projects'
import { fetchWorkspaces } from '@/api/dashboard'

const PROJECTS_KEY = ['projects'] as const
const WORKSPACES_KEY = ['workspaces'] as const

export function useProjects(workspaceId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, workspaceId ?? 'all'],
    queryFn: () => projectsApi.fetchProjects(workspaceId),
    staleTime: 60 * 1000,
  })
}

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_KEY,
    queryFn: fetchWorkspaces,
    staleTime: 60 * 1000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      toast.success('Project created')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create project')
    },
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      toast.success('Workspace created')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create workspace')
    },
  })
}

export function useArchiveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.archiveProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      toast.success('Project archived')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to archive project')
    },
  })
}

export function useRestoreProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.restoreProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      toast.success('Project restored')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to restore project')
    },
  })
}
