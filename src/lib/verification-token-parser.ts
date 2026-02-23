/**
 * VerificationTokenParser - extracts and validates email verification token from URL.
 * Supports query string (?token=...) and path params.
 */

const TOKEN_MIN_LENGTH = 10
const TOKEN_MAX_LENGTH = 512
/** Alphanumeric, hyphens, underscores, plus, equals - common token/base64 character set */
const TOKEN_PATTERN = /^[-a-zA-Z0-9_+=]+$/

export interface ParseResult {
  token: string | null
  isValid: boolean
  error?: string
}

/**
 * Extract token from URL search params (?token=...)
 */
export function parseTokenFromSearchParams(searchParams: URLSearchParams): ParseResult {
  const token = searchParams.get('token')?.trim() ?? null
  return validateToken(token)
}

/**
 * Extract token from path (e.g. /verify/TOKEN)
 */
export function parseTokenFromPath(pathname: string): ParseResult {
  const segments = pathname.split('/').filter(Boolean)
  const verifyIndex = segments.indexOf('verify')
  const token =
    verifyIndex >= 0 && segments[verifyIndex + 1]
      ? segments[verifyIndex + 1].trim()
      : null
  return validateToken(token)
}

/**
 * Validate token format: non-empty, allowed chars, length within bounds.
 */
export function validateToken(token: string | null): ParseResult {
  if (!token || token.length === 0) {
    return { token: null, isValid: false, error: 'Token is required' }
  }
  if (token.length < TOKEN_MIN_LENGTH) {
    return { token: null, isValid: false, error: 'Token format is invalid' }
  }
  if (token.length > TOKEN_MAX_LENGTH) {
    return { token: null, isValid: false, error: 'Token format is invalid' }
  }
  if (!TOKEN_PATTERN.test(token)) {
    return { token: null, isValid: false, error: 'Token contains invalid characters' }
  }
  return { token, isValid: true }
}
