/**
 * Legal API - fetches privacy policy, terms of service, and related data.
 * Uses static/mock data; can be wired to backend when available.
 */

import { privacyPolicy } from '@/lib/legal-data'
import { termsOfServiceDocument } from '@/lib/terms-of-service-data'
import type { PrivacyPolicy, LegalDocument } from '@/types/legal'

export async function getPrivacyPolicy(): Promise<PrivacyPolicy> {
  return Promise.resolve(privacyPolicy)
}

export async function getRegions(): Promise<{ regions: string[] }> {
  return Promise.resolve({
    regions: ['EU', 'US', 'APAC', 'OTHER'],
  })
}

export async function getTermsOfService(): Promise<LegalDocument> {
  return Promise.resolve(termsOfServiceDocument)
}
