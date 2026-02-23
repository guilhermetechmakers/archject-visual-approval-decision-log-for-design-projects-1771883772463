/**
 * Client Portal (No-login) API
 * Endpoints for decision no-login view, approve, comment, annotation, links, export
 */

import { api } from '@/lib/api'
import type {
  NoLoginViewPayload,
  ApprovePayload,
  CommentPayload,
  AnnotationPayload,
  GenerateLinkPayload,
  GenerateLinkResponse,
  VerifyOtpPayload,
  ClientPortalComment,
  ClientPortalAnnotation,
} from '@/types/client-portal'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function fetchNoLoginView(
  token: string
): Promise<NoLoginViewPayload> {
  return api.get<NoLoginViewPayload>(
    `/decisions/no-login-view?token=${encodeURIComponent(token)}`
  )
}

export async function validateLink(token: string): Promise<{
  valid: boolean
  decisionId?: string
  expiresAt?: string | null
  requiresOtp?: boolean
}> {
  return api.get(`/links/validate?token=${encodeURIComponent(token)}`)
}

export async function approveDecision(
  token: string,
  decisionId: string,
  payload: ApprovePayload
): Promise<{ success: boolean }> {
  return api.post(`/decisions/${decisionId}/approve?token=${token}`, payload)
}

export async function requestChanges(
  token: string,
  decisionId: string,
  payload: { clientName?: string; message?: string }
): Promise<{ success: boolean }> {
  return api.post(
    `/decisions/${decisionId}/request-changes?token=${token}`,
    payload
  )
}

export async function addComment(
  token: string,
  decisionId: string,
  payload: CommentPayload
): Promise<ClientPortalComment> {
  return api.post(
    `/decisions/${decisionId}/comment?token=${token}`,
    payload
  )
}

export async function addAnnotation(
  token: string,
  decisionId: string,
  payload: AnnotationPayload
): Promise<ClientPortalAnnotation> {
  const path = `/decisions/${decisionId}/annotation`
  return api.post<ClientPortalAnnotation>(
    `${path}?token=${encodeURIComponent(token)}`,
    payload
  )
}

export async function generateShareLink(
  decisionId: string,
  payload: GenerateLinkPayload
): Promise<GenerateLinkResponse> {
  const body = { ...payload, decisionId }
  const res = await api.post<GenerateLinkResponse>('/links/generate', body)
  const base = window.location.origin
  return {
    ...res,
    url: res.url ?? `${base}/portal/${res.token}`,
  }
}

export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<{ verified: boolean }> {
  return api.post('/verification/verify-otp', payload)
}

export async function sendOtp(
  email: string,
  decisionId: string
): Promise<{ sent: boolean }> {
  return api.post('/verification/send-otp', { email, decisionId })
}

export async function exportDecisionNoLogin(
  token: string,
  decisionId: string,
  format: 'pdf' | 'json'
): Promise<Blob> {
  const url = `${API_BASE}/decisions/${decisionId}/export?token=${encodeURIComponent(token)}&format=${format}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Export failed')
  return res.blob()
}
