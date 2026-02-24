/**
 * Legal API - fetches privacy policy and related data.
 * Uses static/mock data; can be wired to backend when available.
 */

import { privacyPolicy } from '@/lib/legal-data'
import type { PrivacyPolicy } from '@/types/legal'

export async function getPrivacyPolicy(): Promise<PrivacyPolicy> {
  return Promise.resolve(privacyPolicy)
}

export async function getRegions(): Promise<{ regions: string[] }> {
  return Promise.resolve({
    regions: ['EU', 'US', 'APAC', 'OTHER'],
  })
}
