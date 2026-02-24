/**
 * React Query hooks for decision notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as notificationsApi from '@/api/notifications'

export function useNotifications(userId: string | undefined, unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', userId, unreadOnly],
    queryFn: () =>
      notificationsApi.fetchNotifications(userId!, { unreadOnly, limit: 30 }),
    enabled: !!userId,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as read')
    },
  })
}
