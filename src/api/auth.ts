/**
 * Auth API layer - uses native fetch via apiClient.
 * In development, falls back to mock responses when no backend is configured.
 */

import { api } from '@/lib/api'
import type { ApiError } from '@/lib/api'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GoogleSignInRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  CreateWorkspaceRequest,
} from '@/types/auth'

const USE_MOCK = !import.meta.env.VITE_API_URL

/** Mock auth storage for development - in production use httpOnly cookies */
const MOCK_STORAGE_KEY = 'archject_mock_session'

export function getStoredToken(): string | null {
  if (USE_MOCK) {
    return sessionStorage.getItem(MOCK_STORAGE_KEY)
  }
  return sessionStorage.getItem('archject_token')
}

export function setStoredToken(token: string | null): void {
  if (USE_MOCK) {
    if (token) sessionStorage.setItem(MOCK_STORAGE_KEY, token)
    else sessionStorage.removeItem(MOCK_STORAGE_KEY)
  } else {
    if (token) sessionStorage.setItem('archject_token', token)
    else sessionStorage.removeItem('archject_token')
  }
}

/** Mock implementation for development/demo */
async function mockRegister(_data: RegisterRequest): Promise<RegisterResponse> {
  await new Promise((r) => setTimeout(r, 600))
  const userId = `user_${Date.now()}`
  const workspaceId = `ws_${Date.now()}`
  const token = `mock_${btoa(JSON.stringify({ userId, workspaceId }))}`
  setStoredToken(token)
  return {
    userId,
    workspaceId,
    requiresEmailVerification: true,
    token,
  }
}

async function mockLogin(_data: LoginRequest): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 500))
  const userId = `user_${Date.now()}`
  const workspaceId = `ws_${Date.now()}`
  const token = `mock_${btoa(JSON.stringify({ userId, workspaceId }))}`
  setStoredToken(token)
  return {
    token,
    userId,
    workspaceId,
    emailVerified: true,
  }
}

async function mockGoogleSignIn(_data: GoogleSignInRequest): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 500))
  const userId = `user_oauth_${Date.now()}`
  const workspaceId = `ws_${Date.now()}`
  const token = `mock_${btoa(JSON.stringify({ userId, workspaceId }))}`
  setStoredToken(token)
  return {
    token,
    userId,
    workspaceId,
    emailVerified: true,
  }
}

async function mockForgotPassword(_data: ForgotPasswordRequest): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 400))
  return { success: true }
}

async function mockResetPassword(_data: ResetPasswordRequest): Promise<{ success: boolean }> {
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

/** Real API calls - used when VITE_API_URL is set */
async function realRegister(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/auth/register', data)
  if (res?.token) setStoredToken(res.token)
  return res as RegisterResponse
}

async function realLogin(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', data)
  if (res?.token) setStoredToken(res.token)
  return res as LoginResponse
}

async function realGoogleSignIn(data: GoogleSignInRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/google-signin', data)
  if (res?.token) setStoredToken(res.token)
  return res as LoginResponse
}

export const authApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    USE_MOCK ? mockRegister(data) : realRegister(data),

  login: (data: LoginRequest): Promise<LoginResponse> =>
    USE_MOCK ? mockLogin(data) : realLogin(data),

  googleSignIn: (data: GoogleSignInRequest): Promise<LoginResponse> =>
    USE_MOCK ? mockGoogleSignIn(data) : realGoogleSignIn(data),

  forgotPassword: (data: ForgotPasswordRequest): Promise<{ success: boolean }> =>
    USE_MOCK ? mockForgotPassword(data) : api.post<{ success: boolean }>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest): Promise<{ success: boolean }> =>
    USE_MOCK ? mockResetPassword(data) : api.post<{ success: boolean }>('/auth/reset-password', data),

  verifyEmail: (data: VerifyEmailRequest): Promise<{ success: boolean }> =>
    USE_MOCK ? mockVerifyEmail(data) : api.post<{ success: boolean }>('/auth/verify-email', data),

  resendVerification: (data: { email: string }): Promise<{ success: boolean }> =>
    USE_MOCK ? mockResendVerification(data) : api.post<{ success: boolean }>('/auth/resend-verification', data),

  createWorkspace: (data: CreateWorkspaceRequest) =>
    api.post<{ id: string; name: string }>('/workspaces/create', data),
}

export function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'message' in e
}
