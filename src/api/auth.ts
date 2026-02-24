/**
 * Auth API layer - uses native fetch via apiClient.
 * In development, falls back to mock responses when no backend is configured.
 */

import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GoogleSignInRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  CreateWorkspaceRequest,
  VerifyTokenRequest,
  VerifyTokenResponse,
  ResendVerificationTokenRequest,
  ResendVerificationTokenResponse,
} from '@/types/auth'

const USE_MOCK = !import.meta.env.VITE_API_URL

/** Mock auth storage for development - in production use httpOnly cookies */
const MOCK_STORAGE_KEY = 'archject_mock_session'
const MOCK_STORAGE_KEY_PERSIST = 'archject_mock_session_persist'
const TOKEN_KEY = 'archject_token'
const TOKEN_KEY_PERSIST = 'archject_token_persist'

function getStorageKey(persist: boolean): string {
  if (USE_MOCK) return persist ? MOCK_STORAGE_KEY_PERSIST : MOCK_STORAGE_KEY
  return persist ? TOKEN_KEY_PERSIST : TOKEN_KEY
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  const sessionKey = getStorageKey(false)
  const persistKey = getStorageKey(true)
  return localStorage.getItem(persistKey) ?? sessionStorage.getItem(sessionKey) ?? null
}

export function setStoredToken(token: string | null, rememberMe?: boolean): void {
  const sessionKey = getStorageKey(false)
  const persistKey = getStorageKey(true)
  if (token) {
    if (rememberMe) {
      localStorage.setItem(persistKey, token)
      sessionStorage.removeItem(sessionKey)
    } else {
      sessionStorage.setItem(sessionKey, token)
      localStorage.removeItem(persistKey)
    }
  } else {
    sessionStorage.removeItem(sessionKey)
    localStorage.removeItem(persistKey)
  }
}

/** Mock implementation for development/demo */
async function mockRegister(data: RegisterRequest): Promise<RegisterResponse> {
  await new Promise((r) => setTimeout(r, 600))
  const userId = `user_${Date.now()}`
  const workspaceId = `ws_${Date.now()}`
  const isAdmin = data.email?.toLowerCase().includes('admin@') ?? false
  const token = `mock_${btoa(JSON.stringify({ userId, workspaceId, isAdmin }))}`
  setStoredToken(token, false)
  return {
    userId,
    workspaceId,
    requiresEmailVerification: true,
    token,
    isAdmin,
  } as RegisterResponse & { isAdmin?: boolean }
}

async function mockLogin(data: LoginRequest): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 500))
  const userId = `user_${Date.now()}`
  const workspaceId = `ws_${Date.now()}`
  const isAdmin = data.email?.toLowerCase().includes('admin@') ?? false
  const token = `mock_${btoa(JSON.stringify({ userId, workspaceId, isAdmin }))}`
  setStoredToken(token, data.rememberMe)
  return {
    token,
    userId,
    workspaceId,
    emailVerified: true,
    isAdmin,
  }
}

async function mockGoogleSignIn(_data: GoogleSignInRequest): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 500))
  const userId = `user_oauth_${Date.now()}`
  const workspaceId = `ws_${Date.now()}`
  const isAdmin = _data.idToken?.includes('admin') ?? false
  const token = `mock_${btoa(JSON.stringify({ userId, workspaceId, isAdmin }))}`
  setStoredToken(token, true)
  return {
    token,
    userId,
    workspaceId,
    emailVerified: true,
    isAdmin,
  }
}

async function mockForgotPassword(_data: ForgotPasswordRequest): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 400))
  return { success: true }
}

async function mockResetPassword(
  _data: ResetPasswordRequest
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 400))
  return { success: true }
}

async function mockVerifyEmail(_data: VerifyEmailRequest): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 300))
  return { success: true }
}

async function mockResendVerification(_data: { email: string }): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 300))
  return { success: true }
}

async function mockVerifyToken(
  data: VerifyTokenRequest
): Promise<VerifyTokenResponse> {
  await new Promise((r) => setTimeout(r, 800))
  if (!data.token || data.token.length < 10) {
    return {
      success: false,
      verified: false,
      message: 'Verification link is invalid or expired.',
    }
  }
  return {
    success: true,
    verified: true,
    userId: `user_${Date.now()}`,
    message: 'Your email has been verified.',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  }
}

async function mockResendVerificationToken(
  _data: ResendVerificationTokenRequest
): Promise<ResendVerificationTokenResponse> {
  await new Promise((r) => setTimeout(r, 400))
  return {
    success: true,
    cooldownSeconds: 60,
    message: 'A new verification email has been sent.',
  }
}

async function mockChangePassword(_data: ChangePasswordRequest): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 400))
  return { success: true }
}

/** Real API calls - used when VITE_API_URL is set */
async function realRegister(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/auth/register', data)
  if (res?.token) setStoredToken(res.token, false)
  return res as RegisterResponse
}

async function realLogin(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', data)
  if (res?.token) setStoredToken(res.token, data.rememberMe)
  return res as LoginResponse
}

async function realGoogleSignIn(data: GoogleSignInRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/google-signin', data)
  if (res?.token) setStoredToken(res.token, true)
  return res as LoginResponse
}

export const authApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    USE_MOCK ? mockRegister(data) : realRegister(data),

  login: (data: LoginRequest): Promise<LoginResponse> =>
    USE_MOCK ? mockLogin(data) : realLogin(data),

  googleSignIn: (data: GoogleSignInRequest): Promise<LoginResponse> =>
    USE_MOCK ? mockGoogleSignIn(data) : realGoogleSignIn(data),

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ success: boolean }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.functions.invoke('auth-forgot-password', {
        body: { email: data.email, workspace_id: data.workspace_id },
      })
      if (error) {
        const msg = (error as { message?: string; context?: { body?: { message?: string } } })?.context?.body?.message
          ?? (error as { message?: string }).message
          ?? 'Failed to send reset link'
        throw { message: msg }
      }
      return { success: true }
    }
    if (USE_MOCK) return mockForgotPassword(data)
    return api.post<{ success: boolean }>('/auth/forgot-password', data)
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ success: boolean }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.functions.invoke('auth-reset-password', {
        body: {
          token: data.token,
          new_password: data.newPassword,
          confirm_password: data.confirmPassword,
        },
      })
      if (error) {
        const msg = (error as { message?: string; context?: { body?: { message?: string } } })?.context?.body?.message
          ?? (error as { message?: string }).message
          ?? 'Failed to reset password'
        throw { message: msg }
      }
      return { success: true }
    }
    if (USE_MOCK) return mockResetPassword(data)
    return api.post<{ success: boolean }>('/auth/reset-password', data)
  },

  verifyEmail: (data: VerifyEmailRequest): Promise<{ success: boolean }> =>
    USE_MOCK ? mockVerifyEmail(data) : api.post<{ success: boolean }>('/auth/verify-email', data),

  resendVerification: (data: { email: string }): Promise<{ success: boolean }> =>
    USE_MOCK ? mockResendVerification(data) : api.post<{ success: boolean }>('/auth/resend-verification', data),

  verifyToken: (data: VerifyTokenRequest): Promise<VerifyTokenResponse> =>
    USE_MOCK ? mockVerifyToken(data) : api.post<VerifyTokenResponse>('/auth/verify-token', data),

  resendVerificationToken: (
    data: ResendVerificationTokenRequest
  ): Promise<ResendVerificationTokenResponse> =>
    USE_MOCK
      ? mockResendVerificationToken(data)
      : api.post<ResendVerificationTokenResponse>('/auth/resend-verification', data),

  createWorkspace: (data: CreateWorkspaceRequest) =>
    api.post<{ id: string; name: string }>('/workspaces/create', data),

  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.functions.invoke('auth-change-password', {
        body: {
          current_password: data.currentPassword,
          new_password: data.newPassword,
          confirm_password: data.confirmPassword,
        },
      })
      if (error) {
        const err = error as { message?: string; context?: { body?: { message?: string } } }
        const msg = err?.context?.body?.message ?? err?.message ?? 'Failed to change password'
        throw { message: msg }
      }
      return { success: true }
    }
    if (USE_MOCK) return mockChangePassword(data)
    return api.post<{ success: boolean }>('/auth/change-password', data)
  },

  validateResetToken: async (token: string): Promise<{ valid: boolean; expires_at?: string; used?: boolean }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.functions.invoke('validate-reset-token', {
        body: { token },
      })
      if (error) return { valid: false }
      const res = data as { valid?: boolean; expires_at?: string; used?: boolean } | null
      return res ? { valid: !!res.valid, expires_at: res.expires_at, used: res.used } : { valid: false }
    }
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200))
      return { valid: !!token && token.length > 10 }
    }
    const res = await api.get<{ valid: boolean; expires_at?: string; used?: boolean }>(
      `/auth/validate-reset-token?token=${encodeURIComponent(token)}`
    )
    return res ?? { valid: false }
  },
}

export function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'message' in e
}
