/**
 * React Query hooks for Light Tasking - tasks linked to decisions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as workspaceApi from '@/api/workspace'
export function useProjectTasks(
  projectId: string,
  params?: { decisionId?: string; status?: string }
) {
  return useQuery({
    queryKey: ['workspace', 'tasks', projectId, params],
    queryFn: () => workspaceApi.fetchProjectTasks(projectId, params),
    enabled: !!projectId,
  })
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof workspaceApi.createTask>[1]) =>
      workspaceApi.createTask(projectId, data),
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
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string
      data: Parameters<typeof workspaceApi.updateTask>[2]
    }) => workspaceApi.updateTask(projectId, taskId, data),
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
    mutationFn: (taskId: string) => workspaceApi.deleteTask(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'tasks', projectId] })
      toast.success('Task removed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove task')
    },
  })
}
