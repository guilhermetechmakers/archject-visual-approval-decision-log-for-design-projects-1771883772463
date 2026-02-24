/**
 * 2FA API - Calls Supabase Edge Functions (2fa-*) for Two-Factor Authentication
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface TwoFAStatus {
  isEnabled: boolean
  method: 'totp' | 'sms' | null
  phoneNumber: string | null
}

export interface SetupTotpResponse {
  secret: string
  otpauthUrl: string
}

export interface VerifyTotpResponse {
  success: boolean
  message: string
  recoveryCodes: string[]
}

export interface VerifySmsResponse {
  success: boolean
  message: string
  recoveryCodes: string[]
}

export interface EnrollSmsResponse {
  success: boolean
  message: string
  smsSent: boolean
}

export interface RegenerateRecoveryCodesResponse {
  success: boolean
  message: string
  codes: string[]
}

export interface TwoFAAuditLog {
  id: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

export interface TwoFAAuditResponse {
  logs: TwoFAAuditLog[]
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  if (err && typeof err === 'object' && 'context' in err) {
    const ctx = (err as { context?: { body?: { message?: string } } }).context
    if (ctx?.body?.message) return ctx.body.message
  }
  return 'An error occurred'
}

async function invoke<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured')
  }
  const { data, error } = await supabase.functions.invoke(name, { body: body ?? {} })
  if (error) {
    throw { message: getErrorMessage(error) }
  }
  return data as T
}

export const twoFaApi = {
  getStatus: () => invoke<TwoFAStatus>('2fa-status'),
  setupTOTP: () => invoke<SetupTotpResponse>('2fa-setup-totp'),
  verifyTOTP: (code: string, secret: string) =>
    invoke<VerifyTotpResponse>('2fa-verify-totp', { code, secret }),
  enrollSMS: (phoneNumber: string) =>
    invoke<EnrollSmsResponse>('2fa-enroll-sms', { phoneNumber }),
  verifySMS: (code: string) =>
    invoke<VerifySmsResponse>('2fa-verify-sms', { code }),
  disable: (password: string) =>
    invoke<{ success: boolean; message: string }>('2fa-disable', { password }),
  regenerateRecoveryCodes: (password: string) =>
    invoke<RegenerateRecoveryCodesResponse>('2fa-recovery-codes-regenerate', { password }),
  getAuditLogs: (params?: { limit?: number; offset?: number }) =>
    invoke<TwoFAAuditResponse>('2fa-audit', params ?? {}),
}
