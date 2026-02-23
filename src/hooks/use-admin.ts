/**
 * Admin React Query hooks - data fetching for Admin Dashboard.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchAdminDashboardSummary,
  fetchAdminWorkspaces,
  fetchAdminDisputes,
  fetchAdminBillingExceptions,
  fetchAdminFeatureToggles,
  fetchAdminExportJobs,
  fetchAdminRetentionPolicies,
  fetchAdminAuditLogs,
  fetchAdminHealthHistory,
  postWorkspaceImpersonate,
  postWorkspaceEscalate,
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
  disputes: ['admin', 'disputes'] as const,
  billingExceptions: ['admin', 'billing-exceptions'] as const,
  featureToggles: ['admin', 'feature-toggles'] as const,
  exportJobs: ['admin', 'export-jobs'] as const,
  retentionPolicies: ['admin', 'retention-policies'] as const,
  auditLogs: ['admin', 'audit-logs'] as const,
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

export function useAdminWorkspaces() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.workspaces,
    queryFn: fetchAdminWorkspaces,
    staleTime: 60 * 1000,
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

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.auditLogs,
    queryFn: fetchAdminAuditLogs,
    staleTime: 30 * 1000,
  })
}

export function useWorkspaceImpersonate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postWorkspaceImpersonate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.auditLogs })
      toast.success('Impersonation started. Redirecting...')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to start impersonation')
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
