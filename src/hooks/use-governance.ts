/**
 * Security, Privacy & Compliance - Governance React Query hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  AuditLogFilters,
  CreateExportJobRequest,
  CreateRetentionPolicyRequest,
  UpdatePrivacyControlRequest,
} from '@/types/governance'
import {
  fetchAuditLogs,
  fetchExportJobs,
  fetchExportJob,
  createExportJob,
  abortExportJob,
  retryExportJob,
  fetchRetentionPolicies,
  createRetentionPolicy,
  updateRetentionPolicy,
  deleteRetentionPolicy,
  fetchPrivacyControls,
  updatePrivacyControls,
  fetchSystemHealth,
  fetchComplianceStatus,
} from '@/api/governance'
import { mockWorkspaces } from '@/lib/governance-mock'

export const GOVERNANCE_QUERY_KEYS = {
  auditLogs: ['governance', 'audit-logs'] as const,
  exportJobs: ['governance', 'export-jobs'] as const,
  exportJob: (id: string) => ['governance', 'export-job', id] as const,
  retentionPolicies: ['governance', 'retention-policies'] as const,
  privacyControls: ['governance', 'privacy-controls'] as const,
  systemHealth: ['governance', 'system-health'] as const,
  complianceStatus: ['governance', 'compliance-status'] as const,
}

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: [...GOVERNANCE_QUERY_KEYS.auditLogs, filters ?? {}],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30 * 1000,
  })
}

/** Alias for admin audit logs page compatibility */
export const useGovernanceAuditLogs = useAuditLogs

export function useExportJobs(workspaceId?: string) {
  return useQuery({
    queryKey: [...GOVERNANCE_QUERY_KEYS.exportJobs, workspaceId ?? 'all'],
    queryFn: () => fetchExportJobs(workspaceId),
    staleTime: 15 * 1000,
  })
}

export function useExportJob(jobId: string | null) {
  return useQuery({
    queryKey: GOVERNANCE_QUERY_KEYS.exportJob(jobId ?? ''),
    queryFn: () => fetchExportJob(jobId!),
    enabled: !!jobId,
    staleTime: 5 * 1000,
  })
}

export function useCreateExportJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExportJobRequest) => createExportJob(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOVERNANCE_QUERY_KEYS.exportJobs })
      toast.success('Export job created')
    },
    onError: () => {
      toast.error('Failed to create export job')
    },
  })
}

export function useAbortExportJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => abortExportJob(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOVERNANCE_QUERY_KEYS.exportJobs })
      toast.success('Export job aborted')
    },
    onError: () => {
      toast.error('Failed to abort export job')
    },
  })
}

export function useRetryExportJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => retryExportJob(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOVERNANCE_QUERY_KEYS.exportJobs })
      toast.success('Export job retried')
    },
    onError: () => {
      toast.error('Failed to retry export job')
    },
  })
}

export function useRetentionPolicies(workspaceId?: string) {
  return useQuery({
    queryKey: [...GOVERNANCE_QUERY_KEYS.retentionPolicies, workspaceId ?? 'all'],
    queryFn: () => fetchRetentionPolicies(workspaceId),
    staleTime: 60 * 1000,
  })
}

export function useCreateRetentionPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRetentionPolicyRequest) =>
      createRetentionPolicy(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOVERNANCE_QUERY_KEYS.retentionPolicies })
      toast.success('Retention policy created')
    },
    onError: () => {
      toast.error('Failed to create retention policy')
    },
  })
}

export function useUpdateRetentionPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateRetentionPolicyRequest>
    }) => updateRetentionPolicy(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOVERNANCE_QUERY_KEYS.retentionPolicies })
      toast.success('Retention policy updated')
    },
    onError: () => {
      toast.error('Failed to update retention policy')
    },
  })
}

export function useDeleteRetentionPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRetentionPolicy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOVERNANCE_QUERY_KEYS.retentionPolicies })
      toast.success('Retention policy deleted')
    },
    onError: () => {
      toast.error('Failed to delete retention policy')
    },
  })
}

export function usePrivacyControls(workspaceId?: string) {
  return useQuery({
    queryKey: [...GOVERNANCE_QUERY_KEYS.privacyControls, workspaceId ?? 'default'],
    queryFn: () => fetchPrivacyControls(workspaceId),
    staleTime: 60 * 1000,
  })
}

export function useUpdatePrivacyControls() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string
      data: UpdatePrivacyControlRequest
    }) => updatePrivacyControls(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      qc.invalidateQueries({
        queryKey: [...GOVERNANCE_QUERY_KEYS.privacyControls, workspaceId],
      })
      toast.success('Privacy controls updated')
    },
    onError: () => {
      toast.error('Failed to update privacy controls')
    },
  })
}

export function useSystemHealth() {
  return useQuery({
    queryKey: GOVERNANCE_QUERY_KEYS.systemHealth,
    queryFn: fetchSystemHealth,
    staleTime: 30 * 1000,
  })
}

export function useComplianceStatus() {
  return useQuery({
    queryKey: GOVERNANCE_QUERY_KEYS.complianceStatus,
    queryFn: fetchComplianceStatus,
    staleTime: 60 * 1000,
  })
}

export function useGovernanceWorkspaces() {
  return { data: mockWorkspaces, isLoading: false }
}

/** Alias for settings retention page */
export const useGovernanceRetentionPolicies = useRetentionPolicies
export const useCreateGovernanceRetentionPolicy = useCreateRetentionPolicy

/** Alias for settings privacy page */
export const useGovernancePrivacyControls = usePrivacyControls
export const useUpdateGovernancePrivacyControls = useUpdatePrivacyControls
