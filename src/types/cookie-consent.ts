/**
 * Cookie consent types for the Cookie Policy page.
 * Used for localStorage persistence and future API integration.
 */

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences'

export type ConsentAction = 'opt-in' | 'opt-out'

export interface ConsentState {
  necessary: true
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export interface ChangeHistoryEntry {
  timestamp: string
  category: Exclude<CookieCategory, 'necessary'>
  action: ConsentAction
}

export interface StoredConsentData {
  consent: ConsentState
  history: ChangeHistoryEntry[]
}

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
}
