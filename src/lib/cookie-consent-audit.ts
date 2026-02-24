/**
 * Audit trail logger for cookie consent changes.
 * Generates Change History entries when consent is updated.
 */

import type {
  ChangeHistoryEntry,
  ConsentAction,
} from '@/types/cookie-consent'

/**
 * Create a change history entry for a consent update.
 */
export function createHistoryEntry(
  category: Exclude<'necessary' | 'analytics' | 'marketing' | 'preferences', 'necessary'>,
  action: ConsentAction
): ChangeHistoryEntry {
  return {
    timestamp: new Date().toISOString(),
    category,
    action,
  }
}

/**
 * Generate history entries for a consent delta (before -> after).
 * Used when saving preferences to log what changed.
 */
export function diffConsentToHistory(
  before: { analytics: boolean; marketing: boolean; preferences: boolean },
  after: { analytics: boolean; marketing: boolean; preferences: boolean }
): ChangeHistoryEntry[] {
  const entries: ChangeHistoryEntry[] = []
  const categories = ['analytics', 'marketing', 'preferences'] as const

  for (const cat of categories) {
    const prev = before[cat]
    const next = after[cat]
    if (prev !== next) {
      entries.push(
        createHistoryEntry(cat, next ? 'opt-in' : 'opt-out')
      )
    }
  }

  return entries
}

/**
 * Generate history entries for "Accept All" action.
 */
export function createAcceptAllEntries(): ChangeHistoryEntry[] {
  return [
    createHistoryEntry('analytics', 'opt-in'),
    createHistoryEntry('marketing', 'opt-in'),
    createHistoryEntry('preferences', 'opt-in'),
  ]
}

/**
 * Generate history entries for "Reset to Defaults" action.
 */
export function createResetEntries(
  before: { analytics: boolean; marketing: boolean; preferences: boolean }
): ChangeHistoryEntry[] {
  const entries: ChangeHistoryEntry[] = []
  const categories = ['analytics', 'marketing', 'preferences'] as const

  for (const cat of categories) {
    if (before[cat]) {
      entries.push(createHistoryEntry(cat, 'opt-out'))
    }
  }

  return entries
}
