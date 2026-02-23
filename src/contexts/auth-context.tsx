import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  authApi,
  getStoredToken,
  setStoredToken,
  isApiError,
} from '@/api/auth'

/** Clear all stored auth tokens (session + persistent) */
function clearStoredToken(): void {
  setStoredToken(null)
}
import type { AuthSession } from '@/types/auth'

interface AuthContextValue {
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
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
  googleSignIn: (idToken: string, redirectTo?: string) => Promise<void>
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
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [session, setSessionState] = React.useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const token = getStoredToken()
    if (token && token.startsWith('mock_')) {
      const parsed = parseMockToken(token)
      setSessionState(parsed)
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
    setIsLoading(false)
  }, [])

  const setSession = React.useCallback((s: AuthSession | null) => {
    setSessionState(s)
    if (!s) clearStoredToken()
  }, [])

  const login = React.useCallback(
    async (
      email: string,
      password: string,
      rememberMe?: boolean,
      redirectTo?: string
    ) => {
      const res = await authApi.login({ email, password, rememberMe })
      setSessionState({
        token: res.token,
        userId: res.userId,
        workspaceId: res.workspaceId,
        emailVerified: res.emailVerified,
      })
      toast.success('Welcome back!')
      navigate(redirectTo ?? '/dashboard', { replace: true })
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
      })
      if (!res.requiresEmailVerification) {
        navigate('/dashboard', { replace: true })
      }
      return { requiresEmailVerification: res.requiresEmailVerification }
    },
    [navigate]
  )

  const googleSignIn = React.useCallback(
    async (idToken: string, redirectTo?: string) => {
      const res = await authApi.googleSignIn({ idToken })
      setSessionState({
        token: res.token,
        userId: res.userId,
        workspaceId: res.workspaceId,
        emailVerified: res.emailVerified,
      })
      toast.success('Welcome back!')
      navigate(redirectTo ?? '/dashboard', { replace: true })
    },
    [navigate]
  )

  const logout = React.useCallback(() => {
    clearStoredToken()
    setSessionState(null)
    toast.success('Signed out successfully')
    navigate('/auth/login', { replace: true })
  }, [navigate])

  const value: AuthContextValue = {
    session,
    isLoading,
    isAuthenticated: !!session?.token,
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
