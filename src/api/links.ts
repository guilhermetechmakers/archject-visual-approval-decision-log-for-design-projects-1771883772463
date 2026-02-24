/**
 * Links API - shareable client portal links
 * POST /api/links/generate, GET /api/links/:token/verify, POST /api/links/:token/consume
 * POST /api/links/:token/revoke, POST /api/links/:token/reissue, POST /api/links/:token/extend
 */

import { api } from '@/lib/api'

export interface GenerateLinkPayload {
  decisionId?: string
  projectId?: string
  expiresAt?: string
  expirySeconds?: number
  otpRequired?: boolean
  maxUsage?: number | null
}

export interface GenerateLinkResponse {
  id: string
  token: string
  url: string
  expiresAt?: string | null
  otpRequired: boolean
  maxUsage?: number | null
  createdAt: string
}

export interface VerifyLinkResponse {
  valid: boolean
  decisionId?: string
  projectId?: string
  expiresAt?: string | null
  requiresOtp?: boolean
  usageCount?: number
  maxUsage?: number | null
}

export interface ConsumeLinkResponse {
  success: boolean
  decisionId?: string
  viewPayload?: unknown
}

export interface RevokeLinkResponse {
  success: boolean
}

export interface ReissueLinkResponse {
  id: string
  token: string
  url: string
  expiresAt?: string | null
  otpRequired: boolean
  maxUsage?: number | null
  createdAt: string
}

export interface ExtendLinkPayload {
  expiresAt?: string
  expirySeconds?: number
}

export interface ExtendLinkResponse {
  success: boolean
  expiresAt?: string | null
}

export async function generateLink(
  payload: GenerateLinkPayload
): Promise<GenerateLinkResponse> {
  const res = await api.post<GenerateLinkResponse>('/links/generate', payload)
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return {
    ...res,
    url: res.url ?? `${base}/portal/${res.token}`,
  }
}

export async function verifyLink(token: string): Promise<VerifyLinkResponse> {
  return api.get<VerifyLinkResponse>(`/links/${encodeURIComponent(token)}/verify`)
}

export async function consumeLink(token: string): Promise<ConsumeLinkResponse> {
  return api.post<ConsumeLinkResponse>(
    `/links/${encodeURIComponent(token)}/consume`
  )
}

export async function revokeLink(token: string): Promise<RevokeLinkResponse> {
  return api.post<RevokeLinkResponse>(
    `/links/${encodeURIComponent(token)}/revoke`
  )
}

export async function reissueLink(
  token: string
): Promise<ReissueLinkResponse> {
  const res = await api.post<ReissueLinkResponse>(
    `/links/${encodeURIComponent(token)}/reissue`
  )
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return {
    ...res,
    url: res.url ?? `${base}/portal/${res.token}`,
  }
}

export async function extendLink(
  token: string,
  payload: ExtendLinkPayload
): Promise<ExtendLinkResponse> {
  return api.post<ExtendLinkResponse>(
    `/links/${encodeURIComponent(token)}/extend`,
    payload
  )
}
