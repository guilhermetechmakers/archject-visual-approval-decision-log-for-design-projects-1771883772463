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

export function useSnoozeNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ notificationId, until }: { notificationId: string; until: string }) =>
      notificationsApi.snoozeNotification(notificationId, until),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification snoozed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to snooze')
    },
  })
}

export function useMuteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ notificationId, until }: { notificationId: string; until: string }) =>
      notificationsApi.muteNotification(notificationId, until),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification muted')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to mute')
    },
  })
}

export function useNotificationPreferences(
  userId: string | undefined,
  workspaceId?: string | null
) {
  return useQuery({
    queryKey: ['notification-preferences', userId, workspaceId],
    queryFn: () =>
      notificationsApi.fetchNotificationPreferences(userId!, workspaceId),
    enabled: !!userId,
  })
}

export function useUpdateNotificationPreferences(
  userId: string | undefined,
  workspaceId?: string | null
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (prefs: Parameters<typeof notificationsApi.updateNotificationPreferences>[1]) =>
      notificationsApi.updateNotificationPreferences(userId!, prefs, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Preferences saved')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save preferences')
    },
  })
}

export function useTestSendGrid() {
  return useMutation({
    mutationFn: (apiKey?: string) => notificationsApi.testSendGrid(apiKey),
    onSuccess: (data) => {
      if (data.success) toast.success(data.message ?? 'SendGrid test successful')
      else toast.error(data.message ?? 'SendGrid test failed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to send test')
    },
  })
}

export function useTestTwilio() {
  return useMutation({
    mutationFn: (params?: { accountSid?: string; authToken?: string; fromNumber?: string }) =>
      notificationsApi.testTwilio(params),
    onSuccess: (data) => {
      if (data.success) toast.success(data.message ?? 'Twilio test successful')
      else toast.error(data.message ?? 'Twilio test failed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to send test')
    },
  })
}

export function useRequestNotificationExport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { format: 'json' | 'csv'; dateFrom?: string; dateTo?: string }) =>
      notificationsApi.requestNotificationExport(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'data-exports'] })
      toast.success('Export requested. You will be notified when it is ready.')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to request export')
    },
  })
}
