/**
 * Unified auth service - uses Supabase Auth when configured, falls back to mock/API.
 * Handles: signup, login, logout, OAuth, session, workspace creation.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getStoredToken } from '@/api/auth'

export type AuthMode = 'supabase' | 'mock'

export function getAuthMode(): AuthMode {
  return isSupabaseConfigured ? 'supabase' : 'mock'
}

/** Get current access token for API requests (async - for initial load) */
export async function getAccessTokenAsync(): Promise<string | null> {
  if (getAuthMode() === 'supabase' && supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }
  return getStoredToken()
}

/** Synchronous token getter for api.ts - uses cached value from auth context */
let cachedSupabaseToken: string | null = null
export function getAccessTokenSync(): string | null {
  if (getAuthMode() === 'supabase') {
    return cachedSupabaseToken
  }
  return getStoredToken()
}
export function setCachedSupabaseToken(token: string | null): void {
  cachedSupabaseToken = token
}

/** Create workspace for new user (Supabase) */
export async function createWorkspaceForUser(
  userId: string,
  workspaceName: string
): Promise<{ workspaceId: string }> {
  const client = isSupabaseConfigured ? supabase : null
  if (!client) {
    throw new Error('Supabase not configured')
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: workspaceData, error: wsError } = await (client as any)
    .from('workspaces')
    .insert({ name: workspaceName || 'My Workspace', owner_user_id: userId })
    .select('id')
    .single()

  if (wsError) throw new Error(String(wsError))
  const wsId = (workspaceData as { id: string } | null)?.id
  if (!wsId) throw new Error('Failed to create workspace')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: linkError } = await (client as any)
    .from('user_workspace_links')
    .insert({ user_id: userId, workspace_id: wsId, role: 'owner', status: 'active' })

  if (linkError) throw new Error(String(linkError))

  return { workspaceId: wsId }
}
