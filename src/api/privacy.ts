/**
 * Privacy Policy API
 * Fetches policy data; uses static data when no backend is available
 */

import { api } from '@/lib/api'
import { privacyPolicyData } from '@/lib/privacy-policy-data'
import type { PrivacyPolicy } from '@/types/legal'

const USE_MOCK = true // Set to false when backend /api/privacy-policy is available

export async function getPrivacyPolicy(): Promise<PrivacyPolicy> {
  if (USE_MOCK) {
    return Promise.resolve(privacyPolicyData)
  }
  return api.get<PrivacyPolicy>('/privacy-policy')
}

export async function getPrivacyPolicyExportUrl(params: {
  region?: string
  includeNotices?: boolean
}): Promise<string> {
  const qs = new URLSearchParams()
  if (params.region) qs.set('region', params.region)
  if (params.includeNotices !== undefined) qs.set('includeNotices', String(params.includeNotices))
  const query = qs.toString()
  const base = import.meta.env.VITE_API_URL ?? ''
  return `${base}/api/privacy-policy/export${query ? `?${query}` : ''}`
}
