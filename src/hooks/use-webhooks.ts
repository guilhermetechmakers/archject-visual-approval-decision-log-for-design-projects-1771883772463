/**
 * React Query hooks for Webhook endpoints - project and workspace scope
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as workspaceApi from '@/api/workspace'

export function useProjectWebhooks(projectId: string) {
  return useQuery({
    queryKey: ['workspace', 'webhooks', projectId],
    queryFn: () => workspaceApi.fetchProjectWebhooks(projectId),
    enabled: !!projectId,
  })
}

export function useCreateProjectWebhook(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof workspaceApi.createWebhook>[1]) =>
      workspaceApi.createWebhook(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'webhooks', projectId] })
      toast.success('Webhook added')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add webhook')
    },
  })
}

export function useUpdateProjectWebhook(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      webhookId,
      data,
    }: {
      webhookId: string
      data: Parameters<typeof workspaceApi.updateWebhook>[2]
    }) => workspaceApi.updateWebhook(projectId, webhookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'webhooks', projectId] })
      toast.success('Webhook updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update webhook')
    },
  })
}

export function useDeleteProjectWebhook(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (webhookId: string) =>
      workspaceApi.deleteWebhook(projectId, webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'webhooks', projectId] })
      toast.success('Webhook removed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove webhook')
    },
  })
}

export function useTestProjectWebhook(projectId: string) {
  return useMutation({
    mutationFn: (webhookId: string) =>
      workspaceApi.testWebhook(projectId, webhookId),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success('Test payload delivered')
      } else {
        toast.error(data?.message ?? 'Webhook test failed')
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Webhook test failed')
    },
  })
}
