/**
 * LocalStorage service for cookie consent preferences.
 * Persists consent state and change history. No external APIs.
 */

import type {
  ConsentState,
  ChangeHistoryEntry,
  StoredConsentData,
} from '@/types/cookie-consent'
import { DEFAULT_CONSENT } from '@/types/cookie-consent'

const STORAGE_KEY = 'archject-cookie-consent'

function getStored(): StoredConsentData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredConsentData
    if (!parsed.consent || !Array.isArray(parsed.history)) return null
    return parsed
  } catch {
    return null
  }
}

function setStored(data: StoredConsentData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Load consent state from localStorage.
 * Returns default consent if nothing stored.
 */
export function loadConsent(): ConsentState {
  const stored = getStored()
  if (!stored) return { ...DEFAULT_CONSENT }
  return {
    necessary: true,
    analytics: stored.consent.analytics ?? DEFAULT_CONSENT.analytics,
    marketing: stored.consent.marketing ?? DEFAULT_CONSENT.marketing,
    preferences: stored.consent.preferences ?? DEFAULT_CONSENT.preferences,
  }
}

/**
 * Load change history from localStorage.
 */
export function loadHistory(): ChangeHistoryEntry[] {
  const stored = getStored()
  if (!stored || !Array.isArray(stored.history)) return []
  return stored.history.filter(
    (e): e is ChangeHistoryEntry =>
      typeof e.timestamp === 'string' &&
      typeof e.category === 'string' &&
      (e.action === 'opt-in' || e.action === 'opt-out')
  )
}

/**
 * Save consent state and optionally append history entries.
 */
export function saveConsent(
  consent: ConsentState,
  newEntries: ChangeHistoryEntry[] = []
): void {
  const existing = getStored()
  const history = existing?.history ?? []
  const updatedHistory = [...history, ...newEntries]
  setStored({
    consent: {
      necessary: true,
      analytics: consent.analytics,
      marketing: consent.marketing,
      preferences: consent.preferences,
    },
    history: updatedHistory,
  })
}

/**
 * Export consent state for future API integration.
 */
export function exportConsentState(): StoredConsentData {
  const stored = getStored()
  if (!stored) {
    return {
      consent: { ...DEFAULT_CONSENT },
      history: [],
    }
  }
  return { ...stored }
}
