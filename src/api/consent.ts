/**
 * Cookie consent API contract (placeholder for future backend integration).
 * No external APIs required for current scope. Data persists in localStorage.
 *
 * Future API Endpoints:
 * - GET /consent -> { consent: ConsentState, history: ChangeHistoryEntry[] }
 * - POST /consent -> { success: boolean } (update preferences with delta)
 * - GET /consent/history -> { history: ChangeHistoryEntry[] }
 *
 * When integrating: protect endpoints, validate with Zod, respect user data ownership.
 */

import type { ConsentState, ChangeHistoryEntry } from '@/types/cookie-consent'

export interface ConsentResponse {
  consent: ConsentState
  history: ChangeHistoryEntry[]
}

export interface ConsentHistoryResponse {
  history: ChangeHistoryEntry[]
}

export interface ConsentUpdateResponse {
  success: boolean
}
