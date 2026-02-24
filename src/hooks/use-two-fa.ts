/**
 * 2FA React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { twoFaApi, type VerifyTotpResponse } from '@/api/two-fa'
import { isSupabaseConfigured } from '@/lib/supabase'

const TWO_FA_KEYS = ['two-fa'] as const

export function useTwoFAStatus() {
  return useQuery({
    queryKey: [...TWO_FA_KEYS, 'status'],
    queryFn: () => twoFaApi.getStatus(),
    enabled: isSupabaseConfigured,
  })
}

export function useTwoFASetupTOTP() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => twoFaApi.setupTOTP(),
    onSuccess: () => qc.invalidateQueries({ queryKey: TWO_FA_KEYS }),
  })
}

export function useTwoFAVerifyTOTP() {
  const qc = useQueryClient()
  return useMutation<VerifyTotpResponse, Error, { code: string; secret: string }>({
    mutationFn: ({ code, secret }) => twoFaApi.verifyTOTP(code, secret),
    onSuccess: () => qc.invalidateQueries({ queryKey: TWO_FA_KEYS }),
  })
}

export function useTwoFAEnrollSMS() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (phoneNumber: string) => twoFaApi.enrollSMS(phoneNumber),
    onSuccess: () => qc.invalidateQueries({ queryKey: TWO_FA_KEYS }),
  })
}

export function useTwoFAVerifySMS() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => twoFaApi.verifySMS(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: TWO_FA_KEYS }),
  })
}

export function useTwoFADisable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (password: string) => twoFaApi.disable(password),
    onSuccess: () => qc.invalidateQueries({ queryKey: TWO_FA_KEYS }),
  })
}

export function useTwoFARegenerateRecoveryCodes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (password: string) => twoFaApi.regenerateRecoveryCodes(password),
    onSuccess: () => qc.invalidateQueries({ queryKey: TWO_FA_KEYS }),
  })
}

export function useTwoFAAuditLogs(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...TWO_FA_KEYS, 'audit', params],
    queryFn: () => twoFaApi.getAuditLogs(params),
    enabled: isSupabaseConfigured,
  })
}
