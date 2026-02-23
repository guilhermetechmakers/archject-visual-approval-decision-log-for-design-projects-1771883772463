/**
 * Settings API - Account, workspace, branding, notifications, integrations, etc.
 */

import { api } from '@/lib/api'
import type {
  UserProfile,
  Workspace,
  WorkspaceBranding,
  BillingInfo,
  NotificationSettings,
  Integration,
  Webhook,
  ApiKey,
  Session,
  DataExport,
  RetentionPolicy,
  AuditLogEntry,
  TeamMember,
} from '@/types/settings'

export const settingsApi = {
  getProfile: () => api.get<UserProfile>('/settings'),
  updateProfile: (data: Partial<Pick<UserProfile, 'name' | 'avatar'>>) =>
    api.put<UserProfile>('/settings/profile', data),

  getWorkspace: () => api.get<Workspace>('/settings/workspace'),
  updateWorkspaceBranding: (data: Partial<WorkspaceBranding>) =>
    api.put<Workspace>('/settings/workspace', { branding: data }),
  uploadLogo: (formData: FormData) =>
    fetch('/api/settings/workspace/logo-upload', {
      method: 'POST',
      body: formData,
    }).then((r) => {
      if (!r.ok) throw new Error(r.statusText)
      return r.json() as Promise<{ logoUrl: string }>
    }),

  getBilling: () => api.get<BillingInfo>('/settings/billing'),
  updatePaymentMethod: (data: unknown) =>
    api.post<{ success: boolean }>('/settings/billing/method', data),

  getNotifications: () => api.get<NotificationSettings>('/settings/notifications'),
  updateNotifications: (data: NotificationSettings) =>
    api.put<NotificationSettings>('/settings/notifications', data),

  getIntegrations: () => api.get<Integration[]>('/settings/integrations'),
  connectIntegration: (type: string, data?: Record<string, unknown>) =>
    api.post<Integration>('/settings/integrations/connect', { type, ...(data ?? {}) }),
  testIntegration: (id: string) =>
    api.post<{ success: boolean }>(`/settings/integrations/test`, { id }),
  disconnectIntegration: (id: string) =>
    api.delete<void>(`/settings/integrations/${id}`),

  getWebhooks: () => api.get<Webhook[]>('/settings/webhooks'),
  createWebhook: (data: { url: string; events: string[] }) =>
    api.post<Webhook>('/settings/webhooks', data),
  testWebhook: (id: string) =>
    api.post<{ success: boolean }>('/settings/webhooks/test', { id }),

  getApiKeys: () => api.get<ApiKey[]>('/settings/api-keys'),
  createApiKey: (data: { name: string; scopes: string[]; expiresInDays?: number }) =>
    api.post<ApiKey & { key: string }>('/settings/api-keys', data),
  rotateApiKey: (id: string) =>
    api.post<ApiKey & { key: string }>(`/settings/api-keys/rotate/${id}`),
  revokeApiKey: (id: string) =>
    api.delete<void>(`/settings/api-keys/${id}`),

  getDataExports: () => api.get<DataExport[]>('/settings/data-exports'),
  createDataExport: () => api.post<DataExport>('/settings/data-exports'),
  getRetention: () => api.get<RetentionPolicy[]>('/settings/retention'),
  updateRetention: (data: RetentionPolicy) =>
    api.put<RetentionPolicy[]>('/settings/retention', data),

  getAuditLogs: (params?: { limit?: number; offset?: number }) => {
    const limit = params?.limit ?? 50
    const offset = params?.offset ?? 0
    return api.get<AuditLogEntry[]>(`/settings/audit-logs?limit=${limit}&offset=${offset}`)
  },

  getSessions: () => api.get<Session[]>('/settings/sessions'),
  revokeSession: (id: string) =>
    api.post<void>(`/settings/sessions/revoke/${id}`),

  enable2FA: (method: 'sms' | 'authenticator', data?: Record<string, unknown>) =>
    api.post<{ success: boolean }>('/settings/2fa/enable', { method, ...(data ?? {}) }),
  disable2FA: (data?: unknown) =>
    api.post<{ success: boolean }>('/settings/2fa/disable', data),

  getProjects: () => api.get<Workspace[]>('/settings/projects'),
  createProject: (data: { name: string; templateId?: string }) =>
    api.post<Workspace>('/settings/projects/create', data),

  getTeam: () => api.get<TeamMember[]>('/settings/team'),
  inviteTeamMember: (data: { email: string; role: string; projectIds?: string[] }) =>
    api.post<TeamMember>('/settings/team/invite', data),

  getInvoices: () => api.get<{ id: string; date: string; amount: number; status: string }[]>('/settings/invoices'),
  getInvoice: (id: string) =>
    api.get<{ id: string; date: string; amount: number; status: string; downloadUrl?: string }>(
      `/settings/invoices/${id}`
    ),
}
