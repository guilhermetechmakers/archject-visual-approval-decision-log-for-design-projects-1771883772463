const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface ApiError {
  message: string
  code?: string
  status?: number
  cooldownSeconds?: number
}

/** Cached auth token for API requests - updated by auth context and Supabase listener */
let cachedAuthToken: string | null = null
export function setCachedAuthToken(token: string | null) {
  cachedAuthToken = token
}
export function getCachedAuthToken() {
  return cachedAuthToken
}

/** Get auth token for API requests - sync getter */
let getAuthToken: (() => string | null) | null = null
export function setAuthTokenGetter(fn: () => string | null) {
  getAuthToken = fn
}

function resolveAuthToken(): string | null {
  if (cachedAuthToken) return cachedAuthToken
  return getAuthToken?.() ?? null
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: response.statusText,
      status: response.status,
    }
    try {
      const data = await response.json()
      if (data.message) error.message = data.message
      if (data.code) error.code = data.code
      if (typeof data.cooldownSeconds === 'number') error.cooldownSeconds = data.cooldownSeconds
    } catch {
      // Use default error message
    }
    throw error
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }
  return response.text() as unknown as T
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = resolveAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  }
  const response = await fetch(url, config)
  return handleResponse<T>(response)
}

export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'DELETE' }),
}
