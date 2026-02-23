/** Validation helpers for Settings module */

const DOMAIN_PREFIX_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export function validateDomainPrefix(value: string): { valid: boolean; error?: string } {
  if (!value.trim()) return { valid: true }
  if (value.length < 3 || value.length > 63) {
    return { valid: false, error: 'Must be 3–63 characters' }
  }
  if (!DOMAIN_PREFIX_REGEX.test(value)) {
    return { valid: false, error: 'Use alphanumeric and hyphens only' }
  }
  return { valid: true }
}

export function validateHexColor(value: string): { valid: boolean; error?: string } {
  if (!value.trim()) return { valid: true }
  if (!HEX_COLOR_REGEX.test(value)) {
    return { valid: false, error: 'Use 6-digit hex (e.g. #195C4A)' }
  }
  return { valid: true }
}

export function validateApiKeyName(value: string): { valid: boolean; error?: string } {
  if (!value.trim()) return { valid: false, error: 'Name is required' }
  if (value.length > 64) return { valid: false, error: 'Max 64 characters' }
  return { valid: true }
}

export function validateWebhookUrl(value: string): { valid: boolean; error?: string } {
  if (!value.trim()) return { valid: false, error: 'URL is required' }
  try {
    new URL(value)
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL' }
  }
}
