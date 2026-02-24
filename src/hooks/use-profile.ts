/**
 * Profile page hooks - connected OAuth accounts.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface ConnectedAccount {
  provider: string
  email?: string
  connectedAt?: string
}

const MOCK_ACCOUNTS: ConnectedAccount[] = [
  { provider: 'google', email: 'user@studio.com', connectedAt: '2025-01-15T10:00:00Z' },
]

const PROFILE_KEYS = ['profile', 'connected-accounts'] as const

async function fetchConnectedAccounts(): Promise<ConnectedAccount[]> {
  try {
    const { api } = await import('@/lib/api')
    const res = await api.get<ConnectedAccount[]>('/profile/connected-accounts')
    return res ?? []
  } catch {
    return MOCK_ACCOUNTS
  }
}

export function useConnectedAccounts() {
  return useQuery({
    queryKey: [...PROFILE_KEYS],
    queryFn: fetchConnectedAccounts,
    staleTime: 60 * 1000,
  })
}

export function useLinkOAuth() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (provider: string) => {
      const { api } = await import('@/lib/api')
      await api.post('/profile/oauth/link', { provider })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEYS })
      toast.success('Account linked')
    },
    onError: () => toast.error('Failed to link account'),
  })
}

export function useUnlinkOAuth() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (provider: string) => {
      const { api } = await import('@/lib/api')
      await api.post('/profile/oauth/unlink', { provider })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEYS })
      toast.success('Account unlinked')
    },
    onError: () => toast.error('Failed to unlink account'),
  })
}
