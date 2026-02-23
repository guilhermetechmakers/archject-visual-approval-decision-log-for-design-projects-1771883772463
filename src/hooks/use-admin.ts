/**
 * Admin React Query hooks - data fetching for Admin Dashboard.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AdminWorkspacesFilters, AdminUsersFilters, AdminAuditFilters } from '@/api/admin'
import {
  fetchAdminDashboardSummary,
  fetchAdminWorkspaces,
  fetchAdminUsers,
  fetchAdminDisputes,
  fetchAdminBillingExceptions,
  fetchAdminFeatureToggles,
  fetchAdminExportJobs,
  fetchAdminRetentionPolicies,
  fetchAdminAuditLogs,
  fetchAdminEscalations,
  fetchAdminHealthHistory,
  postWorkspaceImpersonate,
  postWorkspaceEscalate,
  postWorkspaceDisable,
  postWorkspaceExport,
  postWorkspaceRetention,
  postCreateEscalation,
  postBulkWorkspaceDisable,
  postUserSuspend,
  postUserActivate,
  postUsersBulkUpdate,
  postDisputeResolve,
  postDisputeEscalate,
  postBillingExceptionApprove,
  postBillingExceptionReject,
  patchFeatureToggle,
  postCreateExport,
} from '@/api/admin'

export const ADMIN_QUERY_KEYS = {
  summary: ['admin', 'dashboard', 'summary'] as const,
  healthHistory: ['admin', 'health', 'history'] as const,
  workspaces: ['admin', 'workspaces'] as const,
  users: ['admin', 'users'] as const,
  disputes: ['admin', 'disputes'] as const,
  billingExceptions: ['admin', 'billing-exceptions'] as const,
  featureToggles: ['admin', 'feature-toggles'] as const,
  exportJobs: ['admin', 'export-jobs'] as const,
  retentionPolicies: ['admin', 'retention-policies'] as const,
  auditLogs: ['admin', 'audit-logs'] as const,
  escalations: ['admin', 'escalations'] as const,
}

export function useAdminDashboardSummary() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.summary,
    queryFn: fetchAdminDashboardSummary,
    staleTime: 30 * 1000,
  })
}

export function useAdminHealthHistory() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.healthHistory,
    queryFn: fetchAdminHealthHistory,
    staleTime: 30 * 1000,
  })
}

export function useAdminWorkspaces(filters?: AdminWorkspacesFilters) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.workspaces, filters],
    queryFn: () => fetchAdminWorkspaces(filters),
    staleTime: 60 * 1000,
  })
}

export function useAdminUsers(filters?: AdminUsersFilters) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.users, filters ?? {}],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 60 * 1000,
  })
}

export function useAdminEscalations() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.escalations,
    queryFn: fetchAdminEscalations,
    staleTime: 30 * 1000,
  })
}

export function useAdminDisputes() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.disputes,
    queryFn: fetchAdminDisputes,
    staleTime: 60 * 1000,
  })
}

export function useAdminBillingExceptions() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.billingExceptions,
    queryFn: fetchAdminBillingExceptions,
    staleTime: 60 * 1000,
  })
}

export function useAdminFeatureToggles() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.featureToggles,
    queryFn: fetchAdminFeatureToggles,
    staleTime: 60 * 1000,
  })
}

export function useAdminExportJobs() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.exportJobs,
    queryFn: fetchAdminExportJobs,
    staleTime: 30 * 1000,
  })
}

export function useAdminRetentionPolicies() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.retentionPolicies,
    queryFn: fetchAdminRetentionPolicies,
    staleTime: 60 * 1000,
  })
}

export function useAdminAuditLogs(filters?: AdminAuditFilters) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.auditLogs, filters],
    queryFn: () => fetchAdminAuditLogs(filters),
    staleTime: 30 * 1000,
  })
}

export function useWorkspaceImpersonate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workspaceId, reason }: { workspaceId: string; reason?: string }) =>
      postWorkspaceImpersonate(workspaceId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
      toast.success('Impersonation started. Redirecting...')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to start impersonation')
    },
  })
}

export function useWorkspaceDisable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workspaceId, reason }: { workspaceId: string; reason: string }) =>
      postWorkspaceDisable(workspaceId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.summary })
      toast.success('Workspace disabled')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to disable workspace')
    },
  })
}

export function useWorkspaceExport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postWorkspaceExport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.exportJobs })
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
      toast.success('Export job queued. You will receive a download link when ready.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to start export')
    },
  })
}

export function useWorkspaceRetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      policy,
    }: {
      workspaceId: string
      policy: { duration_days: number; scope: string }
    }) => postWorkspaceRetention(workspaceId, policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
      toast.success('Retention policy applied')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to set retention policy')
    },
  })
}

export function useCreateEscalation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      workspace_id: string
      user_id?: string
      reason: string
      priority: 'low' | 'medium' | 'high' | 'critical'
      notes?: string
      assigned_team?: string
    }) => postCreateEscalation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.escalations })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.summary })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.auditLogs })
      toast.success('Escalation created')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create escalation')
    },
  })
}

export function useBulkWorkspaceDisable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workspaceIds, reason }: { workspaceIds: string[]; reason: string }) =>
      postBulkWorkspaceDisable(workspaceIds, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.workspaces })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.auditLogs })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.summary })
      toast.success(`Disabled ${data.success} workspace(s)`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to disable workspaces')
    },
  })
}

export function useUserSuspend() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postUserSuspend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.auditLogs })
      toast.success('User suspended')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to suspend user')
    },
  })
}

export function useUserActivate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postUserActivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.auditLogs })
      toast.success('User activated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to activate user')
    },
  })
}

export function useUsersBulkUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userIds, updates }: { userIds: string[]; updates: { status?: string } }) =>
      postUsersBulkUpdate(userIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.auditLogs })
      toast.success('Users updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update users')
    },
  })
}

export function useWorkspaceEscalate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workspaceId, notes }: { workspaceId: string; notes: string }) =>
      postWorkspaceEscalate(workspaceId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.disputes })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.summary })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.escalations })
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
      toast.success('Escalation submitted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to escalate')
    },
  })
}

export function useDisputeResolve() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ disputeId, resolution }: { disputeId: string; resolution: string }) =>
      postDisputeResolve(disputeId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.disputes })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.summary })
      toast.success('Dispute resolved')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to resolve dispute')
    },
  })
}

export function useDisputeEscalate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ disputeId, notes }: { disputeId: string; notes: string }) =>
      postDisputeEscalate(disputeId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.disputes })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.summary })
      toast.success('Dispute escalated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to escalate dispute')
    },
  })
}

export function useBillingExceptionApprove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postBillingExceptionApprove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.billingExceptions })
      toast.success('Billing exception approved')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to approve')
    },
  })
}

export function useBillingExceptionReject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postBillingExceptionReject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.billingExceptions })
      toast.success('Billing exception rejected')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to reject')
    },
  })
}

export function useFeatureToggleUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ featureName, enabled, rolloutPercentage }: { featureName: string; enabled: boolean; rolloutPercentage?: number }) =>
      patchFeatureToggle(featureName, enabled, rolloutPercentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.featureToggles })
      toast.success('Feature toggle updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update feature')
    },
  })
}

export function useCreateExport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, scope }: { type: string; scope: string }) => postCreateExport(type, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.exportJobs })
      toast.success('Export job queued')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create export')
    },
  })
}
