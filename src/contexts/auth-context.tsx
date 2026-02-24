/**
 * Auth context - supports Supabase Auth when configured, falls back to mock/API auth.
 * Provides session, login, register, Google OAuth, logout, and role-based state.
 */

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  authApi,
  getStoredToken,
  setStoredToken,
  isApiError,
} from '@/api/auth'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { setCachedSupabaseToken, createWorkspaceForUser } from '@/lib/auth-service'
import type { AuthSession } from '@/types/auth'

interface AuthContextValue {
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
    redirectTo?: string
  ) => Promise<void>
  register: (data: {
    email: string
    password: string
    workspaceName?: string
    agreeToTerms: boolean
  }) => Promise<{ requiresEmailVerification: boolean }>
  googleSignIn: (redirectTo?: string) => Promise<void>
  logout: () => void
  setSession: (session: AuthSession | null) => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function parseMockToken(token: string): AuthSession | null {
  try {
    const payload = token.replace(/^mock_/, '')
    const decoded = JSON.parse(atob(payload))
    return {
      token,
      userId: decoded.userId ?? '',
      workspaceId: decoded.workspaceId ?? null,
      emailVerified: true,
      isAdmin: decoded.isAdmin === true,
      ...(decoded.isAdmin && { role: 'admin' as const }),
    }
  } catch {
    return null
  }
}

/** Map Supabase session to AuthSession */
function supabaseSessionToAuth(session: {
  access_token: string
  user: {
    id: string
    email?: string
    email_confirmed_at?: string | null
    user_metadata?: { workspace_id?: string; is_admin?: boolean }
  }
} | null): AuthSession | null {
  if (!session) return null
  const meta = session.user.user_metadata ?? {}
  const workspaceId = meta.workspace_id ?? null
  const adminFlag = meta.is_admin === true
  return {
    token: session.access_token,
    userId: session.user.id,
    workspaceId,
    emailVerified: !!session.user.email_confirmed_at,
    isAdmin: adminFlag,
    ...(adminFlag && { role: 'admin' as const }),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [session, setSessionState] = React.useState<AuthSession | null>(null)
  const [adminFlag, setAdminFlag] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const updateSession = React.useCallback((authSession: AuthSession | null) => {
    setSessionState(authSession)
    if (isSupabaseConfigured && authSession?.token) {
      setCachedSupabaseToken(authSession.token)
    } else if (!authSession) {
      setCachedSupabaseToken(null)
    }
  }, [])

  React.useEffect(() => {
    async function initSession() {
      const client = isSupabaseConfigured ? supabase : null
      if (client) {
        try {
          const { data: { session: supabaseSession } } = await client.auth.getSession()
          if (supabaseSession) {
            const authSession = supabaseSessionToAuth(supabaseSession)
            if (authSession) {
              updateSession(authSession)
              try {
                const { data: adminRow } = await client
                  .from('admin_users')
                  .select('user_id')
                  .eq('user_id', authSession.userId)
                  .maybeSingle()
                setAdminFlag(!!adminRow)
              } catch {
                setAdminFlag(false)
              }
            } else {
              updateSession(null)
            }
          } else {
            updateSession(null)
          }
        } catch {
          updateSession(null)
        }
      } else {
        setCachedSupabaseToken(null)
        const token = getStoredToken()
        if (token && token.startsWith('mock_')) {
          const parsed = parseMockToken(token)
          setSessionState(parsed)
          setAdminFlag((parsed as AuthSession & { role?: string })?.role === 'admin' || (parsed as { isAdmin?: boolean })?.isAdmin === true)
        } else if (token) {
          setSessionState({
            token,
            userId: '',
            workspaceId: null,
            emailVerified: true,
          })
        } else {
          setSessionState(null)
        }
      }
      setIsLoading(false)
    }
    initSession()
  }, [updateSession])

  React.useEffect(() => {
    const client = isSupabaseConfigured ? supabase : null
    if (!client) return
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (_event, supabaseSession) => {
        if (supabaseSession) {
          const authSession = supabaseSessionToAuth(supabaseSession)
          updateSession(authSession ?? null)
          try {
            const { data: adminRow } = await client
              .from('admin_users')
              .select('user_id')
              .eq('user_id', supabaseSession.user.id)
              .maybeSingle()
            setAdminFlag(!!adminRow)
          } catch {
            setAdminFlag(false)
          }
        } else {
          updateSession(null)
          setAdminFlag(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [updateSession])

  const setSession = React.useCallback((s: AuthSession | null) => {
    updateSession(s)
    if (!s && !isSupabaseConfigured) setStoredToken(null)
  }, [updateSession])

  const login = React.useCallback(
    async (
      email: string,
      password: string,
      rememberMe?: boolean,
      redirectTo?: string
    ) => {
      const client = isSupabaseConfigured ? supabase : null
      if (client) {
        const { data, error } = await client.auth.signInWithPassword({ email, password })
        if (error) throw { message: error.message }
        if (data.session) {
          const authSession = supabaseSessionToAuth(data.session)
          updateSession(authSession)
          toast.success('Welcome back!')
          navigate(redirectTo ?? '/dashboard', { replace: true })
        }
      } else {
        const res = await authApi.login({ email, password, rememberMe })
        setSessionState({
          token: res.token,
          userId: res.userId,
          workspaceId: res.workspaceId,
          emailVerified: res.emailVerified,
          isAdmin: res.isAdmin,
        })
        toast.success('Welcome back!')
        navigate(redirectTo ?? '/dashboard', { replace: true })
      }
    },
    [navigate]
  )

  const register = React.useCallback(
    async (data: {
      email: string
      password: string
      workspaceName?: string
      agreeToTerms: boolean
    }) => {
      const client = isSupabaseConfigured ? supabase : null
      if (client) {
        const { data: signUpData, error } = await client.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { workspace_name: data.workspaceName },
          },
        })
        if (error) throw { message: error.message }
        const requiresEmailVerification = !signUpData.session && !!signUpData.user
        if (signUpData.session && signUpData.user) {
          const authSession = supabaseSessionToAuth(signUpData.session)
          if (!authSession) {
            updateSession(null)
          } else {
            try {
              const { workspaceId } = await createWorkspaceForUser(
                signUpData.user.id,
                data.workspaceName || 'My Workspace'
              )
              const sessionWithWorkspace: AuthSession = {
                token: authSession.token,
                userId: authSession.userId,
                workspaceId,
                emailVerified: authSession.emailVerified,
                ...(authSession.role && { role: authSession.role }),
              }
              updateSession(sessionWithWorkspace)
            toast.success('Account created! Redirecting to dashboard…')
            navigate('/dashboard', { replace: true })
          } catch {
              const fallback = supabaseSessionToAuth(signUpData.session)
              updateSession(fallback)
            }
            toast.success('Account created! Redirecting to dashboard…')
            navigate('/dashboard', { replace: true })
          }
        }
        return { requiresEmailVerification }
      } else {
        const res = await authApi.register({
          email: data.email,
          password: data.password,
          workspaceName: data.workspaceName,
          agreeToTerms: data.agreeToTerms,
        })
        setSessionState({
          token: res.token,
          userId: res.userId,
          workspaceId: res.workspaceId,
          emailVerified: !res.requiresEmailVerification,
          isAdmin: (res as { isAdmin?: boolean }).isAdmin,
        })
        if (!res.requiresEmailVerification) {
          navigate('/dashboard', { replace: true })
        }
        return { requiresEmailVerification: res.requiresEmailVerification }
      }
    },
    [navigate]
  )

  const googleSignIn = React.useCallback(
    async (redirectTo?: string) => {
      const client = isSupabaseConfigured ? supabase : null
      if (client) {
        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo ?? '/dashboard')}`,
          },
        })
        if (error) throw { message: error.message }
      } else {
        const mockIdToken = `mock_google_${btoa(JSON.stringify({ email: 'user@example.com', sub: 'google_123' }))}`
        const res = await authApi.googleSignIn({ idToken: mockIdToken })
        setSessionState({
          token: res.token,
          userId: res.userId,
          workspaceId: res.workspaceId,
          emailVerified: res.emailVerified,
          isAdmin: res.isAdmin,
        })
        toast.success('Welcome back!')
        navigate(redirectTo ?? '/dashboard', { replace: true })
      }
    },
    [navigate]
  )

  const logout = React.useCallback(() => {
    const client = isSupabaseConfigured ? supabase : null
    if (client) {
      client.auth.signOut()
    }
    setStoredToken(null)
    setCachedSupabaseToken(null)
    setSessionState(null)
    setAdminFlag(false)
    toast.success('Signed out successfully')
    navigate('/auth/login', { replace: true })
  }, [navigate])

  const value: AuthContextValue = {
    session,
    isLoading,
    isAuthenticated: !!session?.token,
    isAdmin: adminFlag || session?.isAdmin === true || (session as AuthSession & { role?: string })?.role === 'admin',
    login,
    register,
    googleSignIn,
    logout,
    setSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useAuthOptional() {
  return React.useContext(AuthContext)
}

export { isApiError }
