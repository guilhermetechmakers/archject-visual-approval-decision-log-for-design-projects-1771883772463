/**
 * Decision Detail API - Options, Comments, Approvals, Files, Share Link, Export
 */

import { api } from '@/lib/api'
import type {
  DecisionDetailFull,
  DecisionOption,
  DecisionComment,
  DecisionApproval,
  DecisionFile,
} from '@/types/decision-detail'

export interface ShareLinkPayload {
  expiresAt?: string
  otpRequired?: boolean
}

export interface ShareLinkResponse {
  id: string
  url: string
  expiresAt?: string | null
  otpRequired: boolean
}

export async function fetchDecisionDetail(
  decisionId: string
): Promise<DecisionDetailFull> {
  return api.get<DecisionDetailFull>(`/decisions/${decisionId}/detail`)
}

export async function fetchDecisionOptions(
  decisionId: string
): Promise<DecisionOption[]> {
  return api.get<DecisionOption[]>(`/decisions/${decisionId}/options`)
}

export async function updateOptionRecommended(
  decisionId: string,
  optionId: string,
  isRecommended: boolean
): Promise<DecisionOption> {
  return api.patch<DecisionOption>(
    `/decisions/${decisionId}/options/${optionId}`,
    { isRecommended }
  )
}

export async function createComment(
  decisionId: string,
  payload: { content: string; parentCommentId?: string | null; mentions?: string[] }
): Promise<DecisionComment> {
  return api.post<DecisionComment>(`/decisions/${decisionId}/comments`, payload)
}

export async function fetchDecisionComments(
  decisionId: string
): Promise<DecisionComment[]> {
  return api.get<DecisionComment[]>(`/decisions/${decisionId}/comments`)
}

export async function fetchDecisionApprovals(
  decisionId: string
): Promise<DecisionApproval[]> {
  return api.get<DecisionApproval[]>(`/decisions/${decisionId}/approvals`)
}

export async function fetchDecisionFiles(
  decisionId: string
): Promise<DecisionFile[]> {
  return api.get<DecisionFile[]>(`/decisions/${decisionId}/files`)
}

export async function createShareLink(
  decisionId: string,
  payload: ShareLinkPayload
): Promise<ShareLinkResponse> {
  return api.post<ShareLinkResponse>(
    `/decisions/${decisionId}/share-link`,
    payload
  )
}

export async function revokeApproval(decisionId: string): Promise<void> {
  return api.post(`/decisions/${decisionId}/admin/revoke-approval`)
}

export async function exportDecision(
  decisionId: string,
  format: 'pdf' | 'csv' | 'json'
): Promise<Blob> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL ?? '/api'}/decisions/${decisionId}/export?format=${format}`,
    { method: 'GET' }
  )
  if (!response.ok) throw new Error('Export failed')
  return response.blob()
}
