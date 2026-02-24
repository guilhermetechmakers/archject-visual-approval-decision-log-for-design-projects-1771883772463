/**
 * Settings React Query hooks with API + mock fallback
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/api/settings'
import {
  MOCK_PROFILE,
  MOCK_WORKSPACE,
  MOCK_BILLING,
  MOCK_NOTIFICATIONS,
  MOCK_INTEGRATIONS,
  MOCK_WEBHOOKS,
  MOCK_API_KEYS,
  MOCK_SESSIONS,
  MOCK_DATA_EXPORTS,
  MOCK_RETENTION,
  MOCK_AUDIT_LOGS,
  MOCK_TEAM,
  MOCK_CONNECTED_ACCOUNTS,
} from '@/lib/settings-mock'

const SETTINGS_KEYS = ['settings'] as const

async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export function useSettingsProfile() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'profile'],
    queryFn: () => withFallback(() => settingsApi.getProfile(), MOCK_PROFILE),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'profile'] }),
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const { avatarUrl } = await settingsApi.uploadAvatar(file)
      await settingsApi.updateProfile({ avatar: avatarUrl })
      return avatarUrl
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'profile'] }),
  })
}

export function useSettingsWorkspace() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'workspace'],
    queryFn: () => withFallback(() => settingsApi.getWorkspace(), MOCK_WORKSPACE),
  })
}

export function useUpdateWorkspaceBranding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.updateWorkspaceBranding,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'workspace'] }),
  })
}

export function useSettingsBilling() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'billing'],
    queryFn: () => withFallback(() => settingsApi.getBilling(), MOCK_BILLING),
  })
}

export function useSettingsNotifications() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'notifications'],
    queryFn: () => withFallback(() => settingsApi.getNotifications(), MOCK_NOTIFICATIONS),
  })
}

export function useUpdateNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.updateNotifications,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'notifications'] }),
  })
}

export function useSettingsIntegrations() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'integrations'],
    queryFn: () => withFallback(() => settingsApi.getIntegrations(), MOCK_INTEGRATIONS),
  })
}

export function useConnectIntegration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variables: { type: string; data?: Record<string, unknown> }) =>
      settingsApi.connectIntegration(variables.type, variables.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'integrations'] }),
  })
}

export function useDisconnectIntegration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.disconnectIntegration,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'integrations'] }),
  })
}

export function useSettingsWebhooks() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'webhooks'],
    queryFn: () => withFallback(() => settingsApi.getWebhooks(), MOCK_WEBHOOKS),
  })
}

export function useCreateWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { url: string; events: string[]; signingSecret?: string }) =>
      settingsApi.createWebhook(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'webhooks'] }),
  })
}

export function useUpdateWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { url?: string; events?: string[]; enabled?: boolean } }) =>
      settingsApi.updateWebhook(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'webhooks'] }),
  })
}

export function useDeleteWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.deleteWebhook,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'webhooks'] }),
  })
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: settingsApi.testWebhook,
  })
}

export function useSettingsApiKeys() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'api-keys'],
    queryFn: () => withFallback(() => settingsApi.getApiKeys(), MOCK_API_KEYS),
  })
}

export function useCreateApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.createApiKey,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'api-keys'] }),
  })
}

export function useRevokeApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.revokeApiKey,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'api-keys'] }),
  })
}

export function useSettingsSessions() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'sessions'],
    queryFn: () => withFallback(() => settingsApi.getSessions(), MOCK_SESSIONS),
  })
}

export function useConnectedAccounts() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'connected-accounts'],
    queryFn: () => withFallback(() => settingsApi.getConnectedAccounts(), MOCK_CONNECTED_ACCOUNTS),
  })
}

export function useRevokeSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.revokeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'sessions'] }),
  })
}

export function useRevokeAllSessionsExceptCurrent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (exceptSessionId?: string) =>
      settingsApi.revokeAllSessionsExceptCurrent(exceptSessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'sessions'] }),
  })
}

export function useSettingsDataExports() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'data-exports'],
    queryFn: () => withFallback(() => settingsApi.getDataExports(), MOCK_DATA_EXPORTS),
  })
}

export function useCreateDataExport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (options?: { format?: 'JSON' | 'CSV' | 'JSONL' | 'PDF' }) =>
      settingsApi.createDataExport(options),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'data-exports'] }),
  })
}

export function useSettingsRetention() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'retention'],
    queryFn: () => withFallback(() => settingsApi.getRetention(), MOCK_RETENTION),
  })
}

export function useUpdateRetention() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.updateRetention,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'retention'] }),
  })
}

export function useSettingsAuditLogs(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'audit-logs', params],
    queryFn: () => withFallback(() => settingsApi.getAuditLogs(params), MOCK_AUDIT_LOGS),
  })
}

/** Audit logs without fallback - exposes isError for inline error feedback */
export function useSettingsAuditLogsStrict(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'audit-logs-strict', params],
    queryFn: () => settingsApi.getAuditLogs(params),
    retry: 1,
  })
}

export function useSettingsTeam() {
  return useQuery({
    queryKey: [...SETTINGS_KEYS, 'team'],
    queryFn: () => withFallback(() => settingsApi.getTeam(), MOCK_TEAM),
  })
}

export function useInviteTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.inviteTeamMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SETTINGS_KEYS, 'team'] }),
  })
}
